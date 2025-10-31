// Database model types

export interface Exercise {
  id: number;
  name: string;
  primary_muscle: string;
  secondary_muscles?: string;
  equipment: string;
  movement_pattern?: string;
  is_bodyweight: number; // 0 or 1 (SQLite boolean)
  difficulty?: string;
  form_tips?: string;
  is_favorite: number; // 0 or 1 (SQLite boolean)
  last_used_at?: number;
  created_at: number;
}

export interface Workout {
  id: number;
  started_at: number;
  ended_at?: number;
  duration?: number;
  notes?: string;
  total_volume: number;
  total_sets: number;
  total_reps: number;
  status: 'in_progress' | 'completed';
  created_at: number;
  updated_at: number;
}

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  order_index: number;
  notes?: string;
  created_at: number;
  // Joined data (not in DB)
  exercise?: Exercise;
  sets?: Set[];
}

export interface Set {
  id: number;
  workout_exercise_id: number;
  set_number: number;
  reps: number;
  weight: number;
  rpe?: number;
  is_warmup: number; // 0 or 1 (SQLite boolean)
  is_completed: number; // 0 or 1 (SQLite boolean)
  notes?: string;
  created_at: number;
}

export interface PersonalRecord {
  id: number;
  exercise_id: number;
  type: '1RM' | '3RM' | '5RM' | '10RM' | 'TopSet' | 'Volume';
  value: number;
  reps?: number;
  workout_id?: number;
  achieved_at: number;
  // Joined data
  exercise?: Exercise;
}

export interface Setting {
  key: string;
  value: string;
  updated_at: number;
}

// Filter types
export interface ExerciseFilters {
  searchQuery?: string;
  muscles?: string[];
  equipment?: string[];
  favorites?: boolean;
  recent?: boolean;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ConsistencyData {
  streak: number;
  weeklyTarget: number;
  completion: number;
  daysThisWeek: number;
}
