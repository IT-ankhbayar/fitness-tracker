Project Brief — “PulseLift” Fitness Tracker (Mobile)

1. Overview

PulseLift is a modern, mobile-first fitness tracker that lets users plan, record, and analyze their workouts. The app emphasizes fast logging, clean visuals, and motivational feedback using a sleek, dark UI with neon accents.

2. Objectives

Make workout tracking frictionless (seconds per set).

Provide clarity on progress (strength, volume, consistency).

Encourage habit formation with gentle nudges and streaks.

3. Target Users

Beginners to intermediate lifters who want structure.

Busy people who value quick, offline-friendly logging.

Gym-goers who track sets/reps/weight and want progress charts.

4. Scope (MVP)
   Core Features

Track a Workout

Start/Resume/Finish a workout session.

Add exercises from a catalog; re-order or remove.

For each exercise, add sets with reps and weight.

Quick actions: add set, duplicate last set, mark set as complete.

Timer/rest countdown (optional in MVP, simple stopwatch first).

Exercise Catalog

Curated list with metadata & filters:

Muscle group (chest, back, legs, shoulders, arms, core, full body).

Equipment (barbell, dumbbell, kettlebell, machine, cable, bodyweight, band).

Other tags: movement pattern (push/pull/hinge/squat), difficulty, unilateral/bilateral.

Search with autosuggest; recently used; favorites.

Exercise details: form tips, media (later), typical rep ranges.

Previous Workouts

Chronological log with date, duration, total sets/reps/volume.

Drill into a session to see exercises and set history.

“Repeat workout” to prefill today’s plan.

Progress & Consistency

Progress graphs by exercise: 1RM estimate, top set, volume (kg), and weekly set count.

Consistency views: streaks, weekly training days, adherence to plan.

Personal records (PRs): best 1×, 3×, 5×, 10×; badges.

Support Features

Auth (email + password, optional social in v2).

Offline-first local storage with background sync.

Basic settings: units (kg/lb), theme auto (follows system).

5. Out of Scope (MVP → future)

Programs/periodization builder.

Coaching/teams & shared plans.

Wearables integrations.

Video form analysis.

Nutrition tracking.

6. UX & Visual Direction (from provided design vibe)

Theme: Dark, high-contrast surfaces with electric yellow/green accents for calls-to-action and highlights.

Shapes: Rounded, pill buttons; chunky sliders; soft shadows.

Typography: Large, confident headers; roomy line-height.

Components:

Onboarding cards with iconography and playful micro-illustrations.

Radial progress rings and stacked bars for progress/consistency.

Sticky bottom “Continue/Save” pill for primary actions.

Toggle chips & segmented controls for filters.

Motion: Subtle spring transitions on add/remove set; progress ring sweeps.

7. Key Screens & Flows

Onboarding / Goal Target

Set wake time (optional), weekly target days, primary goals (e.g., “get stronger”, “build muscle”).

Home / Today

Quick start workout; show streak and today’s plan.

Exercise Picker

Tabs/filters (Muscle, Equipment, Favorites); search; preview card.

Workout Logger

Exercise sections with set rows (reps, weight, checkbox).

“+ Set”, “Copy last set”, rest timer.

Session summary and Finish.

History

List of past sessions; detail screen.

Progress

Charts per exercise; consistency ring; weekly totals.

8. Data Model (MVP)
   User

- id, email, unitPreference, createdAt

Exercise

- id, name, primaryMuscle, equipment, tags[], isBodyweight

Workout

- id, userId, startedAt, endedAt, notes, totalVolume, status (in_progress|completed)

WorkoutExercise

- id, workoutId, exerciseId, order, notes

Set

- id, workoutExerciseId, setNumber, reps, weight, rpe?, isCompleted

PR

- id, userId, exerciseId, type (1RM|3RM|5RM|10RM|TopSet|Volume), value, date

Computed fields: Estimated 1RM (e.g., Epley), session total volume, streaks.

9. Analytics & Metrics

Activation: first completed workout within 24–72h.

Retention: D7/D30 returning users.

Behavior: median sets logged per session; time-to-log per set (<5s target).

Outcomes: PRs achieved; weeks with ≥ target days.

10. Non-Functional Requirements

Offline-first; conflict-free merges on sync.

<150ms navigation interactions; smooth 60fps scroll.

Accessible contrast; large hit targets.

Privacy: local-first storage; export/delete data.

11. Tech Stack (suggested)

Mobile: React Native + Expo (TypeScript).

State: Zustand or Redux Toolkit for session logging.

Local Storage: SQLite or MMKV (fast set logging).

Backend (optional in MVP): Supabase / PocketBase for auth & sync.

Charts: Recharts/Victory Native or Skia-based light charts.

Testing: Jest + React Native Testing Library; detox (E2E later).

CI/CD: EAS (Expo Application Services).

12. Milestones

Week 1–2: IA, schemas, exercise catalog, local storage.

Week 3–4: Workout logger (sets/reps/weight), history detail, repeat workout.

Week 5: Progress & consistency charts; PRs.

Week 6: Polish: onboarding, streaks, accessibility, QA, TestFlight/Play Internal.

13. Acceptance Criteria (MVP)

User can complete a workout with ≥1 exercise and ≥1 set.

Exercises filterable by muscle and equipment; search returns results <200ms.

History shows last 30 workouts; tapping opens full details.

Progress screen renders: per-exercise estimated 1RM line and weekly volume bars; Consistency ring shows % of weekly goal met.

Works offline; syncs when online without data loss.

Average time to add a set (duplicate last + edit) ≤ 5 seconds.
