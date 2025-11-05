// Progress store - Aggregated metrics for Progress tab

import { create } from 'zustand';
import { prService } from '../services/prService';
import { exerciseService } from '../services/exerciseService';
import { workoutService } from '../services/workoutService';
import { calculateStreak, calculateWeeklyConsistency } from '../utils/calculations';
import { PersonalRecord, Exercise, Workout } from '../types/database';
import { useSettingsStore } from './settingsStore';

export interface WeeklyVolumePoint {
  weekStart: number; // ms epoch at local week start (Mon 00:00)
  label: string; // e.g., 'Oct 28'
  volume: number; // sum of workout.total_volume that week
}

export interface TopExerciseItem {
  exercise: Exercise;
  workoutCount: number;
  setCount: number;
}

interface ProgressState {
  loading: boolean;
  error?: string;

  weeklyTarget: number;
  weeklyCount: number;
  consistencyPct: number;
  streak: number;

  weeklyVolumeSeries: WeeklyVolumePoint[];
  recentPRs: Array<PersonalRecord & { exerciseName?: string }>;
  topExercises: TopExerciseItem[];

  load: (opts?: { weeks?: number }) => Promise<void>;
  refresh: () => Promise<void>;
}

function startOfLocalWeek(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Make Monday the first day of week
  const day = d.getDay(); // 0=Sun,1=Mon,...
  const diffToMonday = (day + 6) % 7; // Sun->6, Mon->0, ...
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

function formatWeekLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  loading: false,
  error: undefined,

  weeklyTarget: 0,
  weeklyCount: 0,
  consistencyPct: 0,
  streak: 0,

  weeklyVolumeSeries: [],
  recentPRs: [],
  topExercises: [],

  load: async (opts) => {
    const weeks = opts?.weeks ?? 8;
    set({ loading: true, error: undefined });

    try {
      // Settings
      const weeklyTarget = useSettingsStore.getState().weeklyTargetDays ?? 0;

      // Fetch base data in parallel
      const [allWorkouts, rawRecentPRs, topExercises] = await Promise.all([
        workoutService.getAll(),
        prService.getRecent(10),
        exerciseService.getTopExercises(5),
      ]);

      const completed = (allWorkouts || []).filter((w) => w.status === 'completed');

      // Weekly count + consistency for this week
      const weekStart = startOfLocalWeek();
      const weekStartMs = weekStart.getTime();
      const nextWeekStartMs = new Date(weekStartMs + 7 * 24 * 60 * 60 * 1000).getTime();
      const thisWeekWorkouts = completed.filter(
        (w) => (w.started_at >= weekStartMs && w.started_at < nextWeekStartMs)
      );
      const weeklyCount = thisWeekWorkouts.length;
      const consistencyPct = calculateWeeklyConsistency(weeklyCount, weeklyTarget);

      // Streak from workout days
      const workoutDates = completed.map((w) => new Date(w.started_at));
      const streak = calculateStreak(workoutDates);

      // Weekly volume series (last N weeks, ascending by time)
      const series: WeeklyVolumePoint[] = [];
      for (let i = weeks - 1; i >= 0; i--) {
        const start = startOfLocalWeek(new Date(weekStartMs - i * 7 * 24 * 60 * 60 * 1000));
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        const vol = completed
          .filter((w) => w.started_at >= start.getTime() && w.started_at < end.getTime())
          .reduce((sum, w) => sum + (w.total_volume || 0), 0);
        series.push({ weekStart: start.getTime(), label: formatWeekLabel(start.getTime()), volume: vol });
      }

      // Enrich PRs with exercise names (map unique ids)
      const distinctExerciseIds = Array.from(new Set(rawRecentPRs.map((p) => p.exercise_id)));
      const nameMap = new Map<number, string>();
      for (const exId of distinctExerciseIds) {
        const ex = await exerciseService.getById(exId);
        if (ex) nameMap.set(exId, ex.name);
      }
      const recentPRs = rawRecentPRs.map((p) => ({ ...p, exerciseName: nameMap.get(p.exercise_id) }));

      set({
        loading: false,
        error: undefined,
        weeklyTarget,
        weeklyCount,
        consistencyPct,
        streak,
        weeklyVolumeSeries: series,
        recentPRs,
        topExercises,
      });
    } catch (e) {
      console.error('Failed to load progress metrics:', e);
      set({ loading: false, error: e instanceof Error ? e.message : 'Failed to load progress' });
    }
  },

  refresh: async () => {
    return get().load();
  },
}));
