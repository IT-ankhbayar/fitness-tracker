// Settings store - Manages app settings and preferences

import { create } from 'zustand';
import { databaseService } from '../services/database';
import { UnitPreference, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface SettingsState extends UserSettings {
  // State
  isLoaded: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateUnitPreference: (unit: UnitPreference) => Promise<void>;
  updateWeeklyTarget: (days: number) => Promise<void>;
  updateRestTimerDefault: (seconds: number) => Promise<void>;
  updateAutoStartRestTimer: (enabled: boolean) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  unitPreference: DEFAULT_SETTINGS.unitPreference,
  weeklyTargetDays: DEFAULT_SETTINGS.weeklyTargetDays,
  restTimerDefault: DEFAULT_SETTINGS.restTimerDefault,
  autoStartRestTimer: DEFAULT_SETTINGS.autoStartRestTimer,
  onboardingCompleted: DEFAULT_SETTINGS.onboardingCompleted,
  isLoaded: false,

  /**
   * Load settings from database
   */
  loadSettings: async () => {
    try {
      const db = databaseService.getDatabase();

      // Get all settings
      const settings = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM settings'
      );

      // Convert to object
      const settingsMap: Record<string, string> = {};
      settings.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });

      // Update state
      set({
        unitPreference: (settingsMap.unit_preference || DEFAULT_SETTINGS.unitPreference) as UnitPreference,
        weeklyTargetDays: parseInt(settingsMap.weekly_target_days || String(DEFAULT_SETTINGS.weeklyTargetDays), 10),
        restTimerDefault: parseInt(settingsMap.rest_timer_default || String(DEFAULT_SETTINGS.restTimerDefault), 10),
        autoStartRestTimer: settingsMap.auto_start_rest_timer === 'true',
        onboardingCompleted: settingsMap.onboarding_completed === 'true',
        isLoaded: true,
      });

      console.log('Settings loaded successfully');
    } catch (error) {
      console.error('Failed to load settings:', error);
      throw error;
    }
  },

  /**
   * Update unit preference (kg/lb)
   */
  updateUnitPreference: async (unit: UnitPreference) => {
    try {
      const db = databaseService.getDatabase();
      const now = Date.now();

      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
        ['unit_preference', unit, now]
      );

      set({ unitPreference: unit });
      console.log('Unit preference updated:', unit);
    } catch (error) {
      console.error('Failed to update unit preference:', error);
      throw error;
    }
  },

  /**
   * Update weekly target days
   */
  updateWeeklyTarget: async (days: number) => {
    try {
      const db = databaseService.getDatabase();
      const now = Date.now();

      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
        ['weekly_target_days', String(days), now]
      );

      set({ weeklyTargetDays: days });
      console.log('Weekly target updated:', days);
    } catch (error) {
      console.error('Failed to update weekly target:', error);
      throw error;
    }
  },

  /**
   * Update default rest timer duration
   */
  updateRestTimerDefault: async (seconds: number) => {
    try {
      const db = databaseService.getDatabase();
      const now = Date.now();

      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
        ['rest_timer_default', String(seconds), now]
      );

      set({ restTimerDefault: seconds });
      console.log('Rest timer default updated:', seconds);
    } catch (error) {
      console.error('Failed to update rest timer default:', error);
      throw error;
    }
  },

  /**
   * Update auto-start rest timer setting
   */
  updateAutoStartRestTimer: async (enabled: boolean) => {
    try {
      const db = databaseService.getDatabase();
      const now = Date.now();

      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
        ['auto_start_rest_timer', enabled ? 'true' : 'false', now]
      );

      set({ autoStartRestTimer: enabled });
      console.log('Auto-start rest timer updated:', enabled);
    } catch (error) {
      console.error('Failed to update auto-start rest timer:', error);
      throw error;
    }
  },

  /**
   * Complete onboarding
   */
  completeOnboarding: async () => {
    try {
      const db = databaseService.getDatabase();
      const now = Date.now();

      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
        ['onboarding_completed', 'true', now]
      );

      set({ onboardingCompleted: true });
      console.log('Onboarding completed');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  },

  /**
   * Reset all settings to defaults
   */
  resetSettings: async () => {
    try {
      const db = databaseService.getDatabase();
      const now = Date.now();

      await db.runAsync(
        'DELETE FROM settings WHERE key NOT IN (?, ?)',
        ['schema_version', 'onboarding_completed']
      );

      // Insert defaults
      const defaults = [
        { key: 'unit_preference', value: DEFAULT_SETTINGS.unitPreference },
        { key: 'weekly_target_days', value: String(DEFAULT_SETTINGS.weeklyTargetDays) },
        { key: 'rest_timer_default', value: String(DEFAULT_SETTINGS.restTimerDefault) },
        { key: 'auto_start_rest_timer', value: String(DEFAULT_SETTINGS.autoStartRestTimer) },
      ];

      for (const setting of defaults) {
        await db.runAsync(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
          [setting.key, setting.value, now]
        );
      }

      // Reload settings
      await get().loadSettings();
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  },
}));
