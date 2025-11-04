// History store - manage past workouts list and pagination

import { create } from 'zustand';
import { Set, Workout } from '../types/database';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import { useWorkoutStore } from './workoutStore';

interface WorkoutListItem extends Workout {
  exercise_count: number;
}

interface HistoryState {
  items: WorkoutListItem[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  pageSize: number;

  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  clear: () => void;

  // Detail
  loadDetailById: (id: number) => Promise<{
    workout: Workout;
    exercises: Array<{ id: number; exercise_id: number; name: string; sets: Set[] }>;
  } | null>;

  // Mutations
  deleteWorkout: (id: number) => Promise<void>;
  repeatWorkout: (
    id: number,
    options?: { includeSets?: boolean }
  ) => Promise<Workout | null>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  isLoading: false,
  hasMore: true,
  page: 0,
  pageSize: 20,

  loadInitial: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, page: 0, hasMore: true });
    try {
      const { pageSize } = get();
      const rows = await workoutService.getAllPaged(pageSize, 0);
      set({
        items: rows,
        page: 1,
        hasMore: rows.length === pageSize,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to load history:', e);
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    if (get().isLoading || !get().hasMore) return;
    set({ isLoading: true });
    try {
      const { page, pageSize, items } = get();
      const offset = page * pageSize;
      const rows = await workoutService.getAllPaged(pageSize, offset);
      set({
        items: [...items, ...rows],
        page: page + 1,
        hasMore: rows.length === pageSize,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to load more history:', e);
      set({ isLoading: false });
    }
  },

  clear: () => set({ items: [], page: 0, hasMore: true }),

  /**
   * Load workout detail by id (workout + exercises with sets)
   */
  loadDetailById: async (id: number) => {
    try {
      const workout = await workoutService.getById(id);
      if (!workout) return null;

      const wes = await workoutService.getWorkoutExercises(id);
      const exercises: Array<{ id: number; exercise_id: number; name: string; sets: Set[] }> = [];
      for (const we of wes) {
        const ex = await exerciseService.getById(we.exercise_id);
        const sets = await workoutService.getSets(we.id);
        exercises.push({ id: we.id, exercise_id: we.exercise_id, name: ex?.name || 'Exercise', sets });
      }
      return { workout, exercises };
    } catch (e) {
      console.error('Failed to load workout detail:', e);
      return null;
    }
  },

  /**
   * Delete a workout and update the paginated list
   */
  deleteWorkout: async (id: number) => {
    try {
      await workoutService.delete(id);
      // Remove from current items optimistically
      set((state) => ({ items: state.items.filter((w) => w.id !== id) }));
      // Optionally refresh the first page to keep counts consistent
      await get().loadInitial();
    } catch (e) {
      console.error('Failed to delete workout:', e);
      throw e;
    }
  },

  /**
   * Repeat a past workout: create a new active workout, preserving exercise order
   * If includeSets is true, clone the sets as uncompleted for each exercise
   */
  repeatWorkout: async (id: number, options?: { includeSets?: boolean }) => {
    const includeSets = options?.includeSets === true;
    try {
      // Load exercises (and sets if needed) from the source workout
      const wes = await workoutService.getWorkoutExercises(id);

      // Start a new workout via the active workout store to wire timers/state
      const newWorkout = await useWorkoutStore.getState().startWorkout();

      for (const we of wes) {
        const newWe = await workoutService.addExercise(newWorkout.id, we.exercise_id);
        if (includeSets) {
          const sets = await workoutService.getSets(we.id);
          // Clone sets in original order, mark as not completed
          for (const s of sets) {
            await workoutService.addSet(newWe.id, {
              reps: s.reps,
              weight: s.weight,
              rpe: s.rpe,
              is_warmup: s.is_warmup,
              is_completed: 0,
              notes: s.notes,
            });
          }
        }
      }

      // Reload active workout exercises for UI
      await useWorkoutStore.getState().reloadWorkoutExercises();

      return newWorkout;
    } catch (e) {
      console.error('Failed to repeat workout:', e);
      return null;
    }
  },
}));
