// PR Service - Handles personal record detection and management

import { databaseService } from './database';
import { PersonalRecord } from '../types/database';
import { calculate1RM, getTopSet, calculateBest1RM, calculateTotalVolume } from '../utils/calculations';
import { Set, WorkoutExercise } from '../types/database';

class PRService {
  /**
   * Calculate and save PRs for a completed workout
   */
  async calculateAndSaveForWorkout(
    workoutId: number,
    workoutExercises: WorkoutExercise[]
  ): Promise<PersonalRecord[]> {
    const newPRs: PersonalRecord[] = [];

    for (const workoutExercise of workoutExercises) {
      const exerciseId = workoutExercise.exercise_id;
      const sets = workoutExercise.sets || [];

      // Filter completed, non-warmup sets
      const completedSets = sets.filter((s: Set) => s.is_completed === 1 && !s.is_warmup);

      if (completedSets.length === 0) continue;

      // Check for 1RM PR
      const best1RM = calculateBest1RM(completedSets);
      if (best1RM > 0) {
        const previousBest1RM = await this.getBestPR(exerciseId, '1RM');
        if (!previousBest1RM || best1RM > previousBest1RM.value) {
          const pr = await this.savePR(workoutId, exerciseId, '1RM', best1RM);
          newPRs.push(pr);
        }
      }

      // Check for top set PR (heaviest single weight)
      const topSet = getTopSet(completedSets);
      if (topSet) {
        const previousTopSet = await this.getBestPR(exerciseId, 'TopSet');
        if (!previousTopSet || topSet.weight > previousTopSet.value) {
          const pr = await this.savePR(workoutId, exerciseId, 'TopSet', topSet.weight, topSet.reps);
          newPRs.push(pr);
        }
      }

      // Check for volume PR
      const totalVolume = calculateTotalVolume(completedSets);
      if (totalVolume > 0) {
        const previousVolumeSession = await this.getBestPRForExerciseInSession(exerciseId, 'Volume');
        if (!previousVolumeSession || totalVolume > previousVolumeSession.value) {
          const pr = await this.savePR(workoutId, exerciseId, 'Volume', totalVolume);
          newPRs.push(pr);
        }
      }

      // Check for rep PRs (for common rep ranges)
      for (const repTarget of [3, 5, 10]) {
        const bestForReps = this.getBestSetForReps(completedSets, repTarget);
        if (bestForReps) {
          const prType = `${repTarget}RM` as '3RM' | '5RM' | '10RM';
          const estimated1RM = calculate1RM(bestForReps.weight, bestForReps.reps);
          const previousPR = await this.getBestPR(exerciseId, prType);

          if (!previousPR || estimated1RM > previousPR.value) {
            const pr = await this.savePR(workoutId, exerciseId, prType, estimated1RM, repTarget);
            newPRs.push(pr);
          }
        }
      }
    }

    return newPRs;
  }

  /**
   * Get the best set closest to a target rep count
   */
  private getBestSetForReps(sets: Set[], targetReps: number): Set | null {
    // Find sets close to target reps (within +/- 2 reps)
    const relevantSets = sets.filter(
      (s: Set) => s.reps >= targetReps - 2 && s.reps <= targetReps + 2
    );

    if (relevantSets.length === 0) return null;

    // Return the set with highest weight among relevant sets
    return relevantSets.reduce((best, current) =>
      current.weight > best.weight ? current : best
    );
  }

  /**
   * Get the best PR for an exercise and type
   */
  async getBestPR(exerciseId: number, type: string): Promise<PersonalRecord | null> {
    const db = databaseService.getDatabase();

    const results = await db.getAllAsync<PersonalRecord>(
      `SELECT * FROM personal_records
       WHERE exercise_id = ? AND type = ?
       ORDER BY value DESC
       LIMIT 1`,
      [exerciseId, type]
    );

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get the best PR for an exercise in a specific session
   * Used to check if this session's volume beat the previous best
   */
  async getBestPRForExerciseInSession(exerciseId: number, type: string): Promise<PersonalRecord | null> {
    const db = databaseService.getDatabase();

    const results = await db.getAllAsync<PersonalRecord>(
      `SELECT * FROM personal_records
       WHERE exercise_id = ? AND type = ?
       ORDER BY achieved_at DESC
       LIMIT 1`,
      [exerciseId, type]
    );

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Save a new PR
   */
  async savePR(
    workoutId: number,
    exerciseId: number,
    type: string,
    value: number,
    reps?: number
  ): Promise<PersonalRecord> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    const result = await db.runAsync(
      `INSERT INTO personal_records (
        exercise_id, type, value, reps, workout_id, achieved_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [exerciseId, type, value, reps || null, workoutId, now]
    );

    const pr: PersonalRecord = {
      id: result.lastInsertRowId,
      exercise_id: exerciseId,
      type: type as any,
      value,
      reps,
      workout_id: workoutId,
      achieved_at: now,
    };

    console.log(`New PR saved: ${type} for exercise ${exerciseId} = ${value}`);
    return pr;
  }

  /**
   * Get all PRs for an exercise
   */
  async getByExercise(exerciseId: number): Promise<PersonalRecord[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<PersonalRecord>(
      `SELECT * FROM personal_records
       WHERE exercise_id = ?
       ORDER BY achieved_at DESC`,
      [exerciseId]
    );
  }

  /**
   * Get recent PRs
   */
  async getRecent(limit: number = 10): Promise<PersonalRecord[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<PersonalRecord>(
      `SELECT * FROM personal_records
       ORDER BY achieved_at DESC
       LIMIT ?`,
      [limit]
    );
  }

  /**
   * Get PRs achieved in a specific workout
   */
  async getForWorkout(workoutId: number): Promise<PersonalRecord[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<PersonalRecord>(
      `SELECT pr.* FROM personal_records pr
       WHERE pr.workout_id = ?
       ORDER BY pr.type ASC`,
      [workoutId]
    );
  }

  /**
   * Delete a PR
   */
  async delete(id: number): Promise<void> {
    const db = databaseService.getDatabase();
    await db.runAsync('DELETE FROM personal_records WHERE id = ?', [id]);
    console.log(`PR deleted: ${id}`);
  }

  /**
   * Clear all PRs (for testing)
   */
  async clearAll(): Promise<void> {
    const db = databaseService.getDatabase();
    await db.runAsync('DELETE FROM personal_records');
    console.log('All PRs cleared');
  }
}

export const prService = new PRService();
