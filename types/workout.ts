// Workout-specific types and enums
import { WorkoutExercise, Exercise, Set } from './database';

export type WorkoutStatus = 'in_progress' | 'completed';

export type PRType = '1RM' | '3RM' | '5RM' | '10RM' | 'TopSet' | 'Volume';

export type ProgressMetric = 'oneRM' | 'topSet' | 'volume' | 'frequency';

// WorkoutExercise with populated exercise and sets (used in UI state)
export interface WorkoutExerciseWithDetails extends Omit<WorkoutExercise, 'exercise' | 'sets'> {
  exercise: Exercise;
  sets: Set[];
}

// UI state types
export interface SessionTimerState {
  elapsed: number;
  isRunning: boolean;
  startTime?: number;
}

export interface RestTimerState {
  remaining: number;
  isRunning: boolean;
  target: number;
}

// Create types (for inserting new records)
export interface CreateWorkoutData {
  started_at: number;
  status?: WorkoutStatus;
}

export interface CreateWorkoutExerciseData {
  workout_id: number;
  exercise_id: number;
  order_index: number;
  notes?: string;
}

export interface CreateSetData {
  workout_exercise_id: number;
  set_number: number;
  reps: number;
  weight: number;
  rpe?: number;
  is_warmup?: boolean;
  is_completed?: boolean;
  notes?: string;
}

export interface UpdateSetData {
  reps?: number;
  weight?: number;
  rpe?: number;
  is_warmup?: boolean;
  is_completed?: boolean;
  notes?: string;
}

// Computed workout summary
export interface WorkoutSummary {
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  duration: number;
  exerciseCount: number;
  newPRs: number;
}
