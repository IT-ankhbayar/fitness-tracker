import { calculate1RM, calculateTotalVolume, calculateStreak } from '../utils/calculations';
import type { Set } from '../types/database';

describe('utils/calculations', () => {
  test('calculate1RM (Epley) handles reps=1 and reps=0', () => {
    expect(calculate1RM(100, 1)).toBe(100);
    expect(calculate1RM(100, 0)).toBe(0);
  });

  test('calculate1RM (Epley) general case', () => {
    // 100 * (1 + 5/30) = 100 * (1 + 0.1666...) ≈ 116.666...
    const oneRm = calculate1RM(100, 5);
    expect(oneRm).toBeCloseTo(116.67, 2);
  });

  test('calculateTotalVolume sums only completed sets', () => {
    const sets: Set[] = [
      { id: 1, workout_exercise_id: 1, set_number: 1, reps: 5, weight: 100, rpe: 8, is_warmup: 0, is_completed: 1, created_at: Date.now() },
      { id: 2, workout_exercise_id: 1, set_number: 2, reps: 5, weight: 100, rpe: 8, is_warmup: 0, is_completed: 0, created_at: Date.now() },
      { id: 3, workout_exercise_id: 1, set_number: 3, reps: 3, weight: 120, rpe: 9, is_warmup: 0, is_completed: 1, created_at: Date.now() },
    ];
    // Completed sets: (5*100) + (3*120) = 500 + 360 = 860
    expect(calculateTotalVolume(sets)).toBe(860);
  });

  test('calculateStreak counts consecutive days including today/yesterday', () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    expect(calculateStreak([])).toBe(0);
    expect(calculateStreak([twoDaysAgo])).toBe(0); // gap > 1 day
    expect(calculateStreak([yesterday])).toBe(1);
    expect(calculateStreak([today, yesterday])).toBe(2);
  });
});
