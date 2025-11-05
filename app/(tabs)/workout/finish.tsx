// Workout Finish Summary Screen

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { COLORS } from '../../../utils/constants';
import { formatDuration, formatWeightClean, formatDate } from '../../../utils/formatters';
import { calculateTotalVolume } from '../../../utils/calculations';
import { Set, PersonalRecord } from '../../../types/database';
import { prService } from '../../../services/prService';

export default function FinishSummaryScreen() {
  const { activeWorkout, workoutExercises, clearWorkout } = useWorkoutStore();
  const unitPreference = useSettingsStore((state) => state.unitPreference);
  const [newPRs, setNewPRs] = useState<PersonalRecord[]>([]);
  const [notes, setNotes] = useState<string>('');

  // Load PRs for this workout
  useEffect(() => {
    if (activeWorkout) {
      prService.getForWorkout(activeWorkout.id).then(setNewPRs);
    }
  }, [activeWorkout]);

  // Initialize notes from workout
  useEffect(() => {
    if (activeWorkout?.notes) {
      setNotes(activeWorkout.notes);
    } else {
      setNotes('');
    }
  }, [activeWorkout?.notes]);

  if (!activeWorkout) {
    router.back();
    return null;
  }

  const handleDone = () => {
    clearWorkout();
    // Route groups like (tabs) are invisible in URLs; navigate to the tab path directly
    router.push('/history' as any);
  };

  const completedSets = workoutExercises.reduce((total, we) => {
    return total + we.sets.filter((s: Set) => s.is_completed === 1).length;
  }, 0);

  const totalReps = workoutExercises.reduce((total, we) => {
    return total + we.sets
      .filter((s: Set) => s.is_completed === 1)
      .reduce((sum: number, s: Set) => sum + s.reps, 0);
  }, 0);

  const totalVolume = workoutExercises.reduce((total, we) => {
    return total + calculateTotalVolume(we.sets);
  }, 0);

  const duration = activeWorkout.duration
    ? Math.floor(activeWorkout.duration / 60)
    : 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.background.primary }}
      edges={['top']}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 items-center border-b" style={{ borderBottomColor: COLORS.border }}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.accent.secondary} />
          <Text className="text-3xl font-bold text-white mt-4">Workout Complete!</Text>
          <Text className="text-gray-400 text-base mt-2">
            {formatDate(activeWorkout.started_at)}
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Stats Grid */}
          <View className="flex-row mb-6">
            <View className="flex-1 items-center p-4 rounded-2xl mr-2" style={{ backgroundColor: COLORS.background.secondary }}>
              <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>
                {duration}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Minutes</Text>
            </View>

            <View className="flex-1 items-center p-4 rounded-2xl ml-2" style={{ backgroundColor: COLORS.background.secondary }}>
              <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>
                {workoutExercises.length}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                {workoutExercises.length === 1 ? 'Exercise' : 'Exercises'}
              </Text>
            </View>
          </View>

          <View className="flex-row mb-6">
            <View className="flex-1 items-center p-4 rounded-2xl mr-2" style={{ backgroundColor: COLORS.background.secondary }}>
              <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>
                {completedSets}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Sets</Text>
            </View>

            <View className="flex-1 items-center p-4 rounded-2xl ml-2" style={{ backgroundColor: COLORS.background.secondary }}>
              <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>
                {totalReps}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Reps</Text>
            </View>
          </View>

          {/* Total Volume */}
          <View className="items-center p-6 rounded-2xl mb-6" style={{ backgroundColor: COLORS.background.secondary }}>
            <Text className="text-5xl font-bold" style={{ color: COLORS.accent.secondary }}>
              {formatWeightClean(totalVolume, unitPreference)}
            </Text>
            <Text className="text-gray-400 text-base mt-2">Total Volume</Text>
          </View>

          {/* Exercise Summary */}
          <Text className="text-xl font-semibold text-white mb-4">Exercises</Text>
          {workoutExercises.map((we) => {
            const exerciseSets = we.sets.filter((s: Set) => s.is_completed === 1);
            const exerciseVolume = calculateTotalVolume(exerciseSets);

            return (
              <View
                key={we.id}
                className="p-4 rounded-2xl mb-3"
                style={{ backgroundColor: COLORS.background.secondary }}
              >
                <Text className="text-white text-lg font-semibold mb-1">
                  {we.exercise.name}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {exerciseSets.length} sets • {formatWeightClean(exerciseVolume, unitPreference)} volume
                </Text>
              </View>
            );
          })}

          {/* New PRs */}
          <Text className="text-xl font-semibold text-white mb-4 mt-4">Personal Records</Text>
          {newPRs.length > 0 ? (
            newPRs.map((pr) => (
              <View
                key={pr.id}
                className="p-4 rounded-2xl mb-3 flex-row items-center justify-between"
                style={{ backgroundColor: COLORS.background.secondary }}
              >
                <View className="flex-1">
                  <Text className="text-white font-semibold">{pr.type}</Text>
                  <Text className="text-gray-400 text-sm">
                    {formatWeightClean(pr.value, unitPreference)}
                    {pr.reps ? ` × ${pr.reps}` : ''}
                  </Text>
                </View>
                <Ionicons name="star" size={20} color={COLORS.accent.primary} />
              </View>
            ))
          ) : (
            <View
              className="p-4 rounded-2xl mb-6"
              style={{ backgroundColor: COLORS.background.secondary }}
            >
              <Text className="text-gray-400 text-center">
                No new PRs this session
              </Text>
            </View>
          )}

          {/* Notes Input */}
          <Text className="text-xl font-semibold text-white mb-3 mt-2">Notes</Text>
          <View className="p-4 rounded-2xl mb-6" style={{ backgroundColor: COLORS.background.secondary }}>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              onBlur={async () => {
                await useWorkoutStore.getState().updateWorkoutNotes(notes);
              }}
              placeholder="Add notes about this workout..."
              placeholderTextColor={COLORS.text.tertiary}
              multiline
              style={{ color: COLORS.text.primary, minHeight: 120, textAlignVertical: 'top' }}
            />
          </View>
        </ScrollView>

        {/* Done Button */}
        <View className="px-6 py-4">
          <Pressable
            onPress={handleDone}
            className="py-4 rounded-full items-center"
            style={{ backgroundColor: COLORS.accent.primary }}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text className="text-black text-lg font-bold">Done</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
