// Exercise Picker Screen - Browse and select exercises

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../../../utils/constants';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useWorkoutStore } from '../../../store/workoutStore';
import { Exercise } from '../../../types/database';
import { usePlannerStore } from '../../../store/plannerStore';
import { SearchBar } from '../../../components/inputs/SearchBar';
import { FilterChip } from '../../../components/inputs/FilterChip';
import { SegmentedControl } from '../../../components/inputs/SegmentedControl';
import { ExerciseRow } from '../../../components/lists/ExerciseRow';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ExerciseInfoSheet } from '../../../components/sheets/ExerciseInfoSheet';
import { MuscleGroup, Equipment } from '../../../types/exercise';

export default function ExercisePickerScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const {
    filteredExercises,
    searchQuery,
    selectedMuscles,
    selectedEquipment,
    showFavoritesOnly,
    showRecentOnly,
    searchExercises,
    filterByMuscle,
    filterByEquipment,
    toggleFavorite,
    setShowFavoritesOnly,
    setShowRecentOnly,
    clearFilters,
  } = useExerciseStore();

  // Local state
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [viewMode, setViewMode] = useState<number>(0);
  const [showMuscleFilters, setShowMuscleFilters] = useState(false);
  const [showEquipmentFilters, setShowEquipmentFilters] = useState(false);
  const [infoSheetExercise, setInfoSheetExercise] = useState<Exercise | null>(null);

  const viewModes = ['All', 'Favorites', 'Recent'];

  // Handle view mode changes
  useEffect(() => {
    const mode = viewModes[viewMode].toLowerCase();
    setShowFavoritesOnly(mode === 'favorites');
    setShowRecentOnly(mode === 'recent');
  }, [viewMode]);

  // Toggle exercise selection
  const toggleExerciseSelection = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const isSelected = prev.some((e) => e.id === exercise.id);
      if (isSelected) {
        return prev.filter((e) => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  // Check if exercise is selected
  const isExerciseSelected = (exercise: Exercise) => {
    return selectedExercises.some((e) => e.id === exercise.id);
  };

  // Handle muscle filter toggle
  const toggleMuscleFilter = (muscle: MuscleGroup) => {
    const newSelection = selectedMuscles.includes(muscle)
      ? selectedMuscles.filter((m) => m !== muscle)
      : [...selectedMuscles, muscle];
    filterByMuscle(newSelection);
  };

  // Handle equipment filter toggle
  const toggleEquipmentFilter = (equipment: Equipment) => {
    const newSelection = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter((e) => e !== equipment)
      : [...selectedEquipment, equipment];
    filterByEquipment(newSelection);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (exerciseId: number) => {
    await toggleFavorite(exerciseId);
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    clearFilters();
    setShowMuscleFilters(false);
    setShowEquipmentFilters(false);
  };

  // Handle add exercises
  const handleAddExercises = async () => {
    const exerciseIds = selectedExercises.map((ex) => ex.id);
    if (mode === 'plan') {
      try {
        await usePlannerStore.getState().addExercises(exerciseIds);
        router.back();
      } catch (error) {
        console.error('Failed to add exercises to plan:', error);
      }
      return;
    }

    const { addExercisesToWorkout, activeWorkout } = useWorkoutStore.getState();
    if (!activeWorkout) {
      console.error('No active workout');
      return;
    }
    try {
      await addExercisesToWorkout(exerciseIds);
      router.push('/workout/logger' as any);
    } catch (error) {
      console.error('Failed to add exercises:', error);
    }
  };

  const hasActiveFilters = selectedMuscles.length > 0 || selectedEquipment.length > 0 || searchQuery.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }} edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              Exercise Picker
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {filteredExercises.length} exercises
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close exercise picker"
          >
            <Ionicons name="close" size={28} color={COLORS.text.primary} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-4">
          <SearchBar
            value={searchQuery}
            onChangeText={searchExercises}
            placeholder="Search exercises..."
            autoFocus
          />
        </View>

        {/* View Mode Tabs */}
        <View className="px-6 mb-4">
          <SegmentedControl
            options={viewModes}
            selectedIndex={viewMode}
            onSelect={(index) => setViewMode(index)}
          />
        </View>

        {/* Filter Buttons */}
        <View className="px-6 mb-4">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => setShowMuscleFilters(!showMuscleFilters)}
              className="flex-row items-center px-4 py-2 rounded-full mr-2"
              style={{
                backgroundColor: selectedMuscles.length > 0
                  ? COLORS.accent.primary
                  : COLORS.background.secondary,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Toggle muscle filters ${selectedMuscles.length > 0 ? `(${selectedMuscles.length} selected)` : ''}`}
            >
              <Ionicons
                name="fitness"
                size={16}
                color={selectedMuscles.length > 0 ? COLORS.background.primary : COLORS.text.primary}
              />
              <Text
                className="ml-2 font-medium"
                style={{
                  color: selectedMuscles.length > 0 ? COLORS.background.primary : COLORS.text.primary,
                }}
              >
                Muscle {selectedMuscles.length > 0 && `(${selectedMuscles.length})`}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowEquipmentFilters(!showEquipmentFilters)}
              className="flex-row items-center px-4 py-2 rounded-full mr-2"
              style={{
                backgroundColor: selectedEquipment.length > 0
                  ? COLORS.accent.primary
                  : COLORS.background.secondary,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Toggle equipment filters ${selectedEquipment.length > 0 ? `(${selectedEquipment.length} selected)` : ''}`}
            >
              <Ionicons
                name="barbell"
                size={16}
                color={selectedEquipment.length > 0 ? COLORS.background.primary : COLORS.text.primary}
              />
              <Text
                className="ml-2 font-medium"
                style={{
                  color: selectedEquipment.length > 0 ? COLORS.background.primary : COLORS.text.primary,
                }}
              >
                Equipment {selectedEquipment.length > 0 && `(${selectedEquipment.length})`}
              </Text>
            </Pressable>

            {hasActiveFilters && (
              <Pressable
                onPress={handleClearFilters}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
              >
                <Text style={{ color: COLORS.accent.secondary }} className="font-medium">
                  Clear
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Muscle Filter Chips */}
        {showMuscleFilters && (
          <View className="px-6 mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row flex-wrap">
                {MUSCLE_GROUPS.map((muscle) => (
                  <FilterChip
                    key={muscle}
                    label={muscle}
                    selected={selectedMuscles.includes(muscle as MuscleGroup)}
                    onPress={() => toggleMuscleFilter(muscle as MuscleGroup)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Equipment Filter Chips */}
        {showEquipmentFilters && (
          <View className="px-6 mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row flex-wrap">
                {EQUIPMENT_TYPES.map((equipment) => (
                  <FilterChip
                    key={equipment}
                    label={equipment}
                    selected={selectedEquipment.includes(equipment as Equipment)}
                    onPress={() => toggleEquipmentFilter(equipment as Equipment)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Exercise List */}
        {filteredExercises.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No exercises found"
            message="Try adjusting your filters or search query"
            action={
              hasActiveFilters ? (
                <Pressable onPress={handleClearFilters}>
                  <Text style={{ color: COLORS.accent.primary }} className="font-semibold">
                    Clear Filters
                  </Text>
                </Pressable>
              ) : undefined
            }
          />
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ExerciseRow
                exercise={item}
                isSelected={isExerciseSelected(item)}
                showAddButton
                showFavoriteButton
                onAddPress={() => toggleExerciseSelection(item)}
                onFavoritePress={() => handleFavoriteToggle(item.id)}
                onInfoPress={() => setInfoSheetExercise(item)}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={12}
            removeClippedSubviews
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Selected Tray - Sticky Bottom */}
        {selectedExercises.length > 0 && (
          <View
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{ backgroundColor: COLORS.background.primary }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-base font-medium">
                {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
              </Text>
              <Pressable
                onPress={() => setSelectedExercises([])}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Clear selected exercises"
              >
                <Text style={{ color: COLORS.accent.secondary }} className="font-medium">
                  Clear
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={handleAddExercises}
              className="py-4 rounded-full items-center"
              style={{ backgroundColor: COLORS.accent.primary }}
              accessibilityRole="button"
              accessibilityLabel={mode === 'plan' ? 'Add selected exercises to plan' : 'Add selected exercises to workout'}
            >
              <Text className="text-black text-lg font-bold">
                {mode === 'plan' ? 'Add to Plan' : 'Add to Workout'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Exercise Info Sheet */}
        <ExerciseInfoSheet
          exercise={infoSheetExercise}
          visible={infoSheetExercise !== null}
          onClose={() => setInfoSheetExercise(null)}
        />
      </View>
    </SafeAreaView>
  );
}
