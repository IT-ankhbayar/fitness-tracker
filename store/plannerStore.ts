// Planner store - Manage pre-workout planned exercises state

import { create } from 'zustand';
import { Exercise } from '../types/database';
import { exerciseService } from '../services/exerciseService';
import { planService } from '../services/planService';

interface PlannerState {
  plannedExerciseIds: number[];
  plannedExercises: Exercise[]; // detailed for UI
  isSaving: boolean;

  addExercises: (exerciseIds: number[]) => Promise<void>;
  removeExercise: (exerciseId: number) => void;
  reorderExercises: (orderedExerciseIds: number[]) => void;
  clear: () => void;
  savePlan: (name?: string, notes?: string) => Promise<void>;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  plannedExerciseIds: [],
  plannedExercises: [],
  isSaving: false,

  addExercises: async (exerciseIds: number[]) => {
    const unique = Array.from(new Set([...get().plannedExerciseIds, ...exerciseIds]));

    // Load details for newly added exercises
    const currentIds = new Set(get().plannedExerciseIds);
    const newIds = exerciseIds.filter((id) => !currentIds.has(id));
    const newDetails: Exercise[] = [];
    for (const id of newIds) {
      const ex = await exerciseService.getById(id);
      if (ex) newDetails.push(ex);
    }

    set((state) => ({
      plannedExerciseIds: unique,
      plannedExercises: [...state.plannedExercises, ...newDetails],
    }));
  },

  removeExercise: (exerciseId: number) => {
    set((state) => ({
      plannedExerciseIds: state.plannedExerciseIds.filter((id) => id !== exerciseId),
      plannedExercises: state.plannedExercises.filter((ex) => ex.id !== exerciseId),
    }));
  },

  reorderExercises: (orderedExerciseIds: number[]) => {
    const idToExercise = new Map(get().plannedExercises.map((e) => [e.id, e] as const));
    const ordered = orderedExerciseIds.map((id) => idToExercise.get(id)!).filter(Boolean) as Exercise[];
    set({ plannedExerciseIds: orderedExerciseIds, plannedExercises: ordered });
  },

  clear: () => set({ plannedExerciseIds: [], plannedExercises: [] }),

  savePlan: async (name?: string, notes?: string) => {
    const { plannedExerciseIds } = get();
    if (plannedExerciseIds.length === 0) return;

    set({ isSaving: true });
    try {
      const plan = await planService.create(name, notes);
      await planService.addExercises(plan.id, plannedExerciseIds);
      // Optionally keep the plan in memory or clear after save
      set({ isSaving: false });
    } catch (e) {
      set({ isSaving: false });
      throw e;
    }
  },
}));
