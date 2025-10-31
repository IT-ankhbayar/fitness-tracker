// Centralized type exports

export * from './database';
export * from './workout';
export * from './exercise';

// Additional shared types

export type UnitPreference = 'kg' | 'lb';

export interface UserSettings {
  unitPreference: UnitPreference;
  weeklyTargetDays: number;
  onboardingCompleted: boolean;
  restTimerDefault: number; // Default rest timer in seconds
  autoStartRestTimer: boolean;
}

// Progress and analytics types
export interface ConsistencyData {
  streak: number; // Current streak in days
  weeklyTarget: number; // Target workouts per week
  weeklyCompletion: number; // % completion this week (0-100)
  lastWorkoutDate: Date | null;
  totalWorkouts: number;
}

export interface WeeklyVolumeData {
  week: string; // e.g., "Jan 1-7"
  volume: number;
  workouts: number;
  sets: number;
}

// Chart data format
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

// Toast/notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number; // Milliseconds
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Navigation types (to be used with Expo Router)
export type RootStackParamList = {
  '(tabs)': undefined;
  'workout/exercise-picker': { mode?: 'plan' | 'add-during-workout' };
  'workout/logger': { workoutId: number };
  'workout/finish': { workoutId: number };
  'history/[id]': { id: number };
  'progress/[exercise]': { exerciseId: number };
};
