// History list screen with date grouping and infinite scroll

import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, ListRenderItemInfo, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useHistoryStore } from '../../../store/historyStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Workout } from '../../../types/database';
import { WorkoutCard } from '../../../components/lists/WorkoutCard';
import { COLORS } from '../../../utils/constants';
import { formatDate } from '../../../utils/formatters';
import { EmptyState } from '../../../components/feedback/EmptyState';

interface WorkoutListItemExt extends Workout {
    exercise_count: number;
}

export default function HistoryListScreen() {
    const { items, isLoading, hasMore, loadInitial, loadMore } = useHistoryStore();
    const unit = useSettingsStore((s) => s.unitPreference);

    useEffect(() => {
        loadInitial();
    }, []);

    const data = items;

    const renderItem = ({ item, index }: ListRenderItemInfo<WorkoutListItemExt>) => {
        const currentDay = new Date(item.started_at).toDateString();
        const prevDay = index > 0 ? new Date(data[index - 1].started_at).toDateString() : null;
        const showHeader = index === 0 || currentDay !== prevDay;

        return (
            <View>
                {showHeader && (
                    <Text className="text-gray-400 text-sm mb-2 mt-4">
                        {formatDate(item.started_at, 'long')}
                    </Text>
                )}
                <WorkoutCard
                    workout={item}
                    exerciseCount={item.exercise_count}
                    onPress={() => router.push(`/history/${item.id}` as any)}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4">
                    <Text className="text-3xl font-bold text-white">History</Text>
                    <Text className="text-gray-400 text-base mt-1">Your workout log</Text>
                </View>

                {/* Content */}
                {data.length === 0 && !isLoading ? (
                    <EmptyState
                        icon="calendar-outline"
                        title="No Workouts Yet"
                        message="Complete your first workout to start tracking your progress"
                    />
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                            if (!isLoading && hasMore) loadMore();
                        }}
                        ListFooterComponent={
                            isLoading ? (
                                <View className="py-4">
                                    <ActivityIndicator color={COLORS.accent.primary} />
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
