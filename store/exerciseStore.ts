// Exercise store - Manages exercise catalog, search, and filters

import { create } from 'zustand';
import { Exercise, ExerciseFilters } from '../types/database';
import { exerciseService } from '../services/exerciseService';
import { MuscleGroup, Equipment } from '../types/exercise';

interface ExerciseState {
  // State
  exercises: Exercise[];
  filteredExercises: Exercise[];
  favorites: Exercise[];
  recentlyUsed: Exercise[];
  isLoading: boolean;

  // Filters
  searchQuery: string;
  selectedMuscles: MuscleGroup[];
  selectedEquipment: Equipment[];
  showFavoritesOnly: boolean;
  showRecentOnly: boolean;

  // Actions
  loadExercises: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  loadRecentlyUsed: () => Promise<void>;
  searchExercises: (query: string) => void;
  filterByMuscle: (muscles: MuscleGroup[]) => void;
  filterByEquipment: (equipment: Equipment[]) => void;
  toggleFavorite: (exerciseId: number) => Promise<void>;
  updateLastUsed: (exerciseId: number) => Promise<void>;
  applyFilters: () => Promise<void>;
  clearFilters: () => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setShowRecentOnly: (show: boolean) => void;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  exercises: [],
  filteredExercises: [],
  favorites: [],
  recentlyUsed: [],
  isLoading: false,

  // Initial filters
  searchQuery: '',
  selectedMuscles: [],
  selectedEquipment: [],
  showFavoritesOnly: false,
  showRecentOnly: false,

  /**
   * Load all exercises from database
   */
  loadExercises: async () => {
    try {
      set({ isLoading: true });

      const exercises = await exerciseService.getAll();

      set({
        exercises,
        filteredExercises: exercises,
        isLoading: false,
      });

      console.log(`Loaded ${exercises.length} exercises`);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Load favorite exercises
   */
  loadFavorites: async () => {
    try {
      const favorites = await exerciseService.getFavorites();
      set({ favorites });
    } catch (error) {
      console.error('Failed to load favorites:', error);
      throw error;
    }
  },

  /**
   * Load recently used exercises
   */
  loadRecentlyUsed: async () => {
    try {
      const recentlyUsed = await exerciseService.getRecentlyUsed(10);
      set({ recentlyUsed });
    } catch (error) {
      console.error('Failed to load recently used:', error);
      throw error;
    }
  },

  /**
   * Search exercises by query
   */
  searchExercises: (query: string) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  /**
   * Filter by muscle groups
   */
  filterByMuscle: (muscles: MuscleGroup[]) => {
    set({ selectedMuscles: muscles });
    get().applyFilters();
  },

  /**
   * Filter by equipment
   */
  filterByEquipment: (equipment: Equipment[]) => {
    set({ selectedEquipment: equipment });
    get().applyFilters();
  },

  /**
   * Toggle exercise favorite status
   */
  toggleFavorite: async (exerciseId: number) => {
    try {
      await exerciseService.toggleFavorite(exerciseId);

      // Update local state
      set((state) => ({
        exercises: state.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, is_favorite: ex.is_favorite === 1 ? 0 : 1 } : ex
        ),
      }));

      // Reload favorites and apply filters
      await get().loadFavorites();
      await get().applyFilters();

      console.log('Toggled favorite for exercise:', exerciseId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  },

  /**
   * Update last used timestamp for an exercise
   */
  updateLastUsed: async (exerciseId: number) => {
    try {
      await exerciseService.updateLastUsed(exerciseId);

      const now = Date.now();

      // Update local state
      set((state) => ({
        exercises: state.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, last_used_at: now } : ex
        ),
      }));

      // Reload recently used
      await get().loadRecentlyUsed();

      console.log('Updated last used for exercise:', exerciseId);
    } catch (error) {
      console.error('Failed to update last used:', error);
      throw error;
    }
  },

  /**
   * Apply all current filters
   */
  applyFilters: async () => {
    try {
      const state = get();

      // Build filters object
      const filters: ExerciseFilters = {
        searchQuery: state.searchQuery,
        muscles: state.selectedMuscles.length > 0 ? state.selectedMuscles : undefined,
        equipment: state.selectedEquipment.length > 0 ? state.selectedEquipment : undefined,
        favorites: state.showFavoritesOnly ? true : undefined,
        recent: state.showRecentOnly ? true : undefined,
      };

      // Apply filters via service
      const filtered = await exerciseService.filter(filters);

      set({ filteredExercises: filtered });

      console.log(`Filtered to ${filtered.length} exercises`);
    } catch (error) {
      console.error('Failed to apply filters:', error);
      throw error;
    }
  },

  /**
   * Clear all filters
   */
  clearFilters: () => {
    set({
      searchQuery: '',
      selectedMuscles: [],
      selectedEquipment: [],
      showFavoritesOnly: false,
      showRecentOnly: false,
      filteredExercises: get().exercises,
    });

    console.log('Filters cleared');
  },

  /**
   * Show favorites only
   */
  setShowFavoritesOnly: (show: boolean) => {
    set({
      showFavoritesOnly: show,
      showRecentOnly: false, // Clear recent filter
    });
    get().applyFilters();
  },

  /**
   * Show recently used only
   */
  setShowRecentOnly: (show: boolean) => {
    set({
      showRecentOnly: show,
      showFavoritesOnly: false, // Clear favorites filter
    });
    get().applyFilters();
  },
}));
