// Workout service - Handles workout CRUD operations

import { databaseService } from './database';
import { exerciseService } from './exerciseService';
import { Workout, WorkoutExercise, Set } from '../types/database';

class WorkoutService {
  /**
   * Create a new workout
   */
  async create(): Promise<Workout> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    const result = await db.runAsync(
      `INSERT INTO workouts (
        started_at, status, total_volume, total_sets, total_reps,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [now, 'in_progress', 0, 0, 0, now, now]
    );

    const workout: Workout = {
      id: result.lastInsertRowId,
      started_at: now,
      ended_at: undefined,
      duration: undefined,
      notes: undefined,
      total_volume: 0,
      total_sets: 0,
      total_reps: 0,
      status: 'in_progress',
      created_at: now,
      updated_at: now,
    };

    console.log('Created workout:', workout.id);
    return workout;
  }

  /**
   * Get workout by ID
   */
  async getById(id: number): Promise<Workout | null> {
    const db = databaseService.getDatabase();

    const results = await db.getAllAsync<Workout>(
      'SELECT * FROM workouts WHERE id = ?',
      [id]
    );

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get all workouts (with optional limit)
   */
  async getAll(limit?: number): Promise<Workout[]> {
    const db = databaseService.getDatabase();

    const sql = limit
      ? 'SELECT * FROM workouts ORDER BY started_at DESC LIMIT ?'
      : 'SELECT * FROM workouts ORDER BY started_at DESC';

    const params = limit ? [limit] : [];

    return await db.getAllAsync<Workout>(sql, params);
  }

  /**
   * Get active (in-progress) workout
   */
  async getActive(): Promise<Workout | null> {
    const db = databaseService.getDatabase();

    const results = await db.getAllAsync<Workout>(
      `SELECT * FROM workouts
       WHERE status = 'in_progress'
       ORDER BY started_at DESC
       LIMIT 1`
    );

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Update workout
   */
  async update(id: number, data: Partial<Workout>): Promise<void> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    const updates: string[] = [];
    const params: any[] = [];

    if (data.ended_at !== undefined) {
      updates.push('ended_at = ?');
      params.push(data.ended_at);
    }
    if (data.duration !== undefined) {
      updates.push('duration = ?');
      params.push(data.duration);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.total_volume !== undefined) {
      updates.push('total_volume = ?');
      params.push(data.total_volume);
    }
    if (data.total_sets !== undefined) {
      updates.push('total_sets = ?');
      params.push(data.total_sets);
    }
    if (data.total_reps !== undefined) {
      updates.push('total_reps = ?');
      params.push(data.total_reps);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const sql = `UPDATE workouts SET ${updates.join(', ')} WHERE id = ?`;

    await db.runAsync(sql, params);
    console.log('Updated workout:', id);
  }

  /**
   * Delete workout
   */
  async delete(id: number): Promise<void> {
    const db = databaseService.getDatabase();

    await db.runAsync('DELETE FROM workouts WHERE id = ?', [id]);
    console.log('Deleted workout:', id);
  }

  /**
   * Finish workout (mark as completed)
   */
  async finish(id: number): Promise<void> {
    const now = Date.now();
    const workout = await this.getById(id);

    if (!workout) throw new Error('Workout not found');

    const duration = Math.floor((now - workout.started_at) / 1000); // seconds

    await this.update(id, {
      ended_at: now,
      duration,
      status: 'completed',
    });

    // Recalculate totals
    await this.recalculateTotals(id);

    console.log('Finished workout:', id);
  }

  /**
   * Add exercise to workout
   */
  async addExercise(workoutId: number, exerciseId: number): Promise<WorkoutExercise> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    // Get next order index
    const orderResults = await db.getAllAsync<{ max_order: number | null }>(
      'SELECT MAX(order_index) as max_order FROM workout_exercises WHERE workout_id = ?',
      [workoutId]
    );

    const orderIndex = (orderResults[0]?.max_order ?? -1) + 1;

    const result = await db.runAsync(
      `INSERT INTO workout_exercises (
        workout_id, exercise_id, order_index, created_at
      ) VALUES (?, ?, ?, ?)`,
      [workoutId, exerciseId, orderIndex, now]
    );

    // Update exercise last_used_at
    await exerciseService.updateLastUsed(exerciseId);

    const workoutExercise: WorkoutExercise = {
      id: result.lastInsertRowId,
      workout_id: workoutId,
      exercise_id: exerciseId,
      order_index: orderIndex,
      notes: undefined,
      created_at: now,
    };

    console.log('Added exercise to workout:', workoutExercise.id);
    return workoutExercise;
  }

  /**
   * Remove exercise from workout
   */
  async removeExercise(workoutExerciseId: number): Promise<void> {
    const db = databaseService.getDatabase();

    await db.runAsync('DELETE FROM workout_exercises WHERE id = ?', [workoutExerciseId]);
    console.log('Removed workout exercise:', workoutExerciseId);
  }

  /**
   * Get exercises for a workout
   */
  async getWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<WorkoutExercise>(
      `SELECT * FROM workout_exercises
       WHERE workout_id = ?
       ORDER BY order_index ASC`,
      [workoutId]
    );
  }

  /**
   * Reorder workout exercises by setting their order_index according to provided ids
   */
  async reorderExercises(workoutId: number, orderedWorkoutExerciseIds: number[]): Promise<void> {
    const db = databaseService.getDatabase();

    // Use a transaction to ensure atomic update
    await db.execAsync('BEGIN');
    try {
      for (let i = 0; i < orderedWorkoutExerciseIds.length; i++) {
        const id = orderedWorkoutExerciseIds[i];
        await db.runAsync(
          'UPDATE workout_exercises SET order_index = ? WHERE id = ? AND workout_id = ?',
          [i, id, workoutId]
        );
      }
      await db.execAsync('COMMIT');
      console.log('Reordered workout exercises for workout:', workoutId, orderedWorkoutExerciseIds);
    } catch (e) {
      await db.execAsync('ROLLBACK');
      throw e;
    }
  }

  /**
   * Add set to workout exercise
   */
  async addSet(workoutExerciseId: number, setData: Partial<Set>): Promise<Set> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    // Get next set number
    const setResults = await db.getAllAsync<{ max_set: number | null }>(
      'SELECT MAX(set_number) as max_set FROM sets WHERE workout_exercise_id = ?',
      [workoutExerciseId]
    );

    const setNumber = (setResults[0]?.max_set ?? 0) + 1;

    const result = await db.runAsync(
      `INSERT INTO sets (
        workout_exercise_id, set_number, reps, weight, rpe,
        is_warmup, is_completed, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        workoutExerciseId,
        setNumber,
        setData.reps || 0,
        setData.weight || 0,
        setData.rpe || null,
        setData.is_warmup || 0,
        setData.is_completed || 0,
        setData.notes || null,
        now,
      ]
    );

    const set: Set = {
      id: result.lastInsertRowId,
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      reps: setData.reps || 0,
      weight: setData.weight || 0,
      rpe: setData.rpe,
      is_warmup: setData.is_warmup || 0,
      is_completed: setData.is_completed || 0,
      notes: setData.notes,
      created_at: now,
    };

    console.log('Added set:', set.id);
    return set;
  }

  /**
   * Update set
   */
  async updateSet(setId: number, data: Partial<Set>): Promise<void> {
    const db = databaseService.getDatabase();

    const updates: string[] = [];
    const params: any[] = [];

    if (data.reps !== undefined) {
      updates.push('reps = ?');
      params.push(data.reps);
    }
    if (data.weight !== undefined) {
      updates.push('weight = ?');
      params.push(data.weight);
    }
    if (data.rpe !== undefined) {
      updates.push('rpe = ?');
      params.push(data.rpe);
    }
    if (data.is_warmup !== undefined) {
      updates.push('is_warmup = ?');
      params.push(data.is_warmup);
    }
    if (data.is_completed !== undefined) {
      updates.push('is_completed = ?');
      params.push(data.is_completed);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (updates.length === 0) return;

    params.push(setId);

    const sql = `UPDATE sets SET ${updates.join(', ')} WHERE id = ?`;

    await db.runAsync(sql, params);
    console.log('Updated set:', setId);
  }

  /**
   * Delete set
   */
  async deleteSet(setId: number): Promise<void> {
    const db = databaseService.getDatabase();

    await db.runAsync('DELETE FROM sets WHERE id = ?', [setId]);
    console.log('Deleted set:', setId);
  }

  /**
   * Get sets for a workout exercise
   */
  async getSets(workoutExerciseId: number): Promise<Set[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<Set>(
      'SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number ASC',
      [workoutExerciseId]
    );
  }

  /**
   * Recalculate workout totals
   */
  async recalculateTotals(workoutId: number): Promise<void> {
    const db = databaseService.getDatabase();

    const results = await db.getAllAsync<{
      total_sets: number;
      total_reps: number;
      total_volume: number;
    }>(
      `SELECT
        COUNT(*) as total_sets,
        SUM(reps) as total_reps,
        SUM(reps * weight) as total_volume
       FROM sets s
       JOIN workout_exercises we ON s.workout_exercise_id = we.id
       WHERE we.workout_id = ? AND s.is_completed = 1`,
      [workoutId]
    );

    const totals = results[0] || { total_sets: 0, total_reps: 0, total_volume: 0 };

    await this.update(workoutId, {
      total_sets: totals.total_sets || 0,
      total_reps: totals.total_reps || 0,
      total_volume: totals.total_volume || 0,
    });

    console.log('Recalculated totals for workout:', workoutId, totals);
  }

  /**
   * Duplicate last set (copy previous set data)
   */
  async duplicateLastSet(workoutExerciseId: number): Promise<Set | null> {
    const sets = await this.getSets(workoutExerciseId);

    if (sets.length === 0) return null;

    const lastSet = sets[sets.length - 1];

    return await this.addSet(workoutExerciseId, {
      reps: lastSet.reps,
      weight: lastSet.weight,
      rpe: lastSet.rpe,
      is_warmup: lastSet.is_warmup,
      is_completed: 0, // New set starts uncompleted
    });
  }
}

// Export singleton instance
export const workoutService = new WorkoutService();

// Export type
export type { WorkoutService };
