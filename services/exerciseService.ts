// Exercise service - Handles exercise CRUD operations and queries

import { databaseService } from './database';
import { Exercise, ExerciseFilters } from '../types/database';
import exerciseSeedData from '../data/exercises.json';

class ExerciseService {
  /**
   * Seed exercises from JSON file if database is empty
   */
  async seedExercises(): Promise<void> {
    const db = databaseService.getDatabase();

    // Check if exercises already exist
    const existing = await db.getAllAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises'
    );

    if (existing[0].count > 0) {
      console.log('Exercises already seeded');
      return;
    }

    console.log('Seeding exercises...');

    const now = Date.now();

    for (const exercise of exerciseSeedData) {
      await db.runAsync(
        `INSERT INTO exercises (
          name, primary_muscle, secondary_muscles, equipment,
          movement_pattern, is_bodyweight, difficulty, form_tips,
          is_favorite, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          exercise.name,
          exercise.primary_muscle,
          exercise.secondary_muscles,
          exercise.equipment,
          exercise.movement_pattern,
          exercise.is_bodyweight ? 1 : 0,
          exercise.difficulty,
          exercise.form_tips,
          now,
        ]
      );
    }

    console.log(`Seeded ${exerciseSeedData.length} exercises`);
  }

  /**
   * Get all exercises
   */
  async getAll(): Promise<Exercise[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<Exercise>(
      'SELECT * FROM exercises ORDER BY name ASC'
    );
  }

  /**
   * Get exercise by ID
   */
  async getById(id: number): Promise<Exercise | null> {
    const db = databaseService.getDatabase();

    const results = await db.getAllAsync<Exercise>(
      'SELECT * FROM exercises WHERE id = ?',
      [id]
    );

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get favorite exercises
   */
  async getFavorites(): Promise<Exercise[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<Exercise>(
      'SELECT * FROM exercises WHERE is_favorite = 1 ORDER BY name ASC'
    );
  }

  /**
   * Get recently used exercises
   */
  async getRecentlyUsed(limit: number = 10): Promise<Exercise[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<Exercise>(
      `SELECT * FROM exercises
       WHERE last_used_at IS NOT NULL
       ORDER BY last_used_at DESC
       LIMIT ?`,
      [limit]
    );
  }

  /**
   * Search exercises by name
   */
  async search(query: string): Promise<Exercise[]> {
    if (!query.trim()) {
      return this.getAll();
    }

    const db = databaseService.getDatabase();

    const searchPattern = `%${query.toLowerCase()}%`;

    return await db.getAllAsync<Exercise>(
      `SELECT * FROM exercises
       WHERE LOWER(name) LIKE ?
       OR LOWER(primary_muscle) LIKE ?
       OR LOWER(equipment) LIKE ?
       ORDER BY name ASC`,
      [searchPattern, searchPattern, searchPattern]
    );
  }

  /**
   * Filter exercises based on criteria
   */
  async filter(filters: ExerciseFilters): Promise<Exercise[]> {
    const db = databaseService.getDatabase();

    let sql = 'SELECT * FROM exercises WHERE 1=1';
    const params: any[] = [];

    // Search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchPattern = `%${filters.searchQuery.toLowerCase()}%`;
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(primary_muscle) LIKE ? OR LOWER(equipment) LIKE ?)';
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Muscle groups filter
    if (filters.muscles && filters.muscles.length > 0) {
      const muscleConditions = filters.muscles
        .map(() => 'primary_muscle = ?')
        .join(' OR ');
      sql += ` AND (${muscleConditions})`;
      params.push(...filters.muscles);
    }

    // Equipment filter
    if (filters.equipment && filters.equipment.length > 0) {
      const equipmentConditions = filters.equipment
        .map(() => 'equipment = ?')
        .join(' OR ');
      sql += ` AND (${equipmentConditions})`;
      params.push(...filters.equipment);
    }

    // Favorites filter
    if (filters.favorites) {
      sql += ' AND is_favorite = 1';
    }

    // Recently used filter
    if (filters.recent) {
      sql += ' AND last_used_at IS NOT NULL ORDER BY last_used_at DESC';
    } else {
      sql += ' ORDER BY name ASC';
    }

    return await db.getAllAsync<Exercise>(sql, params);
  }

  /**
   * Toggle exercise favorite status
   */
  async toggleFavorite(id: number): Promise<void> {
    const db = databaseService.getDatabase();

    // Get current status
    const exercise = await this.getById(id);
    if (!exercise) {
      throw new Error('Exercise not found');
    }

    // Toggle status
    const newStatus = exercise.is_favorite ? 0 : 1;

    await db.runAsync(
      'UPDATE exercises SET is_favorite = ? WHERE id = ?',
      [newStatus, id]
    );
  }

  /**
   * Update last used timestamp for an exercise
   */
  async updateLastUsed(id: number): Promise<void> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    await db.runAsync(
      'UPDATE exercises SET last_used_at = ? WHERE id = ?',
      [now, id]
    );
  }

  /**
   * Get exercises by muscle group
   */
  async getByMuscle(muscle: string): Promise<Exercise[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<Exercise>(
      'SELECT * FROM exercises WHERE primary_muscle = ? ORDER BY name ASC',
      [muscle]
    );
  }

  /**
   * Get exercises by equipment
   */
  async getByEquipment(equipment: string): Promise<Exercise[]> {
    const db = databaseService.getDatabase();

    return await db.getAllAsync<Exercise>(
      'SELECT * FROM exercises WHERE equipment = ? ORDER BY name ASC',
      [equipment]
    );
  }

  /**
   * Get exercises with usage statistics
   */
  async getWithStats(exerciseId: number): Promise<{
    exercise: Exercise;
    totalWorkouts: number;
    totalSets: number;
    totalVolume: number;
    lastUsed: number | null;
  } | null> {
    const db = databaseService.getDatabase();

    const exercise = await this.getById(exerciseId);
    if (!exercise) {
      return null;
    }

    // Get workout count
    const workoutResults = await db.getAllAsync<{ count: number }>(
      `SELECT COUNT(DISTINCT we.workout_id) as count
       FROM workout_exercises we
       WHERE we.exercise_id = ?`,
      [exerciseId]
    );

    // Get total sets
    const setResults = await db.getAllAsync<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM sets s
       JOIN workout_exercises we ON s.workout_exercise_id = we.id
       WHERE we.exercise_id = ?`,
      [exerciseId]
    );

    // Get total volume
    const volumeResults = await db.getAllAsync<{ volume: number | null }>(
      `SELECT SUM(s.reps * s.weight) as volume
       FROM sets s
       JOIN workout_exercises we ON s.workout_exercise_id = we.id
       WHERE we.exercise_id = ? AND s.is_completed = 1`,
      [exerciseId]
    );

    return {
      exercise,
      totalWorkouts: workoutResults[0]?.count || 0,
      totalSets: setResults[0]?.count || 0,
      totalVolume: volumeResults[0]?.volume || 0,
      lastUsed: exercise.last_used_at || null,
    };
  }

  /**
   * Get top exercises by usage (for dashboard)
   */
  async getTopExercises(limit: number = 5): Promise<
    Array<{
      exercise: Exercise;
      workoutCount: number;
      setCount: number;
    }>
  > {
    const db = databaseService.getDatabase();

    const results = await db.getAllAsync<{
      id: number;
      name: string;
      primary_muscle: string;
      equipment: string;
      workout_count: number;
      set_count: number;
    }>(
      `SELECT
        e.id,
        e.name,
        e.primary_muscle,
        e.equipment,
        COUNT(DISTINCT we.workout_id) as workout_count,
        COUNT(s.id) as set_count
       FROM exercises e
       JOIN workout_exercises we ON e.id = we.exercise_id
       LEFT JOIN sets s ON we.id = s.workout_exercise_id
       GROUP BY e.id
       ORDER BY workout_count DESC, set_count DESC
       LIMIT ?`,
      [limit]
    );

    // Map results to include full exercise data
    const topExercises = [];
    for (const result of results) {
      const exercise = await this.getById(result.id);
      if (exercise) {
        topExercises.push({
          exercise,
          workoutCount: result.workout_count,
          setCount: result.set_count,
        });
      }
    }

    return topExercises;
  }

  /**
   * Create a custom exercise (for future enhancement)
   */
  async create(exerciseData: Omit<Exercise, 'id' | 'created_at'>): Promise<number> {
    const db = databaseService.getDatabase();
    const now = Date.now();

    const result = await db.runAsync(
      `INSERT INTO exercises (
        name, primary_muscle, secondary_muscles, equipment,
        movement_pattern, is_bodyweight, difficulty, form_tips,
        is_favorite, last_used_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exerciseData.name,
        exerciseData.primary_muscle,
        exerciseData.secondary_muscles || null,
        exerciseData.equipment,
        exerciseData.movement_pattern || null,
        exerciseData.is_bodyweight ? 1 : 0,
        exerciseData.difficulty || null,
        exerciseData.form_tips || null,
        exerciseData.is_favorite ? 1 : 0,
        exerciseData.last_used_at || null,
        now,
      ]
    );

    return result.lastInsertRowId;
  }

  /**
   * Delete an exercise (use with caution - will affect workout history)
   */
  async delete(id: number): Promise<void> {
    const db = databaseService.getDatabase();

    // Note: This will cascade delete workout_exercises and sets due to foreign keys
    await db.runAsync('DELETE FROM exercises WHERE id = ?', [id]);
  }
}

// Export singleton instance
export const exerciseService = new ExerciseService();

// Export type
export type { ExerciseService };
