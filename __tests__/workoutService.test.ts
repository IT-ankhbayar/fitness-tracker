import { workoutService } from '../services/workoutService';

// Mock the databaseService to avoid importing expo-sqlite and touching a real DB
jest.mock('../services/database', () => {
  const runAsync = jest.fn();
  const getAllAsync = jest.fn();
  const execAsync = jest.fn();
  const db = { runAsync, getAllAsync, execAsync };
  return {
    databaseService: {
      getDatabase: () => db,
    },
    // expose internals to adjust in tests
    __mockDb: db,
  };
});

// Pull in the mock db handle
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __mockDb } = require('../services/database');

describe('services/workoutService.recalculateTotals', () => {
  test('updates workout totals with values from aggregation query', async () => {
    // Arrange aggregation result returned by getAllAsync
    __mockDb.getAllAsync.mockResolvedValueOnce([
      { total_sets: 7, total_reps: 35, total_volume: 4200 },
    ]);

    // Spy on update to ensure it receives computed totals
    const updateSpy = jest
      .spyOn(workoutService, 'update')
      .mockResolvedValue(undefined);

    // Act
    await workoutService.recalculateTotals(123);

    // Assert
    expect(updateSpy).toHaveBeenCalledWith(123, {
      total_sets: 7,
      total_reps: 35,
      total_volume: 4200,
    });

    // Cleanup
    updateSpy.mockRestore();
  });
});
