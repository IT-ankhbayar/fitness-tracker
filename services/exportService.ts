// Export Service - Generates a JSON snapshot of app data

import { databaseService } from './database';

type ExportPayload = {
  app: 'PulseLift';
  version: number;
  exported_at: number;
  tables: {
    settings: any[];
    exercises: any[];
    workouts: any[];
    workout_exercises: any[];
    sets: any[];
    personal_records: any[];
  };
};

class ExportService {
  async exportAll(): Promise<ExportPayload> {
    const db = databaseService.getDatabase();

    // Fetch all relevant tables
    const [settings, exercises, workouts, workout_exercises, sets, personal_records] = await Promise.all([
      db.getAllAsync<any>('SELECT * FROM settings'),
      db.getAllAsync<any>('SELECT * FROM exercises'),
      db.getAllAsync<any>('SELECT * FROM workouts'),
      db.getAllAsync<any>('SELECT * FROM workout_exercises'),
      db.getAllAsync<any>('SELECT * FROM sets'),
      db.getAllAsync<any>('SELECT * FROM personal_records'),
    ]);

    const payload: ExportPayload = {
      app: 'PulseLift',
      version: 1,
      exported_at: Date.now(),
      tables: {
        settings,
        exercises,
        workouts,
        workout_exercises,
        sets,
        personal_records,
      },
    };

    return payload;
  }
}

export const exportService = new ExportService();
