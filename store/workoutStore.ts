// Workout store - Manages active workout state

import { create } from 'zustand';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import { prService } from '../services/prService';
import { Workout, WorkoutExercise, Set, Exercise } from '../types/database';
import { WorkoutExerciseWithDetails } from '../types/workout';

interface WorkoutState {
  // Active workout
  activeWorkout: Workout | null;
  workoutExercises: WorkoutExerciseWithDetails[];
  isLoading: boolean;

  // Session timer
  sessionElapsed: number; // seconds
  sessionTimerActive: boolean;

  // Rest timer
  restRemaining: number; // seconds
  restTimerActive: boolean;
  restDuration: number; // default duration

  // Actions - Workout
  startWorkout: () => Promise<Workout>;
  loadActiveWorkout: () => Promise<void>;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  updateWorkoutNotes: (notes: string) => Promise<void>;

  // Actions - Exercises
  addExerciseToWorkout: (exerciseId: number) => Promise<void>;
  addExercisesToWorkout: (exerciseIds: number[]) => Promise<void>;
  removeExerciseFromWorkout: (workoutExerciseId: number) => Promise<void>;
  reorderExercises: (orderedWorkoutExerciseIds: number[]) => Promise<void>;
  reloadWorkoutExercises: () => Promise<void>;

  // Actions - Sets
  addSet: (workoutExerciseId: number, setData?: Partial<Set>) => Promise<void>;
  updateSet: (setId: number, data: Partial<Set>) => Promise<void>;
  deleteSet: (setId: number, workoutExerciseId: number) => Promise<void>;
  duplicateLastSet: (workoutExerciseId: number) => Promise<void>;
  toggleSetComplete: (setId: number, workoutExerciseId: number) => Promise<void>;

  // Actions - Timers
  startSessionTimer: () => void;
  stopSessionTimer: () => void;
  tickSessionTimer: () => void;
  startRestTimer: (duration?: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;

  // Utilities
  recalculateTotals: () => Promise<void>;
  clearWorkout: () => void;
}

// Timer intervals (stored outside the store)
let sessionTimerInterval: NodeJS.Timeout | number | null = null;
let restTimerInterval: NodeJS.Timeout | number | null = null;

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // Initial state
  activeWorkout: null,
  workoutExercises: [],
  isLoading: false,
  sessionElapsed: 0,
  sessionTimerActive: false,
  restRemaining: 0,
  restTimerActive: false,
  restDuration: 90, // 90 seconds default

  /**
   * Start a new workout
   */
  startWorkout: async () => {
    set({ isLoading: true });

    try {
      const workout = await workoutService.create();

      set({
        activeWorkout: workout,
        workoutExercises: [],
        sessionElapsed: 0,
        sessionTimerActive: false,
        isLoading: false,
      });

      // Start session timer
      get().startSessionTimer();

      console.log('Started workout:', workout.id);
      return workout;
    } catch (error) {
      console.error('Failed to start workout:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Load active workout (resume)
   */
  loadActiveWorkout: async () => {
    set({ isLoading: true });

    try {
      const workout = await workoutService.getActive();

      if (!workout) {
        set({ activeWorkout: null, workoutExercises: [], isLoading: false });
        return;
      }

      set({ activeWorkout: workout });

      // Calculate elapsed time
      const elapsed = Math.floor((Date.now() - workout.started_at) / 1000);
      set({ sessionElapsed: elapsed });

      // Load exercises
      await get().reloadWorkoutExercises();

      // Start timer if not already started
      if (!get().sessionTimerActive) {
        get().startSessionTimer();
      }

      set({ isLoading: false });
      console.log('Loaded active workout:', workout.id);
    } catch (error) {
      console.error('Failed to load active workout:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Finish workout
   */
  finishWorkout: async () => {
    const { activeWorkout, workoutExercises } = get();
    if (!activeWorkout) return;

    try {
      await workoutService.finish(activeWorkout.id);

      // Calculate and save personal records
      await prService.calculateAndSaveForWorkout(activeWorkout.id, workoutExercises);

      // Stop timers
      get().stopSessionTimer();
      get().stopRestTimer();

      console.log('Finished workout:', activeWorkout.id);

      // Keep workout data for finish screen, but mark as completed
      const updatedWorkout = await workoutService.getById(activeWorkout.id);
      set({ activeWorkout: updatedWorkout });
    } catch (error) {
      console.error('Failed to finish workout:', error);
      throw error;
    }
  },

  /**
   * Cancel workout (delete)
   */
  cancelWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    try {
      await workoutService.delete(activeWorkout.id);
      get().clearWorkout();
      console.log('Cancelled workout:', activeWorkout.id);
    } catch (error) {
      console.error('Failed to cancel workout:', error);
      throw error;
    }
  },

  /**
   * Update workout notes
   */
  updateWorkoutNotes: async (notes: string) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    try {
      await workoutService.update(activeWorkout.id, { notes });
      set({
        activeWorkout: { ...activeWorkout, notes },
      });
    } catch (error) {
      console.error('Failed to update notes:', error);
      throw error;
    }
  },

  /**
   * Add single exercise to workout
   */
  addExerciseToWorkout: async (exerciseId: number) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    try {
      await workoutService.addExercise(activeWorkout.id, exerciseId);
      await get().reloadWorkoutExercises();
      console.log('Added exercise:', exerciseId);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      throw error;
    }
  },

  /**
   * Add multiple exercises to workout
   */
  addExercisesToWorkout: async (exerciseIds: number[]) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    try {
      for (const exerciseId of exerciseIds) {
        await workoutService.addExercise(activeWorkout.id, exerciseId);
      }
      await get().reloadWorkoutExercises();
      console.log('Added exercises:', exerciseIds);
    } catch (error) {
      console.error('Failed to add exercises:', error);
      throw error;
    }
  },

  /**
   * Remove exercise from workout
   */
  removeExerciseFromWorkout: async (workoutExerciseId: number) => {
    try {
      await workoutService.removeExercise(workoutExerciseId);
      await get().reloadWorkoutExercises();
      await get().recalculateTotals();
      console.log('Removed exercise:', workoutExerciseId);
    } catch (error) {
      console.error('Failed to remove exercise:', error);
      throw error;
    }
  },

  /**
   * Reorder exercises within the active workout
   */
  reorderExercises: async (orderedWorkoutExerciseIds: number[]) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    try {
      await workoutService.reorderExercises(activeWorkout.id, orderedWorkoutExerciseIds);
      await get().reloadWorkoutExercises();
      console.log('Reordered exercises:', orderedWorkoutExerciseIds);
    } catch (error) {
      console.error('Failed to reorder exercises:', error);
      throw error;
    }
  },

  /**
   * Reload workout exercises with full details
   */
  reloadWorkoutExercises: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    try {
      const workoutExercises = await workoutService.getWorkoutExercises(activeWorkout.id);

      // Load exercise details and sets for each
      const detailedExercises: WorkoutExerciseWithDetails[] = [];

      for (const we of workoutExercises) {
        const exercise = await exerciseService.getById(we.exercise_id);
        const sets = await workoutService.getSets(we.id);

        if (exercise) {
          detailedExercises.push({
            ...we,
            exercise,
            sets,
          });
        }
      }

      set({ workoutExercises: detailedExercises });
    } catch (error) {
      console.error('Failed to reload exercises:', error);
      throw error;
    }
  },

  /**
   * Add set to exercise
   */
  addSet: async (workoutExerciseId: number, setData?: Partial<Set>) => {
    try {
      await workoutService.addSet(workoutExerciseId, setData || {});
      await get().reloadWorkoutExercises();
      console.log('Added set to exercise:', workoutExerciseId);
    } catch (error) {
      console.error('Failed to add set:', error);
      throw error;
    }
  },

  /**
   * Update set
   */
  updateSet: async (setId: number, data: Partial<Set>) => {
    try {
      await workoutService.updateSet(setId, data);
      await get().reloadWorkoutExercises();
      await get().recalculateTotals();
      console.log('Updated set:', setId);
    } catch (error) {
      console.error('Failed to update set:', error);
      throw error;
    }
  },

  /**
   * Delete set
   */
  deleteSet: async (setId: number, workoutExerciseId: number) => {
    try {
      await workoutService.deleteSet(setId);
      await get().reloadWorkoutExercises();
      await get().recalculateTotals();
      console.log('Deleted set:', setId);
    } catch (error) {
      console.error('Failed to delete set:', error);
      throw error;
    }
  },

  /**
   * Duplicate last set
   */
  duplicateLastSet: async (workoutExerciseId: number) => {
    try {
      await workoutService.duplicateLastSet(workoutExerciseId);
      await get().reloadWorkoutExercises();
      console.log('Duplicated last set for exercise:', workoutExerciseId);
    } catch (error) {
      console.error('Failed to duplicate set:', error);
      throw error;
    }
  },

  /**
   * Toggle set completion
   */
  toggleSetComplete: async (setId: number, workoutExerciseId: number) => {
    const { workoutExercises } = get();
    const exercise = workoutExercises.find((we) => we.id === workoutExerciseId);
    const set = exercise?.sets.find((s: Set) => s.id === setId);

    if (!set) return;

    try {
      const newCompleted = set.is_completed === 1 ? 0 : 1;
      await get().updateSet(setId, { is_completed: newCompleted });

      // Auto-start rest timer if completed
      if (newCompleted === 1) {
        get().startRestTimer();
      }
    } catch (error) {
      console.error('Failed to toggle set complete:', error);
      throw error;
    }
  },

  /**
   * Start session timer
   */
  startSessionTimer: () => {
    if (sessionTimerInterval) return;

    set({ sessionTimerActive: true });

    sessionTimerInterval = setInterval(() => {
      get().tickSessionTimer();
    }, 1000);
  },

  /**
   * Stop session timer
   */
  stopSessionTimer: () => {
    if (sessionTimerInterval) {
      clearInterval(sessionTimerInterval);
      sessionTimerInterval = null;
    }
    set({ sessionTimerActive: false });
  },

  /**
   * Tick session timer (increment)
   */
  tickSessionTimer: () => {
    set((state) => ({ sessionElapsed: state.sessionElapsed + 1 }));
  },

  /**
   * Start rest timer
   */
  startRestTimer: (duration?: number) => {
    // Stop existing timer
    get().stopRestTimer();

    const restDuration = duration || get().restDuration;

    set({
      restRemaining: restDuration,
      restTimerActive: true,
    });

    restTimerInterval = setInterval(() => {
      get().tickRestTimer();
    }, 1000);
  },

  /**
   * Stop rest timer
   */
  stopRestTimer: () => {
    if (restTimerInterval) {
      clearInterval(restTimerInterval);
      restTimerInterval = null;
    }
    set({ restTimerActive: false, restRemaining: 0 });
  },

  /**
   * Tick rest timer (decrement)
   */
  tickRestTimer: () => {
    set((state) => {
      const newRemaining = state.restRemaining - 1;

      // Stop timer if done
      if (newRemaining <= 0) {
        get().stopRestTimer();
        // TODO: Play notification sound/vibration
        return { restRemaining: 0, restTimerActive: false };
      }

      return { restRemaining: newRemaining };
    });
  },

  /**
   * Recalculate workout totals
   */
  recalculateTotals: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    try {
      await workoutService.recalculateTotals(activeWorkout.id);

      // Reload workout to get updated totals
      const updated = await workoutService.getById(activeWorkout.id);
      if (updated) {
        set({ activeWorkout: updated });
      }
    } catch (error) {
      console.error('Failed to recalculate totals:', error);
    }
  },

  /**
   * Clear workout state
   */
  clearWorkout: () => {
    get().stopSessionTimer();
    get().stopRestTimer();

    set({
      activeWorkout: null,
      workoutExercises: [],
      sessionElapsed: 0,
      sessionTimerActive: false,
      restRemaining: 0,
      restTimerActive: false,
    });
  },
}));
