import { jest } from '@jest/globals';
// Mock DB layer to avoid pulling in expo-sqlite ESM during tests
jest.mock('../services/database', () => ({
  databaseService: {
    getDatabase: () => ({
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
      execAsync: jest.fn(),
    }),
  },
}));


jest.mock('../services/workoutService', () => ({
  workoutService: {
    getAll: jest.fn(),
  },
}));

jest.mock('../services/prService', () => ({
  prService: {
    getRecent: jest.fn(),
  },
}));

jest.mock('../services/exerciseService', () => ({
  exerciseService: {
    getTopExercises: jest.fn(),
    getById: jest.fn(),
  },
}));

import { workoutService } from '../services/workoutService';
import { prService } from '../services/prService';
import { exerciseService } from '../services/exerciseService';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';

const mockedWorkoutService: any = workoutService as any;
const mockedPrService: any = prService as any;
const mockedExerciseService: any = exerciseService as any;

function makeWorkout(overrides: Partial<any> = {}) {
  const now = Date.now();
  return {
    id: Math.floor(Math.random() * 100000),
    started_at: now,
    ended_at: now,
    duration: 3600,
    notes: undefined,
    total_volume: 0,
    total_sets: 0,
    total_reps: 0,
    status: 'completed',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe('useProgressStore', () => {
  const fixedNow = new Date('2025-11-05T12:00:00.000Z'); // Wednesday

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Reset stores
    useProgressStore.setState({
      loading: false,
      error: undefined,
      weeklyTarget: 0,
      weeklyCount: 0,
      consistencyPct: 0,
      streak: 0,
      weeklyVolumeSeries: [],
      recentPRs: [],
      topExercises: [],
    } as any);
    useSettingsStore.setState({ weeklyTargetDays: 4 } as any);

    jest.clearAllMocks();
  });

  it('computes weekly count, consistency, streak, series and enriches PRs', async () => {
    const now = fixedNow.getTime();

    // Build workouts: two in current week (Mon and Wed), one last week
    // Determine Monday of current week (local rules inside store) - approximate using fixedNow
    const wed = new Date(now);
    const mon = new Date(now);
    mon.setDate(wed.getDate() - ((wed.getDay() + 6) % 7)); // Monday
    mon.setHours(10, 0, 0, 0);

    const monStart = mon.getTime();
    const wedStart = new Date(now).setHours(9, 0, 0, 0);

    const lastWeekMon = new Date(monStart - 7 * 24 * 60 * 60 * 1000).getTime();

    const workouts = [
      makeWorkout({ id: 1, started_at: monStart, status: 'completed', total_volume: 1000 }),
      makeWorkout({ id: 2, started_at: wedStart, status: 'completed', total_volume: 1500 }),
      makeWorkout({ id: 3, started_at: lastWeekMon, status: 'completed', total_volume: 900 }),
      makeWorkout({ id: 4, started_at: now, status: 'in_progress' }), // ignored
    ];

    mockedWorkoutService.getAll.mockResolvedValueOnce(workouts);

    // Recent PRs with names enrichment
    mockedPrService.getRecent.mockResolvedValueOnce([
      { id: 1, exercise_id: 10, type: '1RM', value: 150, reps: 1, workout_id: 2, achieved_at: now - 1000 },
      { id: 2, exercise_id: 20, type: 'TopSet', value: 120, reps: 5, workout_id: 2, achieved_at: now - 2000 },
    ]);
    mockedExerciseService.getById
      .mockResolvedValueOnce({ id: 10, name: 'Squat' })
      .mockResolvedValueOnce({ id: 20, name: 'Bench' });

    // Top exercises
    mockedExerciseService.getTopExercises.mockResolvedValueOnce([
      { exercise: { id: 10, name: 'Squat' }, workoutCount: 5, setCount: 30 },
    ]);

    await useProgressStore.getState().load({ weeks: 2 });

    const state = useProgressStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBeUndefined();
    expect(state.weeklyTarget).toBe(4);
    expect(state.weeklyCount).toBe(2);
    expect(Math.round(state.consistencyPct)).toBe(50);
    expect(state.streak).toBeGreaterThanOrEqual(1); // today/yesterday proximity yields >=1

    // Series for 2 weeks
    expect(state.weeklyVolumeSeries).toHaveLength(2);
    const totalThisWeek = 1000 + 1500;
    const totalLastWeek = 900;
    // Ascending by time: index 0 -> last week, index 1 -> this week
    expect(state.weeklyVolumeSeries[1].volume).toBe(totalThisWeek);
    expect(state.weeklyVolumeSeries[0].volume).toBe(totalLastWeek);

    // PRs enriched
    expect(state.recentPRs).toHaveLength(2);
    expect(state.recentPRs[0].exerciseName).toBeDefined();

    // Top exercises passthrough
    expect(state.topExercises).toHaveLength(1);
    expect(state.topExercises[0].exercise.name).toBe('Squat');
  });

  it('sets error when a service throws', async () => {
    mockedWorkoutService.getAll.mockRejectedValueOnce(new Error('boom'));
    mockedPrService.getRecent.mockResolvedValueOnce([]);
    mockedExerciseService.getTopExercises.mockResolvedValueOnce([]);

    await useProgressStore.getState().load();
    const state = useProgressStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toMatch(/boom|progress/i);
  });
});
