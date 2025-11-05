// Progress tab screen (data-driven)

import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../utils/constants';
import { useProgressStore } from '../../../store/progressStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { formatPercentage, formatRelativeTime, formatVolume } from '../../../utils/formatters';
import { router } from 'expo-router';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/Button';

export default function ProgressScreen() {
    const {
        loading,
        error,
        weeklyTarget,
        weeklyCount,
        consistencyPct,
        streak,
        weeklyVolumeSeries,
        recentPRs,
        topExercises,
        load,
    } = useProgressStore();

    const unit = useSettingsStore((s) => s.unitPreference);

    useEffect(() => {
        load({ weeks: 8 });
    }, []);

    const maxVolume = useMemo(() => {
        return weeklyVolumeSeries.reduce((m, p) => Math.max(m, p.volume), 0);
    }, [weeklyVolumeSeries]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4">
                    <Text className="text-3xl font-bold text-white">Progress</Text>
                    <Text className="text-gray-400 text-base mt-1">Track your gains</Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={COLORS.accent.primary} />
                    </View>
                ) : error ? (
                    <EmptyState
                        icon="alert-circle-outline"
                        title="Unable to load progress"
                        message="Please check your connection and try again."
                        action={
                            <Button
                                title="Retry"
                                onPress={() => load({ weeks: 8 })}
                                accessibilityRole="button"
                                accessibilityLabel="Retry loading progress"
                            />
                        }
                    />
                ) : (
                    <ScrollView
                        className="flex-1 px-6"
                        contentContainerStyle={{ paddingBottom: 24 }}
                        refreshControl={<RefreshControl refreshing={!!loading} onRefresh={() => load({ weeks: 8 })} tintColor={COLORS.accent.primary} />}>
                        {/* Consistency */}
                        <View className="mb-6">
                            <Text className="text-xl font-semibold text-white mb-4">Weekly Consistency</Text>
                            <View className="rounded-2xl p-6 items-center" style={{ backgroundColor: COLORS.background.secondary }}>
                                <View
                                    className="w-32 h-32 rounded-full items-center justify-center mb-3"
                                    style={{ borderWidth: 8, borderColor: COLORS.border }}
                                >
                                    <Text className="text-4xl font-bold text-white">{formatPercentage(consistencyPct, 0)}</Text>
                                </View>
                                <Text className="text-gray-400 text-base">{weeklyCount} of {weeklyTarget} workouts this week</Text>
                                <Text className="text-gray-500 text-sm mt-1">Streak: {streak} day{streak === 1 ? '' : 's'}</Text>
                            </View>
                        </View>

                        {/* Weekly Volume */}
                        <View className="mb-6">
                            <Text className="text-xl font-semibold text-white mb-4">Weekly Volume</Text>
                            <View className="rounded-2xl p-4" style={{ backgroundColor: COLORS.background.secondary }}>
                                {weeklyVolumeSeries.length === 0 || maxVolume === 0 ? (
                                    <View className="py-8">
                                        <Text className="text-gray-400 text-center">No data yet</Text>
                                        <Text className="text-gray-500 text-sm text-center mt-2">Complete workouts to see your progress</Text>
                                    </View>
                                ) : (
                                    <View>
                                        <View className="flex-row items-end justify-between" style={{ height: 120 }}>
                                            {weeklyVolumeSeries.map((p, idx) => {
                                                const h = Math.max(4, Math.round((p.volume / maxVolume) * 110));
                                                return (
                                                    <View key={p.weekStart || idx} className="items-center" style={{ width: 20 }}>
                                                        <View style={{ height: h, backgroundColor: COLORS.accent.primary, width: 12, borderRadius: 6 }} />
                                                    </View>
                                                );
                                            })}
                                        </View>
                                        <View className="flex-row justify-between mt-3">
                                            {weeklyVolumeSeries.map((p, idx) => (
                                                <Text key={p.weekStart || idx} className="text-xs" style={{ color: COLORS.text.tertiary }}>
                                                    {p.label}
                                                </Text>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Recent PRs */}
                        <View className="mb-6">
                            <Text className="text-xl font-semibold text-white mb-4">Recent PRs</Text>
                            <View className="rounded-2xl" style={{ backgroundColor: COLORS.background.secondary }}>
                                {recentPRs.length === 0 ? (
                                    <View className="p-6">
                                        <Text className="text-gray-400 text-center">No PRs yet</Text>
                                    </View>
                                ) : (
                                    recentPRs.map((pr) => {
                                        const isVolume = pr.type === 'Volume';
                                        const valueStr = isVolume ? formatVolume(pr.value, unit) : `${pr.value.toFixed(1)} ${unit}`;
                                        return (
                                            <Pressable
                                                key={pr.id}
                                                className="px-6 py-4 border-b"
                                                style={{ borderBottomColor: COLORS.border }}
                                                onPress={() => {
                                                    if (pr.workout_id) {
                                                        router.push(`/history/${pr.workout_id}` as any);
                                                    }
                                                }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Open workout with ${pr.exerciseName || `Exercise #${pr.exercise_id}`} ${pr.type} PR`}
                                            >
                                                <View className="flex-row items-center justify-between">
                                                    <View>
                                                        <Text className="text-white font-semibold">{pr.type}</Text>
                                                        <Text className="text-gray-400 text-sm mt-1">{pr.exerciseName || `Exercise #${pr.exercise_id}`}</Text>
                                                    </View>
                                                    <View className="items-end">
                                                        <Text className="text-white font-semibold">{valueStr}</Text>
                                                        <Text className="text-gray-500 text-xs mt-1">{formatRelativeTime(pr.achieved_at)}</Text>
                                                    </View>
                                                </View>
                                            </Pressable>
                                        );
                                    })
                                )}
                            </View>
                        </View>

                        {/* Top Exercises */}
                        <View className="mb-6">
                            <Text className="text-xl font-semibold text-white mb-4">Top Exercises</Text>
                            <View className="rounded-2xl" style={{ backgroundColor: COLORS.background.secondary }}>
                                {topExercises.length === 0 ? (
                                    <View className="p-6">
                                        <Text className="text-gray-400 text-center">No exercises tracked</Text>
                                    </View>
                                ) : (
                                    topExercises.map((item) => (
                                        <Pressable
                                            key={item.exercise.id}
                                            className="px-6 py-4 border-b"
                                            style={{ borderBottomColor: COLORS.border }}
                                            onPress={() => router.push(`/progress/${item.exercise.id}` as any)}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Open progress for ${item.exercise.name}`}
                                        >
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-1 pr-2">
                                                    <Text className="text-white font-semibold" numberOfLines={1}>{item.exercise.name}</Text>
                                                    <Text className="text-gray-400 text-sm mt-1">{item.workoutCount} workouts • {item.setCount} sets</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
                                            </View>
                                        </Pressable>
                                    ))
                                )}
                            </View>
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}
