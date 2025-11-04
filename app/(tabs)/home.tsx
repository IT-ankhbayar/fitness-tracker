// Home tab screen

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/constants';
import { getGreeting, formatDate, formatRelativeTime, formatWeight, formatVolume, formatWorkoutSummary } from '../../utils/formatters';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../../store/workoutStore';
import { useHistoryStore } from '../../store/historyStore';
import { workoutService } from '../../services/workoutService';
import { useProgressStore } from '../../store/progressStore';
import { useSettingsStore } from '../../store/settingsStore';

export default function HomeScreen() {
  const router = useRouter();

  // Progress metrics for streak widget
  const { loading: progressLoading, streak, weeklyTarget, weeklyCount, consistencyPct, recentPRs, load } =
    useProgressStore();
  const { unitPreference } = useSettingsStore();
  const historyItems = useHistoryStore((s) => s.items);
  const loadHistoryInitial = useHistoryStore((s) => s.loadInitial);

  useEffect(() => {
    // Load progress data on mount
    load().catch(() => { });
  }, [load]);

  useEffect(() => {
    // Load initial history for mini list
    loadHistoryInitial().catch(() => { });
  }, [loadHistoryInitial]);

  const handleStartWorkout = async () => {
    // Start a fresh workout and go to the logger
    await useWorkoutStore.getState().startWorkout();
    router.push('/workout/logger');
  };

  const handleRepeatLastWorkout = async () => {
    // Try to find the most recent completed workout; fall back to starting a fresh one
    const recent = await workoutService.getAll(10);
    const lastCompleted = recent.find((w) => w.status === 'completed');

    if (lastCompleted) {
      await useHistoryStore.getState().repeatWorkout(lastCompleted.id);
      router.push('/workout/logger');
    } else {
      await useWorkoutStore.getState().startWorkout();
      router.push('/workout/logger');
    }
  };

  const handlePlanWorkout = () => {
    router.push('/workout');
  };

  const renderPRValue = (type: string, value: number, reps?: number) => {
    switch (type) {
      case 'TopSet':
        return reps ? `${formatWeight(value, unitPreference)} × ${reps}` : formatWeight(value, unitPreference);
      case 'Volume':
        return formatVolume(value, unitPreference);
      case '1RM':
      case '3RM':
      case '5RM':
      case '10RM':
      default:
        return formatWeight(value, unitPreference);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Greeting Header */}
          <Text className="text-3xl font-bold text-white mb-1">{getGreeting()}</Text>
          <Text className="text-gray-400 text-base mb-8">{formatDate(new Date(), 'long')}</Text>

          {/* Quick Start Section */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Quick Start</Text>

            {/* Start Workout */}
            <TouchableOpacity
              onPress={handleStartWorkout}
              className="rounded-2xl p-6 mb-4"
              style={{ backgroundColor: COLORS.accent.primary }}
              activeOpacity={0.85}
            >
              <Text className="text-white text-xl font-semibold mb-1">Start Workout</Text>
              <Text className="text-white/80">Begin a fresh session</Text>
            </TouchableOpacity>

            {/* Repeat Last Workout */}
            <TouchableOpacity
              onPress={handleRepeatLastWorkout}
              className="rounded-2xl p-6 mb-4 bg-gray-800"
              activeOpacity={0.85}
            >
              <Text className="text-white text-xl font-semibold mb-1">Repeat Last Workout</Text>
              <Text className="text-gray-300">Copy your most recent routine</Text>
            </TouchableOpacity>

            {/* Plan Workout */}
            <TouchableOpacity
              onPress={handlePlanWorkout}
              className="rounded-2xl p-6 mb-2 bg-gray-800"
              activeOpacity={0.85}
            >
              <Text className="text-white text-xl font-semibold mb-1">Plan Workout</Text>
              <Text className="text-gray-300">Set up exercises before you start</Text>
            </TouchableOpacity>
          </View>

          {/* Streak Widget - Placeholder */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Your Progress</Text>
            <View className="bg-gray-800 rounded-2xl p-6">
              <View className="flex-row items-end justify-between mb-3">
                <View>
                  <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>
                    {streak || 0}
                  </Text>
                  <Text className="text-gray-400 text-base">Day Streak</Text>
                </View>
                <View className="items-end">
                  {weeklyTarget > 0 ? (
                    <Text className="text-gray-300">
                      {weeklyCount}/{weeklyTarget} this week
                    </Text>
                  ) : (
                    <Text className="text-gray-500">No weekly target set</Text>
                  )}
                </View>
              </View>

              {/* Progress bar toward weekly target */}
              <View className="h-2 w-full rounded-full bg-gray-700 overflow-hidden">
                <View
                  className="h-2 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, consistencyPct || 0))}%`, backgroundColor: COLORS.accent.primary }}
                />
              </View>
            </View>
          </View>

          {/* Recent PRs - Horizontal strip */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Recent PRs</Text>
            {recentPRs && recentPRs.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                {recentPRs.map((pr) => (
                  <TouchableOpacity
                    key={pr.id}
                    activeOpacity={0.9}
                    onPress={() =>
                      pr.workout_id &&
                      router.push({ pathname: '/(tabs)/history/[id]', params: { id: String(pr.workout_id) } })
                    }
                    className="mr-4"
                  >
                    <View className="bg-gray-800 rounded-2xl p-4" style={{ width: 220 }}>
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white font-semibold" numberOfLines={1}>
                          {pr.exerciseName || 'Exercise'}
                        </Text>
                        <View className="px-2 py-1 rounded-full bg-gray-700">
                          <Text className="text-xs text-gray-200">{pr.type}</Text>
                        </View>
                      </View>
                      <Text className="text-2xl font-bold text-white mb-1">
                        {renderPRValue(pr.type, pr.value, pr.reps)}
                      </Text>
                      <Text className="text-gray-400 text-xs">{formatRelativeTime(pr.achieved_at)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="bg-gray-800 rounded-2xl p-6">
                <Text className="text-gray-400 text-center">No personal records yet</Text>
                <Text className="text-gray-500 text-sm text-center mt-2">
                  Complete your first workout to start tracking PRs
                </Text>
              </View>
            )}
          </View>

          {/* Mini History - last 3 workouts */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Recent Workouts</Text>
            {historyItems && historyItems.length > 0 ? (
              historyItems.slice(0, 3).map((w) => (
                <TouchableOpacity
                  key={w.id}
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: '/(tabs)/history/[id]', params: { id: String(w.id) } })}
                  className="bg-gray-800 rounded-2xl p-4 mb-3"
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-white font-semibold">{formatDate(w.started_at, 'medium')}</Text>
                    <Text className="text-gray-400 text-xs">{formatRelativeTime(w.started_at)}</Text>
                  </View>
                  <Text className="text-gray-300" numberOfLines={1}>
                    {formatWorkoutSummary(w.exercise_count || 0, w.total_sets || 0, w.total_volume || 0, unitPreference)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-gray-800 rounded-2xl p-6">
                <Text className="text-gray-400 text-center">No workouts yet</Text>
                <Text className="text-gray-500 text-sm text-center mt-2">
                  Start your first workout to see it here
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
