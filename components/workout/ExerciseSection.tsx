// ExerciseSection component - Exercise with sets in workout logger

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutExerciseWithDetails } from '../../types/workout';
import { Set } from '../../types/database';
import { SetRow } from './SetRow';
import { COLORS } from '../../utils/constants';

interface ExerciseSectionProps {
  workoutExercise: WorkoutExerciseWithDetails;
  onUpdateSet: (setId: number, data: Partial<Set>) => void;
  onToggleSetComplete: (setId: number) => void;
  onDeleteSet: (setId: number) => void;
  onAddSet: () => void;
  onDuplicateLastSet: () => void;
  onRemoveExercise: () => void;
  onShowInfo: () => void;
}

export function ExerciseSection({
  workoutExercise,
  onUpdateSet,
  onToggleSetComplete,
  onDeleteSet,
  onAddSet,
  onDuplicateLastSet,
  onRemoveExercise,
  onShowInfo,
}: ExerciseSectionProps) {
  const { exercise, sets } = workoutExercise;

  const completedSets = sets.filter((s: Set) => s.is_completed === 1).length;

  return (
    <View
      className="rounded-2xl p-4 mb-4"
      style={{ backgroundColor: COLORS.background.secondary }}
    >
      {/* Exercise Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-white text-lg font-semibold mb-1">
            {exercise.name}
          </Text>
          <Text className="text-gray-400 text-sm">
            {exercise.primary_muscle} • {exercise.equipment}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Pressable onPress={onShowInfo} hitSlop={8} className="mr-3">
            <Ionicons name="information-circle-outline" size={24} color={COLORS.text.secondary} />
          </Pressable>
          <Pressable onPress={onRemoveExercise} hitSlop={8}>
            <Ionicons name="trash-outline" size={24} color={COLORS.text.secondary} />
          </Pressable>
        </View>
      </View>

      {/* Set Progress */}
      {sets.length > 0 && (
        <View className="flex-row items-center mb-3">
          <View className="flex-1 h-1 rounded-full mr-3" style={{ backgroundColor: COLORS.border }}>
            <View
              className="h-1 rounded-full"
              style={{
                backgroundColor: COLORS.accent.primary,
                width: `${(completedSets / sets.length) * 100}%`,
              }}
            />
          </View>
          <Text className="text-gray-400 text-sm">
            {completedSets}/{sets.length}
          </Text>
        </View>
      )}

      {/* Set Table Header */}
      {sets.length > 0 && (
        <View className="flex-row items-center py-2 border-b" style={{ borderBottomColor: COLORS.border }}>
          <View className="w-12">
            <Text className="text-center text-xs font-medium" style={{ color: COLORS.text.tertiary }}>
              SET
            </Text>
          </View>
          <View className="flex-1 mx-2">
            <Text className="text-center text-xs font-medium" style={{ color: COLORS.text.tertiary }}>
              REPS
            </Text>
          </View>
          <View className="flex-1 mx-2">
            <Text className="text-center text-xs font-medium" style={{ color: COLORS.text.tertiary }}>
              WEIGHT
            </Text>
          </View>
          <View className="w-10 mx-2" />
          <View className="w-6" />
        </View>
      )}

      {/* Set Rows */}
      {sets.map((set: Set, index: number) => (
        <SetRow
          key={set.id}
          set={set}
          setNumber={index + 1}
          onUpdate={(data) => onUpdateSet(set.id, data)}
          onToggleComplete={() => onToggleSetComplete(set.id)}
          onDelete={() => onDeleteSet(set.id)}
        />
      ))}

      {/* Empty State */}
      {sets.length === 0 && (
        <View className="py-8 items-center">
          <Text className="text-gray-400 text-sm mb-4">No sets yet</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row mt-4">
        <Pressable
          onPress={onAddSet}
          className="flex-1 flex-row items-center justify-center py-3 rounded-xl mr-2"
          style={{ backgroundColor: COLORS.background.tertiary }}
        >
          <Ionicons name="add" size={20} color={COLORS.accent.primary} />
          <Text className="ml-2 font-semibold" style={{ color: COLORS.accent.primary }}>
            Add Set
          </Text>
        </Pressable>

        {sets.length > 0 && (
          <Pressable
            onPress={onDuplicateLastSet}
            className="flex-1 flex-row items-center justify-center py-3 rounded-xl ml-2"
            style={{ backgroundColor: COLORS.background.tertiary }}
          >
            <Ionicons name="copy-outline" size={20} color={COLORS.text.secondary} />
            <Text className="ml-2 font-semibold" style={{ color: COLORS.text.secondary }}>
              Copy Last
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
