// Plan service - Handles workout plan CRUD operations

import { databaseService } from './database';
import { Exercise } from '../types/database';

export interface WorkoutPlan {
  id: number;
  name?: string | null;
  notes?: string | null;
  created_at: number;
  updated_at: number;
}

export interface WorkoutPlanExercise {
  id: number;
  plan_id: number;
  exercise_id: number;
  order_index: number;
  notes?: string | null;
  created_at: number;
}

class PlanService {
  /** Create a new plan */
  async create(name?: string, notes?: string): Promise<WorkoutPlan> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    const result = await db.runAsync(
      `INSERT INTO workout_plans (name, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      [name || null, notes || null, now, now]
    );

    return {
      id: result.lastInsertRowId,
      name: name || null,
      notes: notes || null,
      created_at: now,
      updated_at: now,
    };
  }

  /** Get latest plan (by updated_at) */
  async getLatest(): Promise<WorkoutPlan | null> {
    const db = databaseService.getDatabase();

    const rows = await db.getAllAsync<WorkoutPlan>(
      `SELECT * FROM workout_plans ORDER BY updated_at DESC LIMIT 1`
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /** Add multiple exercises to plan in given order */
  async addExercises(planId: number, exerciseIds: number[]): Promise<void> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    await db.execAsync('BEGIN');
    try {
      for (let i = 0; i < exerciseIds.length; i++) {
        const exerciseId = exerciseIds[i];
        await db.runAsync(
          `INSERT INTO workout_plan_exercises (plan_id, exercise_id, order_index, notes, created_at)
           VALUES (?, ?, ?, NULL, ?)`,
          [planId, exerciseId, i, now]
        );
      }
      await db.runAsync(
        `UPDATE workout_plans SET updated_at = ? WHERE id = ?`,
        [now, planId]
      );
      await db.execAsync('COMMIT');
    } catch (e) {
      await db.execAsync('ROLLBACK');
      throw e;
    }
  }

  /** Get planned exercises for a plan with details */
  async getPlanExercises(planId: number): Promise<WorkoutPlanExercise[]> {
    const db = databaseService.getDatabase();
    return await db.getAllAsync<WorkoutPlanExercise>(
      `SELECT * FROM workout_plan_exercises WHERE plan_id = ? ORDER BY order_index ASC`,
      [planId]
    );
  }
}

export const planService = new PlanService();
export type { PlanService };
