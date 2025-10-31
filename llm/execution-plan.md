# PulseLift Fitness Tracker - Execution Plan

## Executive Summary

This document outlines the complete technical execution plan for building PulseLift, a local-first fitness tracking mobile application using React Native + Expo. The app will be built in phases, starting with core functionality and progressively adding features.

**Key Technical Decisions:**
- **Local-first**: No backend, no authentication (simplified from original brief)
- **Data persistence**: SQLite via expo-sqlite for workout data
- **State management**: Zustand for UI state and workout session management
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind for React Native)
- **Charts**: react-native-chart-kit (lightweight, good for MVP)

---

## 1. Technical Architecture

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Screens)                    │
│  Home | Workout | History | Progress | Profile           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              Component Library (Reusable UI)            │
│  Buttons | Inputs | Lists | Charts | Sheets | Dialogs   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│           State Management (Zustand Stores)             │
│  workoutStore | exerciseStore | settingsStore           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              Data Access Layer (Services)               │
│  DatabaseService | ExerciseService | WorkoutService     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│            Data Persistence (SQLite)                    │
│  Workouts | Sets | Exercises | PRs | Settings           │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

1. **User Action** → UI Component
2. **Component** → Zustand Store (updates UI state)
3. **Store** → Database Service (persists data)
4. **Database** → Returns data
5. **Service** → Updates Store
6. **Store** → Triggers React re-render
7. **UI** → Displays updated state

---

## 2. Project Structure

```
VibeCoding/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── _layout.tsx           # Tab navigator config
│   │   ├── home.tsx              # Home tab (Today view)
│   │   ├── workout/              # Workout stack
│   │   │   ├── _layout.tsx       # Stack navigator
│   │   │   ├── index.tsx         # Workout planner
│   │   │   ├── exercise-picker.tsx
│   │   │   ├── logger.tsx        # Active workout logger
│   │   │   └── finish.tsx        # Finish summary
│   │   ├── history/              # History stack
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # History list
│   │   │   └── [id].tsx          # Workout detail
│   │   ├── progress/             # Progress stack
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Progress overview
│   │   │   └── [exercise].tsx    # Exercise progress detail
│   │   └── profile.tsx           # Profile tab
│   ├── _layout.tsx               # Root layout
│   ├── +html.tsx                 # Web HTML wrapper
│   └── +not-found.tsx            # 404 page
│
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Chip.tsx
│   │   ├── IconButton.tsx
│   │   └── FloatingActionButton.tsx
│   ├── inputs/                   # Specialized inputs
│   │   ├── TextInputNumber.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CounterInput.tsx
│   │   ├── SegmentedControl.tsx
│   │   └── FilterChip.tsx
│   ├── lists/                    # List components
│   │   ├── ExerciseRow.tsx
│   │   ├── SetRow.tsx
│   │   ├── WorkoutCard.tsx
│   │   └── Accordion.tsx
│   ├── charts/                   # Chart components
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   └── RingProgress.tsx
│   ├── sheets/                   # Bottom sheets & modals
│   │   ├── BottomSheet.tsx
│   │   ├── RestTimerSheet.tsx
│   │   ├── ExerciseInfoSheet.tsx
│   │   └── NotesSheet.tsx
│   ├── workout/                  # Workout-specific components
│   │   ├── ExerciseSection.tsx
│   │   ├── SetTable.tsx
│   │   ├── WorkoutHeader.tsx
│   │   └── SessionTimer.tsx
│   └── feedback/                 # Feedback components
│       ├── Toast.tsx
│       ├── EmptyState.tsx
│       └── LoadingSpinner.tsx
│
├── store/                        # Zustand stores
│   ├── workoutStore.ts           # Active workout state
│   ├── exerciseStore.ts          # Exercise catalog state
│   ├── historyStore.ts           # Workout history state
│   ├── progressStore.ts          # Progress metrics state
│   └── settingsStore.ts          # App settings
│
├── services/                     # Data services
│   ├── database/
│   │   ├── index.ts              # Database initialization
│   │   ├── schema.ts             # Table schemas
│   │   └── migrations.ts         # Database migrations
│   ├── exerciseService.ts        # Exercise CRUD
│   ├── workoutService.ts         # Workout CRUD
│   ├── prService.ts              # PR calculations
│   └── analyticsService.ts       # Progress calculations
│
├── data/                         # Static data
│   └── exercises.json            # Exercise catalog seed data
│
├── utils/                        # Utility functions
│   ├── calculations.ts           # 1RM, volume calculations
│   ├── formatters.ts             # Date, number formatting
│   └── constants.ts              # App constants
│
├── types/                        # TypeScript types
│   ├── database.ts               # Database types
│   ├── workout.ts                # Workout types
│   └── exercise.ts               # Exercise types
│
├── hooks/                        # Custom React hooks
│   ├── useDatabase.ts
│   ├── useWorkout.ts
│   └── useExercises.ts
│
└── assets/                       # Static assets
    ├── icons/
    └── images/
```

---

## 3. Database Schema (SQLite)

### 3.1 Tables

```sql
-- Exercises catalog (pre-seeded)
CREATE TABLE exercises (
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

-- Workouts (sessions)
CREATE TABLE workouts (
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

-- Workout exercises (exercises in a workout)
CREATE TABLE workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises (id)
);

-- Sets (individual sets in a workout)
CREATE TABLE sets (
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

-- Personal records
CREATE TABLE personal_records (
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

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_workouts_started_at ON workouts (started_at DESC);
CREATE INDEX idx_workout_exercises_workout ON workout_exercises (workout_id);
CREATE INDEX idx_sets_workout_exercise ON sets (workout_exercise_id);
CREATE INDEX idx_prs_exercise ON personal_records (exercise_id, achieved_at DESC);
CREATE INDEX idx_exercises_last_used ON exercises (last_used_at DESC);
```

### 3.2 Initial Data (Settings)

```json
{
  "unit_preference": "kg",
  "theme": "dark",
  "weekly_target_days": "3",
  "onboarding_completed": "false"
}
```

---

## 4. State Management (Zustand)

### 4.1 Store Structure

#### workoutStore.ts
```typescript
interface WorkoutState {
  // Active workout
  activeWorkout: Workout | null;
  activeExercises: WorkoutExercise[];

  // UI state
  sessionTimer: { elapsed: number; isRunning: boolean };
  restTimer: { remaining: number; isRunning: boolean };

  // Actions
  startWorkout: () => Promise<void>;
  endWorkout: () => Promise<void>;
  addExercise: (exerciseId: number) => void;
  removeExercise: (workoutExerciseId: number) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  addSet: (workoutExerciseId: number) => void;
  updateSet: (setId: number, data: Partial<Set>) => void;
  deleteSet: (setId: number) => void;
  duplicateLastSet: (workoutExerciseId: number) => void;
}
```

#### exerciseStore.ts
```typescript
interface ExerciseState {
  exercises: Exercise[];
  favorites: Exercise[];
  recentlyUsed: Exercise[];

  // Filters
  searchQuery: string;
  selectedMuscles: string[];
  selectedEquipment: string[];

  // Actions
  loadExercises: () => Promise<void>;
  searchExercises: (query: string) => void;
  toggleFavorite: (exerciseId: number) => void;
  filterByMuscle: (muscles: string[]) => void;
  filterByEquipment: (equipment: string[]) => void;
}
```

#### historyStore.ts
```typescript
interface HistoryState {
  workouts: Workout[];
  currentWorkout: Workout | null;

  // Actions
  loadWorkouts: (limit?: number) => Promise<void>;
  loadWorkoutDetail: (workoutId: number) => Promise<void>;
  deleteWorkout: (workoutId: number) => Promise<void>;
  repeatWorkout: (workoutId: number) => Promise<void>;
}
```

#### progressStore.ts
```typescript
interface ProgressState {
  personalRecords: PR[];
  selectedExercise: Exercise | null;
  selectedMetric: 'oneRM' | 'topSet' | 'volume' | 'frequency';

  // Computed data
  weeklyVolume: { week: string; volume: number }[];
  exerciseProgress: { date: string; value: number }[];
  consistencyData: { streak: number; weeklyTarget: number; completion: number };

  // Actions
  loadPRs: () => Promise<void>;
  loadExerciseProgress: (exerciseId: number) => Promise<void>;
  calculateConsistency: () => Promise<void>;
}
```

#### settingsStore.ts
```typescript
interface SettingsState {
  unitPreference: 'kg' | 'lb';
  weeklyTargetDays: number;
  onboardingCompleted: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateUnits: (unit: 'kg' | 'lb') => Promise<void>;
  updateWeeklyTarget: (days: number) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}
```

---

## 5. Core Services

### 5.1 DatabaseService

```typescript
class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  async init(): Promise<void>;
  async runMigrations(): Promise<void>;
  async executeSql(sql: string, params?: any[]): Promise<any>;
  async transaction(callback: (tx: SQLite.SQLTransaction) => void): Promise<void>;
}
```

### 5.2 ExerciseService

```typescript
class ExerciseService {
  async getAll(): Promise<Exercise[]>;
  async getById(id: number): Promise<Exercise>;
  async search(query: string): Promise<Exercise[]>;
  async filter(filters: ExerciseFilters): Promise<Exercise[]>;
  async toggleFavorite(id: number): Promise<void>;
  async updateLastUsed(id: number): Promise<void>;
  async seedExercises(): Promise<void>;
}
```

### 5.3 WorkoutService

```typescript
class WorkoutService {
  async create(): Promise<Workout>;
  async getById(id: number): Promise<Workout>;
  async getAll(limit?: number): Promise<Workout[]>;
  async update(id: number, data: Partial<Workout>): Promise<void>;
  async delete(id: number): Promise<void>;
  async finish(id: number): Promise<void>;

  async addExercise(workoutId: number, exerciseId: number): Promise<WorkoutExercise>;
  async removeExercise(workoutExerciseId: number): Promise<void>;
  async reorderExercises(workoutId: number, order: number[]): Promise<void>;

  async addSet(workoutExerciseId: number, set: Partial<Set>): Promise<Set>;
  async updateSet(setId: number, data: Partial<Set>): Promise<void>;
  async deleteSet(setId: number): Promise<void>;
  async getSets(workoutExerciseId: number): Promise<Set[]>;
}
```

### 5.4 PRService

```typescript
class PRService {
  async calculateAndSave(workoutId: number): Promise<PR[]>;
  async getByExercise(exerciseId: number): Promise<PR[]>;
  async getRecent(limit: number): Promise<PR[]>;
  calculate1RM(weight: number, reps: number): number;
}
```

### 5.5 AnalyticsService

```typescript
class AnalyticsService {
  async getWeeklyVolume(weeks: number): Promise<{ week: string; volume: number }[]>;
  async getExerciseProgress(exerciseId: number, metric: string): Promise<ChartData>;
  async calculateStreak(): Promise<number>;
  async getConsistency(weeks: number): Promise<ConsistencyData>;
}
```

---

## 6. Navigation Structure (Expo Router)

```
app/
├── _layout.tsx                    # Root layout (Stack)
├── (tabs)/                        # Tab group
│   ├── _layout.tsx                # Tab navigator (5 tabs)
│   ├── home.tsx                   # Home tab
│   ├── workout/                   # Workout stack
│   │   ├── _layout.tsx            # Stack navigator
│   │   ├── index.tsx              # Planner (entry)
│   │   ├── exercise-picker.tsx    # Modal
│   │   ├── logger.tsx             # Logger
│   │   └── finish.tsx             # Summary
│   ├── history/                   # History stack
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # List
│   │   └── [id].tsx               # Detail
│   ├── progress/                  # Progress stack
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Overview
│   │   └── [exercise].tsx         # Detail
│   └── profile.tsx                # Profile (single screen)
```

---

## 7. Component Library (Design System)

### 7.1 Design Tokens (constants.ts)

```typescript
export const COLORS = {
  // Dark theme base
  background: {
    primary: '#0A0A0B',
    secondary: '#141416',
    tertiary: '#1C1C1F',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A3',
    tertiary: '#6E6E73',
  },
  accent: {
    primary: '#D4FF00',    // Electric yellow
    secondary: '#00FF94',   // Neon green
  },
  status: {
    success: '#00FF94',
    warning: '#FFB800',
    error: '#FF3B30',
  },
  border: '#2C2C2E',
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
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
```

### 7.2 Core Components

**Buttons**
- PrimaryButton (yellow/green, pill-shaped)
- SecondaryButton (outlined)
- IconButton
- FloatingActionButton

**Inputs**
- TextInput (with label, error state)
- TextInputNumber (numeric keyboard, +/- controls)
- SearchBar (with clear button)
- CounterInput (stepper)

**Selection**
- Checkbox
- SegmentedControl (tab-like switcher)
- FilterChip (toggleable tag)

**Lists**
- List, ListItem
- ExerciseRow (with metadata, action buttons)
- WorkoutCard (summary card)
- SetRow (editable row in table)
- Accordion (collapsible section)

**Feedback**
- Toast (bottom notification)
- EmptyState (illustration + CTA)
- LoadingSpinner
- Skeleton (loading placeholder)

**Charts**
- LineChart (progress over time)
- BarChart (weekly volume)
- RingProgress (consistency %)

**Sheets/Modals**
- BottomSheet (swipeable)
- Modal (centered dialog)
- ConfirmDialog (yes/no)
- RestTimerSheet
- ExerciseInfoSheet
- NotesSheet

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up architecture, database, and navigation

#### Tasks:
1. **Database Setup**
   - Install expo-sqlite
   - Create database service
   - Write schema and migrations
   - Seed exercises data

2. **State Management**
   - Set up Zustand stores structure
   - Implement settingsStore
   - Implement exerciseStore (read-only for now)

3. **Navigation**
   - Configure tab navigator
   - Set up stack navigators for each tab
   - Create placeholder screens

4. **Design System**
   - Define design tokens (colors, spacing, typography)
   - Create base Button components
   - Create base Input components
   - Set up NativeWind dark theme

5. **Services**
   - DatabaseService implementation
   - ExerciseService (CRUD + search/filter)
   - Basic calculations utility (1RM formula)

**Deliverable**: App runs, can navigate between tabs, exercise data loads, dark theme applied

---

### Phase 2: Exercise Catalog & Picker (Week 2)
**Goal**: Complete exercise browsing and selection

#### Tasks:
1. **Exercise Picker Screen**
   - SearchBar component with debouncing
   - FilterTabs (Muscle, Equipment, All, Favorites)
   - FilterChips for multi-select
   - ExerciseCatalogList with infinite scroll
   - SelectedTray (sticky bottom)

2. **Exercise Components**
   - ExerciseRow (name, muscle, equipment, add button)
   - ExerciseInfoSheet (form tips, bottom sheet)
   - Empty state for no results

3. **Exercise Store**
   - Search functionality
   - Filter by muscle/equipment
   - Toggle favorites
   - Track recently used

**Deliverable**: Can search, filter, and select exercises; favorites work

---

### Phase 3: Workout Logger (Core Feature) (Week 3-4)
**Goal**: Complete the core workout logging experience

#### Tasks:
1. **Workout Planner Screen**
   - ExerciseListEditable with drag-to-reorder
   - Add/remove exercises
   - "Start Workout" button
   - Save plan for later

2. **Logger Screen**
   - WorkoutHeader (timer, finish button)
   - ExerciseSection for each exercise
   - SetTable (editable rows)
   - SetRow component (reps, weight inputs, checkbox)
   - Add set button
   - Copy last set button
   - NotesSheet
   - FloatingActionButton to add more exercises

3. **Workout State**
   - workoutStore implementation
   - Create/update/finish workout
   - Add/remove/reorder exercises
   - Add/update/delete sets
   - Session timer
   - Auto-save (every action persists immediately)

4. **Workout Service**
   - Complete CRUD operations
   - Transaction handling for data integrity
   - Calculate workout totals (volume, sets, reps)

5. **Finish Summary Screen**
   - WorkoutSummaryHeader
   - KPI grid (sets, reps, volume)
   - Exercise summary list
   - Notes input
   - Save & finish button

**Deliverable**: Can create, log, and finish a complete workout with multiple exercises and sets

---

### Phase 4: History (Week 5)
**Goal**: View and manage past workouts

#### Tasks:
1. **History List Screen**
   - WorkoutCard component
   - Chronological list (infinite scroll)
   - Date grouping headers
   - Empty state for no workouts

2. **Workout Detail Screen**
   - Full workout summary
   - Exercise accordion (expandable sections)
   - SetListReadOnly (display past sets)
   - "Repeat Workout" button (copies to new workout)
   - Edit button (for corrections)
   - Delete button with confirmation

3. **History Store**
   - Load workouts (paginated)
   - Load workout detail
   - Delete workout
   - Repeat workout logic

**Deliverable**: Can view all past workouts, see details, repeat, or delete

---

### Phase 5: Progress & PRs (Week 6)
**Goal**: Display progress metrics and personal records

#### Tasks:
1. **Progress Overview Screen**
   - ConsistencyRing (weekly goal completion %)
   - StreakCounter
   - WeeklyBarChart (volume by week)
   - PRsRecentList (last 10 PRs with badges)
   - ByExerciseGrid (tiles for top exercises)

2. **Exercise Progress Detail Screen**
   - MetricSwitcher (1RM, Top Set, Volume, Frequency)
   - LineChart (metric over time)
   - BarChart (weekly volume)
   - SessionList (filtered to exercise)

3. **Charts Components**
   - LineChart (using react-native-chart-kit)
   - BarChart
   - RingProgress (custom with react-native-svg)

4. **PR Service**
   - Calculate PRs after each workout
   - Detect new PRs (1RM, 3RM, 5RM, 10RM, top set, volume)
   - Store and retrieve PRs

5. **Analytics Service**
   - Weekly volume calculations
   - Streak calculation (days since last workout)
   - Consistency % (actual vs target)
   - Exercise-specific progress queries

**Deliverable**: Can see progress charts, PRs, and consistency metrics

---

### Phase 6: Home Tab & Profile (Week 7)
**Goal**: Complete Home dashboard and settings

#### Tasks:
1. **Home Screen**
   - GreetingHeader (time-based greeting, date)
   - QuickStartSection (3 big CTAs)
     - Start Workout
     - Repeat Last Workout
     - Plan Workout
   - StreakWidget
   - RecentPRsStrip (horizontal scroll)
   - MiniHistoryList (last 3 workouts)

2. **Profile Screen**
   - UserHeader (app version)
   - UnitsTile (kg/lb toggle)
   - WeeklyTargetInput (days/week)
   - DataTileGroup
     - Export Data (JSON format)
     - Import Data (from JSON)
     - Delete All Data (with confirmation)
   - About section (version, credits)

3. **Settings Store**
   - Load/save settings
   - Unit conversion handling

**Deliverable**: Home provides quick access to all features; Profile allows customization

---

### Phase 7: Polish & UX Enhancements (Week 8)
**Goal**: Refine interactions, add animations, improve accessibility

#### Tasks:
1. **Animations**
   - Spring transitions for add/remove set
   - Progress ring sweep animation
   - Smooth sheet transitions
   - Loading skeletons

2. **Haptics**
   - Add set feedback
   - Complete set feedback
   - PR achieved celebration

3. **Rest Timer**
   - RestTimerSheet with countdown
   - Auto-start option
   - Notification when rest is done

4. **Accessibility**
   - Add accessibility labels to all interactive elements
   - Ensure logical focus order
   - Test with screen reader
   - Minimum touch target sizes (44x44)

5. **Edge Cases & Error Handling**
   - Dirty state handling (unsaved changes warning)
   - Empty states for all lists
   - Error states with retry
   - Loading states
   - Validation messages
   - Confirm dialogs for destructive actions

6. **Performance**
   - Optimize list rendering (FlashList if needed)
   - Debounce search inputs
   - Memoize expensive calculations
   - Database query optimization

**Deliverable**: App feels polished, smooth, and handles all edge cases

---

### Phase 8: Testing & QA (Week 9)
**Goal**: Ensure stability and quality

#### Tasks:
1. **Unit Tests**
   - Test calculation utilities (1RM, volume)
   - Test services (mocked database)
   - Test stores

2. **Manual Testing**
   - Complete workout flow
   - Test all CRUD operations
   - Test navigation flows
   - Test edge cases (empty data, invalid inputs)
   - Test on iOS and Android

3. **Bug Fixes**
   - Fix issues found during testing

4. **Documentation**
   - Code comments for complex logic
   - README with setup instructions

**Deliverable**: Stable, tested app ready for use

---

## 9. Dependencies

### 9.1 Required Dependencies

```json
{
  "dependencies": {
    "@expo/vector-icons": "^15.0.2",
    "@react-navigation/native": "^7.1.6",
    "expo": "^54.0.0",
    "expo-constants": "~18.0.9",
    "expo-haptics": "~15.0.0",
    "expo-linking": "~8.0.8",
    "expo-router": "~6.0.10",
    "expo-sqlite": "~16.0.0",
    "expo-status-bar": "~3.0.8",
    "expo-system-ui": "~6.0.7",
    "expo-web-browser": "~15.0.7",
    "nativewind": "latest",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-chart-kit": "^6.12.0",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "^15.8.0",
    "react-native-web": "^0.21.0",
    "zustand": "^4.5.1"
  }
}
```

### 9.2 Installation Command

```bash
npm install expo-sqlite expo-haptics react-native-chart-kit react-native-svg
```

---

## 10. Key Implementation Notes

### 10.1 Data Persistence Strategy

- **Immediate persistence**: Every action (add set, update reps) saves to SQLite immediately
- **No sync conflicts**: Local-first means no backend sync issues
- **Transaction safety**: Use SQLite transactions for multi-step operations
- **Auto-save**: No manual save buttons in logger (except final "Finish Workout")

### 10.2 Performance Considerations

- **Lazy loading**: Load only visible workout history (pagination)
- **Debouncing**: Search input debounced at 300ms
- **Memoization**: Use React.memo for expensive list items
- **FlatList optimization**: Use windowSize, maxToRenderPerBatch
- **Chart data**: Pre-calculate and cache in stores

### 10.3 UX Principles

- **Speed**: Target <5 seconds to add a set
- **Clarity**: Show progress and feedback for all actions
- **Forgiveness**: Undo/delete options, confirmation dialogs
- **Motivation**: Celebrate PRs, show streaks prominently
- **Dark theme**: Follow design mockups closely

### 10.4 Offline-First

- Since there's no backend, the app is inherently offline-first
- All data lives in SQLite on device
- Future enhancement: Export/import JSON for backup/restore

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Calculation functions (1RM, volume)
- Data transformations
- Validation logic

### 11.2 Integration Tests
- Database operations
- Store actions
- Service methods

### 11.3 E2E Tests (Optional/Future)
- Complete workout flow
- Navigation flows
- Critical user paths

### 11.4 Manual Testing Checklist
- [ ] Create and finish a workout
- [ ] Add/remove exercises
- [ ] Add/edit/delete sets
- [ ] View history
- [ ] Repeat workout
- [ ] Delete workout
- [ ] View progress charts
- [ ] Change units (kg/lb)
- [ ] Search and filter exercises
- [ ] Toggle favorites
- [ ] Test empty states
- [ ] Test error states
- [ ] Test on iOS
- [ ] Test on Android

---

## 12. Future Enhancements (Post-MVP)

1. **Workout Templates/Programs**
   - Save workout plans
   - Follow structured programs

2. **Rest Timer Enhancements**
   - Auto-start after set completion
   - Custom rest periods per exercise

3. **Exercise Media**
   - GIFs/videos for form guidance

4. **Advanced Analytics**
   - Muscle group balance
   - Weekly training load
   - Fatigue indicators

5. **Data Export/Import**
   - CSV export for spreadsheet analysis
   - Backup/restore via JSON

6. **Wearables** (Much Later)
   - Apple Watch complication
   - Quick set logging from watch

7. **Social Features** (Would require backend)
   - Share workouts
   - Follow friends

---

## 13. Success Metrics (Post-Launch)

- **Activation**: User completes first workout within 48 hours
- **Time-to-log**: Average time to add a set <5 seconds
- **Retention**: 50% of users complete 3+ workouts in first week
- **PRs**: 80% of users achieve at least 1 PR in first month
- **Consistency**: 60% of users meet their weekly target

---

## 14. Getting Started (Next Steps)

1. **Phase 1, Task 1**: Install dependencies
   ```bash
   npm install expo-sqlite expo-haptics react-native-chart-kit react-native-svg
   ```

2. **Phase 1, Task 2**: Create database service structure
   - Create `services/database/` folder
   - Implement DatabaseService class
   - Write schema.ts with CREATE TABLE statements

3. **Phase 1, Task 3**: Create exercise seed data
   - Create `data/exercises.json` with 20-30 common exercises
   - Implement seeding function

4. **Phase 1, Task 4**: Set up Zustand stores skeleton
   - Create store files with interfaces
   - Implement basic actions

5. **Continue with Phase 1 tasks...**

---

## Appendix A: Exercise Seed Data Structure

```json
[
  {
    "name": "Barbell Bench Press",
    "primary_muscle": "Chest",
    "secondary_muscles": "Shoulders,Triceps",
    "equipment": "Barbell",
    "movement_pattern": "Push",
    "is_bodyweight": false,
    "difficulty": "Intermediate",
    "form_tips": "Keep feet flat, shoulder blades retracted, bar path over mid-chest."
  },
  {
    "name": "Pull-ups",
    "primary_muscle": "Back",
    "secondary_muscles": "Biceps",
    "equipment": "Bodyweight",
    "movement_pattern": "Pull",
    "is_bodyweight": true,
    "difficulty": "Intermediate",
    "form_tips": "Full range of motion, control the descent, avoid kipping."
  }
]
```

---

## Appendix B: Calculation Formulas

### 1RM Estimation (Epley Formula)
```typescript
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
```

### Volume Calculation
```typescript
function calculateVolume(sets: Set[]): number {
  return sets.reduce((total, set) => {
    return total + (set.weight * set.reps);
  }, 0);
}
```

### Streak Calculation
```typescript
function calculateStreak(workouts: Workout[]): number {
  // Count consecutive days with workouts, starting from today
  // Break if a day is missed
}
```

---

## Appendix C: File Creation Order

For efficient implementation, create files in this order:

1. `types/` (TypeScript interfaces first)
2. `utils/constants.ts` (design tokens)
3. `services/database/schema.ts`
4. `services/database/index.ts`
5. `data/exercises.json`
6. `services/exerciseService.ts`
7. `store/settingsStore.ts`
8. `store/exerciseStore.ts`
9. `components/ui/Button.tsx`
10. `components/ui/Input.tsx`
11. `app/(tabs)/_layout.tsx`
12. Continue with screens and features...

---

**End of Execution Plan**

This plan provides a complete roadmap for building PulseLift. Follow the phases sequentially, completing all tasks in each phase before moving to the next. Each phase builds upon the previous one, ensuring a solid foundation.
