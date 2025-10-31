// Exercise-specific types and enums

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Legs'
  | 'Core'
  | 'Full Body';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Kettlebell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Band';

export type MovementPattern =
  | 'Push'
  | 'Pull'
  | 'Hinge'
  | 'Squat'
  | 'Carry'
  | 'Rotation';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

// Seed data structure for exercises
export interface ExerciseSeedData {
  name: string;
  primary_muscle: MuscleGroup;
  secondary_muscles?: string;
  equipment: Equipment;
  movement_pattern?: MovementPattern;
  is_bodyweight: boolean;
  difficulty?: Difficulty;
  form_tips?: string;
}

// Exercise with usage stats (for UI)
export interface ExerciseWithStats {
  id: number;
  name: string;
  primary_muscle: string;
  equipment: string;
  is_favorite: boolean;
  last_used_at?: number;
  total_volume?: number;
  total_sets?: number;
  best_1rm?: number;
}
