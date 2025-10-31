// Database initialization hook

import { useEffect, useState } from 'react';
import { databaseService } from '../services/database';
import { exerciseService } from '../services/exerciseService';
import { useSettingsStore } from '../store/settingsStore';
import { useExerciseStore } from '../store/exerciseStore';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const loadExercises = useExerciseStore((state) => state.loadExercises);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        console.log('Initializing database...');

        // Initialize database
        await databaseService.init();

        // Seed exercises if needed
        await exerciseService.seedExercises();

        // Load settings into store
        await loadSettings();

        // Load exercises into store
        await loadExercises();

        console.log('Database initialization complete');
        setIsReady(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError(err as Error);
      }
    }

    initializeDatabase();
  }, []);

  return { isReady, error };
}
