0. App Architecture & Navigation

Navigation

Root: BottomTabNavigator

Tabs: Home, Workout, History, Progress, Profile

Stacks:

OnboardingStack (shown only on first run): Welcome → Goals → Targets → Permissions → Done

WorkoutStack (inside Workout tab): WorkoutPlanner → ExercisePicker → Logger → FinishSummary

HistoryStack: HistoryList → WorkoutDetail

ProgressStack: ProgressOverview → ExerciseProgressDetail

ProfileStack: ProfileHome → UnitsSettings → DataExport

Global UI Elements

Global toasts/snackbars for save/undo.

Global confirmation dialog (discard changes, delete set).

Global search sheet (invoked in ExercisePicker and History).

Global date picker.

Global “rest timer” sheet.

State (UI layer)

workoutSessionUI: active workout id, elapsed time, rest timer state, set edit focus.

exercisePickerUI: filters, search query, selected items.

historyUI: selected date range, query, pagination.

progressUI: selected metric (1RM, volume, frequency), exercise filter.

onboardingUI: step tracker, inputs.

1. OnboardingStack
   1.1 Welcome

Purpose: Introduce app; proceed to setup.
Components:

ScreenHeader with step indicator (1/4).

PrimaryActionButton → Next.

SkipButton (sends to app with defaults).

1.2 Goals

Purpose: Choose high-level goals.
Components:

SelectableCardList (multi-select): items like “Build muscle”, “Get stronger”.

ContinueBar (disabled until ≥1 selected).

1.3 Targets

Purpose: Set weekly training target.
Components:

CounterInput (days/week).

TimePicker (optional wake time/reminders).

ContinueBar.

1.4 Permissions

Purpose: Ask for notifications.
Components:

PermissionPrompt (with Allow / Not now).

ContinueBar → Done (navigates to tabs).

2. Home Tab
   2.1 Home / Today

Design file: Use the UI design from llm/designs/HomeTab.jpg

Purpose: Quick entry point for current day.
Components:

GreetingHeader with date and weekly target status.

QuickStartSection

StartWorkoutButton

RepeatLastWorkoutButton

PlanWorkoutButton

UpcomingSection

SmallCardList (planned workouts / reminders).

StreakWidget

RecentPRsStrip

MiniHistoryList (last 3 sessions, link to History).

Interactions:

Start creates a new Workout and pushes to Logger (if plan exists, prefill exercises).

Repeat copies last completed workout into a new session and opens Logger.

3. Workout Tab (WorkoutStack)
   3.1 WorkoutPlanner

Design file: Use the UI design from llm/designs/WorkoutPlanner.jpg

Purpose: Build/edit the exercise list before starting.
Components:

SectionHeader (“Today’s Plan”)

ExerciseListEditable

Each row: ExerciseRow

Handle (reorder)

Title

SecondaryText (last used/top set)

Chevron

DeleteIconButton

AddExerciseButton (opens ExercisePicker as full screen or sheet)

SavePlanButton

StartWorkoutButton (enabled when ≥1 exercise)

Interactions:

Reorder via drag-and-drop.

Tapping a row opens ExercisePresetSheet (default sets, target reps, notes).

3.2 ExercisePicker

Design file: Use the UI design from llm/designs/ExercisePicker.jpg

Purpose: Find and select exercises.
Components:

SearchBar (debounced)

FilterTabs: Muscle | Equipment | All | Favorites | Recent

FilterChips (multi-select: muscle groups, equipment, tags)

ExerciseCatalogList

Rows: name, primary muscle, equipment; AddButton

SelectedTray (sticky)

shows selected exercises with RemoveChips

AddToPlanButton

Interactions:

Add toggles selection; AddToPlan returns to planner with merged list.

Long-press row → ExerciseInfoSheet (form tips, cues).

3.3 Logger (Active Workout)

Design file: Use the UI design from llm/designs/Logger.jpg

Purpose: Real-time set logging.
Layout (scrollable list of exercises):

WorkoutHeader

SessionTimer (start/pause)

FinishButton (opens finish confirm)

For each exercise:

ExerciseSection

ExerciseHeader

Name, info icon, collapse/expand, move up/down.

SetTable

Columns: Set#, Reps (editable), Weight (editable), Completed (checkbox)

Rows are SetRow

TextInputNumber for reps/weight

CompleteToggle

MoreMenu (duplicate, delete, mark warm-up, RPE, notes)

AddSetRowButton

CopyLastSetButton

NotesButton (opens NotesSheet)

RestTimerButton (opens RestTimerSheet)

AddExerciseFloatingButton (goes to ExercisePicker in “add during workout” mode)

SummaryStrip (total sets, total volume)

States & Edge Cases:

Dirty handling: leaving prompts “save/discard”.

Offline indicator (local-only mode).

Keyboard management: per-input scrolling.

3.4 FinishSummary

Design file: Use the UI design from llm/designs/FinishSummary.jpg

Purpose: Show results and save.
Components:

WorkoutSummaryHeader (date, duration)

KPIGrid: total sets, total reps, total volume

ExerciseSummaryList: each exercise with sets performed

PRList (new personal records)

NotesInput

SaveWorkoutButton

ShareButton (optional)

DeleteSessionButton (if no sets logged)

4. History Tab (HistoryStack)
   4.1 HistoryList

Design file: Use the UI design from llm/designs/HistoryTab.jpg

Purpose: Browse previous workouts.
Components:

CalendarStrip (month/week switch)

SearchAndFilterBar

query, exercise filter, range picker

WorkoutCardList

Each card: date, duration, exercise count, volume; OpenButton

LoadMoreButton or infinite scroll

4.2 WorkoutDetail

Design file: Use the UI design from llm/designs/WorkoutDetail.jpg

Purpose: Full details of one session.
Components:

Header with date/time and RepeatButton

SessionStatsRow: KPIs

ExerciseAccordionList

Inside: SetListReadOnly with reps/weight/checkmarks

SessionNotes

EditButton (duplicates to planner/logger for edits)

DeleteButton (confirm dialog)

5. Progress Tab (ProgressStack)
   5.1 ProgressOverview

Purpose: High-level trends and consistency.
Components:

MetricSwitcher (Segmented control: 1RM Estimate | Top Set | Volume | Frequency)

ConsistencyRing with weekly target completion %

WeeklyBarChart for sessions/sets/volume

PRsRecentList

ByExerciseGrid

Tiles for frequently used exercises; tap opens detail

5.2 ExerciseProgressDetail

Purpose: Deep dive per exercise.
Components:

Header (exercise name, info)

MetricSwitcher

LineChart (e.g., 1RM estimate over time)

BarChart (weekly volume for this exercise)

SessionList filtered to the exercise

ExportButton (CSV/PDF in Profile later)

6. Profile Tab (ProfileStack)
   6.1 ProfileHome

Purpose: Preferences and data management.
Components:

UserHeader (email/anonymous id)

UnitsTile (opens UnitsSettings)

NotificationsTile (toggle + opens OS settings if blocked)

DataTileGroup

ExportDataButton

ImportDataButton

DeleteAllDataButton

AboutTile

6.2 UnitsSettings

Components:

SegmentedControl (kg | lb)

SaveButton

6.3 DataExport

Components:

ExportOptionsList (JSON, CSV)

DestinationPicker (share sheet / files)

GenerateExportButton

ExportsHistoryList (previous exports)

7. Reusable Components (Library)

Buttons

PrimaryButton, SecondaryButton, IconButton, FloatingActionButton

Inputs

TextInput, TextInputNumber, SearchBar, CounterInput, NotesInput

Toggle, Checkbox, SegmentedControl, FilterChip, DateRangePicker

Lists

List, ListItem, ExerciseRow, WorkoutCard, SetRow, Accordion

Feedback

Toast, Snackbar, EmptyState, LoadingSpinner, Skeleton

Charts

LineChart, BarChart, RingProgress

Sheets/Dialogs

BottomSheet, Modal, ConfirmDialog, ActionSheet

RestTimerSheet, ExerciseInfoSheet, NotesSheet, ExercisePresetSheet

Misc

CalendarStrip, KPI, Badge, StreakCounter

8. Forms & Validation (UI Concerns)

Number inputs clamp to valid ranges, support quick increment/decrement.

Required fields for set rows: reps and weight (weight optional for bodyweight).

Unsaved changes guard on Logger and Planner.

Duplicate last set pre-fills values; cursor placed at first editable field.

9. Accessibility & Interaction

All actionable elements receive accessible labels and roles.

Logical focus order; focus moves to new SetRow after creation.

Gestures have equivalent button actions (reorder handles, long-press menus).

Haptics on key actions (add set, complete set, save workout).

Large hit areas; avoid gesture conflicts with scroll.

10. Empty & Error States

No workouts yet: show StartWorkoutCTA on Home and History.

No exercises match filters: suggest clearing filters or adding favorites.

Offline: banner plus queued actions; all logging remains functional.

Data errors: non-blocking toast and retry buttons.

11. Screen-by-Screen Component Hierarchies (condensed)
    Home
    ├─ GreetingHeader
    ├─ QuickStartSection
    ├─ UpcomingSection
    ├─ StreakWidget
    ├─ RecentPRsStrip
    └─ MiniHistoryList

WorkoutPlanner
├─ SectionHeader
├─ ExerciseListEditable
│ └─ ExerciseRow\*
├─ AddExerciseButton
└─ StartWorkoutButton

ExercisePicker
├─ SearchBar
├─ FilterTabs
├─ FilterChips
├─ ExerciseCatalogList
└─ SelectedTray

Logger
├─ WorkoutHeader (Timer, Finish)
├─ ExerciseSection*
│ ├─ ExerciseHeader
│ ├─ SetTable
│ │ └─ SetRow*
│ ├─ AddSetRowButton
│ └─ CopyLastSetButton
├─ RestTimerButton
└─ AddExerciseFloatingButton

FinishSummary
├─ WorkoutSummaryHeader
├─ KPIGrid
├─ ExerciseSummaryList
├─ PRList
├─ NotesInput
└─ SaveWorkoutButton

HistoryList
├─ CalendarStrip
├─ SearchAndFilterBar
└─ WorkoutCardList

WorkoutDetail
├─ Header (Repeat)
├─ SessionStatsRow
├─ ExerciseAccordionList
├─ SessionNotes
└─ Edit/Delete Buttons

ProgressOverview
├─ MetricSwitcher
├─ ConsistencyRing
├─ WeeklyBarChart
├─ PRsRecentList
└─ ByExerciseGrid

ExerciseProgressDetail
├─ Header
├─ MetricSwitcher
├─ LineChart
├─ BarChart
└─ SessionList

ProfileHome
├─ UserHeader
├─ UnitsTile
├─ NotificationsTile
└─ DataTileGroup

12. UI Development Milestones

Scaffold Navigation & Reusables

Bottom tabs + stacks, core buttons/inputs, modal/sheet system, toast.

Exercise Catalog & Picker

Search, filters, list, info sheet, favorites/recent.

Planner & Logger

Editable list, set table, duplicate/add/remove, rest timer sheet, finish flow.

History

Calendar strip, list, detail, repeat workflow.

Progress

Overview widgets, charts, exercise detail.

Profile

Units, notifications, data export stub.

Onboarding

Goal/target flow; permission prompt.

Polish & Edge Cases

Accessibility, empty/error states, keyboard behavior.
