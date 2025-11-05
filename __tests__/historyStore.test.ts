import { jest } from '@jest/globals';
import { useHistoryStore } from '../store/historyStore';

// Mock services used by the store
jest.mock('../services/workoutService', () => ({
  workoutService: {
    getAllPaged: jest.fn(),
    getById: jest.fn(),
    getWorkoutExercises: jest.fn(),
    getSets: jest.fn(),
    delete: jest.fn(),
    addExercise: jest.fn(),
    addSet: jest.fn(),
  },
}));

jest.mock('../services/exerciseService', () => ({
  exerciseService: {
    getById: jest.fn(),
  },
}));

jest.mock('../store/workoutStore', () => ({
  useWorkoutStore: {
    getState: () => ({
      startWorkout: async () => ({ id: 999 } as any),
      reloadWorkoutExercises: async () => undefined,
    }) as any,
  },
}));

import { workoutService } from '../services/workoutService';
const mockedWorkoutService: any = workoutService as any;

function makeWorkout(id: number) {
  const now = Date.now();
  return {
    id,
    started_at: now - id * 1000,
    ended_at: undefined,
    duration: undefined,
    notes: undefined,
    total_volume: 0,
    total_sets: 0,
    total_reps: 0,
    status: 'completed' as const,
    created_at: now - id * 1000,
    updated_at: now - id * 1000,
    exercise_count: 0,
  };
}

describe('useHistoryStore', () => {
  beforeEach(() => {
    // Reset store state
    useHistoryStore.setState({
      items: [],
      isLoading: false,
      hasMore: true,
      page: 0,
      error: undefined,
    } as any);

    jest.clearAllMocks();
  });

  it('loads initial page and sets pagination flags', async () => {
    const pageSize = useHistoryStore.getState().pageSize;
    const firstPage = Array.from({ length: pageSize }, (_, i) => makeWorkout(i + 1));
  mockedWorkoutService.getAllPaged.mockResolvedValueOnce(firstPage);

    await useHistoryStore.getState().loadInitial();

    const state = useHistoryStore.getState();
    expect(state.items).toHaveLength(pageSize);
    expect(state.page).toBe(1);
    expect(state.hasMore).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeUndefined();
  expect(mockedWorkoutService.getAllPaged).toHaveBeenCalledWith(pageSize, 0);
  });

  it('appends more items on loadMore and updates hasMore', async () => {
    const pageSize = useHistoryStore.getState().pageSize;
    const firstPage = Array.from({ length: pageSize }, (_, i) => makeWorkout(i + 1));
    const nextPage = Array.from({ length: 5 }, (_, i) => makeWorkout(pageSize + i + 1));

    mockedWorkoutService.getAllPaged
      .mockResolvedValueOnce(firstPage) // initial
      .mockResolvedValueOnce(nextPage); // loadMore

    await useHistoryStore.getState().loadInitial();
    await useHistoryStore.getState().loadMore();

    const state = useHistoryStore.getState();
    expect(state.items).toHaveLength(pageSize + nextPage.length);
    expect(state.page).toBe(2);
    expect(state.hasMore).toBe(false); // because nextPage < pageSize
  expect(mockedWorkoutService.getAllPaged).toHaveBeenCalledWith(pageSize, 0);
  expect(mockedWorkoutService.getAllPaged).toHaveBeenCalledWith(pageSize, pageSize);
  });

  it('sets error on load failure and clears it on retry', async () => {
    const pageSize = useHistoryStore.getState().pageSize;
  mockedWorkoutService.getAllPaged.mockRejectedValueOnce(new Error('DB down'));

    await useHistoryStore.getState().loadInitial();
    let state = useHistoryStore.getState();
    expect(state.error).toMatch(/DB down/);
    expect(state.isLoading).toBe(false);
    expect(state.items).toHaveLength(0);

    // Next attempt succeeds
    const firstPage = Array.from({ length: pageSize }, (_, i) => makeWorkout(i + 1));
  mockedWorkoutService.getAllPaged.mockResolvedValueOnce(firstPage);

    await useHistoryStore.getState().loadInitial();
    state = useHistoryStore.getState();
    expect(state.error).toBeUndefined();
    expect(state.items).toHaveLength(pageSize);
  });

  it('does nothing on loadMore when hasMore is false', async () => {
    const pageSize = useHistoryStore.getState().pageSize;
    const firstPage = Array.from({ length: pageSize }, (_, i) => makeWorkout(i + 1));
    const nextPage = Array.from({ length: 3 }, (_, i) => makeWorkout(pageSize + i + 1));

    mockedWorkoutService.getAllPaged
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(nextPage);

    await useHistoryStore.getState().loadInitial();
    await useHistoryStore.getState().loadMore(); // hasMore becomes false

    jest.clearAllMocks();

    // Try loading more again - should not call service
    await useHistoryStore.getState().loadMore();
  expect(mockedWorkoutService.getAllPaged).not.toHaveBeenCalled();
  });
});
