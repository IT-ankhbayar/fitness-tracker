// Design System Constants - PulseLift Dark Theme

export const COLORS = {
  // Dark theme base
  background: {
    primary: '#0A0A0B',    // Main background
    secondary: '#141416',  // Card backgrounds
    tertiary: '#1C1C1F',   // Elevated surfaces
  },
  text: {
    primary: '#FFFFFF',    // Main text
    secondary: '#A0A0A3',  // Secondary text
    tertiary: '#6E6E73',   // Tertiary/placeholder text
  },
  accent: {
    primary: '#D4FF00',    // Electric yellow (primary CTA)
    secondary: '#00FF94',   // Neon green (secondary actions, success)
  },
  status: {
    success: '#00FF94',    // Success state
    warning: '#FFB800',    // Warning state
    error: '#FF3B30',      // Error state
    info: '#0A84FF',       // Info state
  },
  border: '#2C2C2E',       // Default border color
  overlay: 'rgba(0, 0, 0, 0.6)', // Modal overlay
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Animation durations (milliseconds)
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// App-specific constants
export const APP_CONFIG = {
  defaultRestTimer: 90, // seconds
  maxSetsPerExercise: 20,
  maxExercisesPerWorkout: 15,
  minWeight: 0,
  maxWeight: 1000, // kg
  minReps: 1,
  maxReps: 100,
  minRPE: 1,
  maxRPE: 10,
  debounceDelay: 300, // ms for search inputs
  autoSaveDelay: 500, // ms for auto-saving
};

// Muscle groups
export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Full Body',
] as const;

// Equipment types
export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Kettlebell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Band',
] as const;

// Movement patterns
export const MOVEMENT_PATTERNS = [
  'Push',
  'Pull',
  'Hinge',
  'Squat',
  'Carry',
  'Rotation',
] as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

// PR types for personal records
export const PR_TYPES = [
  '1RM',
  '3RM',
  '5RM',
  '10RM',
  'TopSet',
  'Volume',
] as const;

// Progress metrics
export const PROGRESS_METRICS = [
  'oneRM',
  'topSet',
  'volume',
  'frequency',
] as const;

// Unit conversion factors
export const UNIT_CONVERSION = {
  KG_TO_LB: 2.20462,
  LB_TO_KG: 0.453592,
};

// Date format options
export const DATE_FORMATS = {
  short: 'MMM d',           // Jan 1
  medium: 'MMM d, yyyy',    // Jan 1, 2024
  long: 'MMMM d, yyyy',     // January 1, 2024
  time: 'h:mm a',           // 3:45 PM
  dateTime: 'MMM d, h:mm a', // Jan 1, 3:45 PM
};

// Chart configuration
export const CHART_CONFIG = {
  backgroundColor: '#1C1C1F',
  backgroundGradientFrom: '#1C1C1F',
  backgroundGradientTo: '#1C1C1F',
  color: (opacity = 1) => `rgba(212, 255, 0, ${opacity})`, // Electric yellow
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 0,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#D4FF00',
  },
};

// Tab bar icons (using @expo/vector-icons)
export const TAB_ICONS = {
  home: 'home',
  workout: 'barbell',
  history: 'calendar',
  progress: 'trending-up',
  profile: 'person',
};

// Default settings
export const DEFAULT_SETTINGS = {
  unitPreference: 'kg' as const,
  weeklyTargetDays: 3,
  restTimerDefault: 90, // seconds
  autoStartRestTimer: false,
  onboardingCompleted: false,
};

// Haptic feedback types (for expo-haptics)
export const HAPTIC_FEEDBACK = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
} as const;

// Toast durations
export const TOAST_DURATION = {
  short: 2000,  // 2 seconds
  medium: 3000, // 3 seconds
  long: 5000,   // 5 seconds
};

// Validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  minValue: (min: number) => `Value must be at least ${min}`,
  maxValue: (max: number) => `Value must be at most ${max}`,
  invalidNumber: 'Please enter a valid number',
  invalidEmail: 'Please enter a valid email address',
};

// Success messages
export const SUCCESS_MESSAGES = {
  workoutSaved: 'Workout saved successfully!',
  workoutDeleted: 'Workout deleted',
  exerciseAdded: 'Exercise added',
  exerciseRemoved: 'Exercise removed',
  setAdded: 'Set added',
  setDeleted: 'Set deleted',
  settingsSaved: 'Settings saved',
  prAchieved: (type: string, value: number) => `New PR! ${type}: ${value}`,
};

// Error messages
export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  loadFailed: 'Failed to load data',
  saveFailed: 'Failed to save data',
  deleteFailed: 'Failed to delete',
  networkError: 'Network error. Please check your connection.',
};
