// Database schema and table creation SQL statements

export const SCHEMA_VERSION = 2;

// Create exercises table
export const CREATE_EXERCISES_TABLE = `
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    primary_muscle TEXT NOT NULL,
    secondary_muscles TEXT,
    equipment TEXT NOT NULL,
    movement_pattern TEXT,
    is_bodyweight INTEGER DEFAULT 0,
    difficulty TEXT,
    form_tips TEXT,
    is_favorite INTEGER DEFAULT 0,
    last_used_at INTEGER,
    created_at INTEGER NOT NULL
  );
`;

// Create workouts table
export const CREATE_WORKOUTS_TABLE = `
  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    duration INTEGER,
    notes TEXT,
    total_volume REAL DEFAULT 0,
    total_sets INTEGER DEFAULT 0,
    total_reps INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

// Create workout_exercises table (junction table)
export const CREATE_WORKOUT_EXERCISES_TABLE = `
  CREATE TABLE IF NOT EXISTS workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises (id)
  );
`;

// Create sets table
export const CREATE_SETS_TABLE = `
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_exercise_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight REAL DEFAULT 0,
    rpe INTEGER,
    is_warmup INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises (id) ON DELETE CASCADE
  );
`;

// Create personal_records table
export const CREATE_PERSONAL_RECORDS_TABLE = `
  CREATE TABLE IF NOT EXISTS personal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    reps INTEGER,
    workout_id INTEGER,
    achieved_at INTEGER NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises (id),
    FOREIGN KEY (workout_id) REFERENCES workouts (id)
  );
`;

// Create settings table
export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

// Create indexes for performance
export const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_workouts_started_at ON workouts (started_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_workouts_status ON workouts (status);',
  'CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises (workout_id);',
  'CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises (exercise_id);',
  'CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise ON sets (workout_exercise_id);',
  'CREATE INDEX IF NOT EXISTS idx_prs_exercise ON personal_records (exercise_id, achieved_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_exercises_last_used ON exercises (last_used_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_exercises_favorite ON exercises (is_favorite DESC, name ASC);',
];

// All table creation statements
export const CREATE_TABLES = [
  CREATE_EXERCISES_TABLE,
  CREATE_WORKOUTS_TABLE,
  CREATE_WORKOUT_EXERCISES_TABLE,
  CREATE_SETS_TABLE,
  CREATE_PERSONAL_RECORDS_TABLE,
  CREATE_SETTINGS_TABLE,
];

// Default settings to insert on first run
export const DEFAULT_SETTINGS_DATA = [
  { key: 'unit_preference', value: 'kg' },
  { key: 'weekly_target_days', value: '3' },
  { key: 'rest_timer_default', value: '90' },
  { key: 'auto_start_rest_timer', value: 'false' },
  { key: 'onboarding_completed', value: 'false' },
  { key: 'schema_version', value: SCHEMA_VERSION.toString() },
];

// Migration functions for future schema changes
export interface Migration {
  version: number;
  up: string[];
  down?: string[];
}

// Future migrations will be added here
export const MIGRATIONS: Migration[] = [
  {
    version: 2,
    up: [
      // Plans tables
      `CREATE TABLE IF NOT EXISTS workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS workout_plan_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        notes TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (plan_id) REFERENCES workout_plans (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      );`,
      `CREATE TABLE IF NOT EXISTS workout_plan_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_exercise_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight REAL DEFAULT 0,
        rpe INTEGER,
        is_warmup INTEGER DEFAULT 0,
        notes TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (plan_exercise_id) REFERENCES workout_plan_exercises (id) ON DELETE CASCADE
      );`,
      // Indexes
      'CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan ON workout_plan_exercises (plan_id);',
      'CREATE INDEX IF NOT EXISTS idx_plan_exercises_order ON workout_plan_exercises (order_index);',
      'CREATE INDEX IF NOT EXISTS idx_plan_sets_plan_exercise ON workout_plan_sets (plan_exercise_id);'
    ],
    down: [
      'DROP TABLE IF EXISTS workout_plan_sets;',
      'DROP TABLE IF EXISTS workout_plan_exercises;',
      'DROP TABLE IF EXISTS workout_plans;'
    ]
  }
];

// Drop all tables (for development/testing only)
export const DROP_ALL_TABLES = [
  'DROP TABLE IF EXISTS sets;',
  'DROP TABLE IF EXISTS workout_exercises;',
  'DROP TABLE IF EXISTS workouts;',
  'DROP TABLE IF EXISTS personal_records;',
  'DROP TABLE IF EXISTS exercises;',
  'DROP TABLE IF EXISTS settings;',
];
