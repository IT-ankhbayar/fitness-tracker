// Import Service - Restores app data from a JSON export

import { databaseService } from './database';

type ImportPayload = {
  app: 'PulseLift';
  version: number;
  exported_at: number;
  tables: {
    settings?: Array<{ key: string; value: string; updated_at?: number }>;
    exercises?: any[];
    workouts?: any[];
    workout_exercises?: any[];
    sets?: any[];
    personal_records?: any[];
  };
};

class ImportService {
  async importJSON(json: string): Promise<void> {
    let payload: ImportPayload;
    try {
      payload = JSON.parse(json);
    } catch (e) {
      throw new Error('Invalid JSON');
    }

    if (!payload || payload.app !== 'PulseLift' || !payload.tables) {
      throw new Error('Unsupported export format');
    }

    // Reset database (drops and recreates tables + default settings)
    await databaseService.reset();

    const db = databaseService.getDatabase();

    // Insert data in FK-safe order
    // Note: Explicitly insert IDs if present
    await db.execAsync('BEGIN');
    try {
      // Settings
      if (payload.tables.settings && payload.tables.settings.length > 0) {
        for (const s of payload.tables.settings) {
          await db.runAsync(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
            [s.key, s.value, s.updated_at || Date.now()]
          );
        }
      }

      // Exercises
      if (payload.tables.exercises && payload.tables.exercises.length > 0) {
        for (const ex of payload.tables.exercises) {
          const keys = Object.keys(ex);
          const cols = keys.join(', ');
          const placeholders = keys.map(() => '?').join(', ');
          await db.runAsync(`INSERT INTO exercises (${cols}) VALUES (${placeholders})`, keys.map((k) => ex[k]));
        }
      }

      // Workouts
      if (payload.tables.workouts && payload.tables.workouts.length > 0) {
        for (const w of payload.tables.workouts) {
          const keys = Object.keys(w);
          const cols = keys.join(', ');
          const placeholders = keys.map(() => '?').join(', ');
          await db.runAsync(`INSERT INTO workouts (${cols}) VALUES (${placeholders})`, keys.map((k) => w[k]));
        }
      }

      // Workout exercises
      if (payload.tables.workout_exercises && payload.tables.workout_exercises.length > 0) {
        for (const we of payload.tables.workout_exercises) {
          const keys = Object.keys(we);
          const cols = keys.join(', ');
          const placeholders = keys.map(() => '?').join(', ');
          await db.runAsync(`INSERT INTO workout_exercises (${cols}) VALUES (${placeholders})`, keys.map((k) => we[k]));
        }
      }

      // Sets
      if (payload.tables.sets && payload.tables.sets.length > 0) {
        for (const s of payload.tables.sets) {
          const keys = Object.keys(s);
          const cols = keys.join(', ');
          const placeholders = keys.map(() => '?').join(', ');
          await db.runAsync(`INSERT INTO sets (${cols}) VALUES (${placeholders})`, keys.map((k) => s[k]));
        }
      }

      // Personal records
      if (payload.tables.personal_records && payload.tables.personal_records.length > 0) {
        for (const pr of payload.tables.personal_records) {
          const keys = Object.keys(pr);
          const cols = keys.join(', ');
          const placeholders = keys.map(() => '?').join(', ');
          await db.runAsync(`INSERT INTO personal_records (${cols}) VALUES (${placeholders})`, keys.map((k) => pr[k]));
        }
      }

      await db.execAsync('COMMIT');
    } catch (e) {
      await db.execAsync('ROLLBACK');
      throw e;
    }
  }
}

export const importService = new ImportService();
