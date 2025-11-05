// History list screen with date grouping and infinite scroll

import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, ListRenderItemInfo, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useHistoryStore } from '../../../store/historyStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Workout } from '../../../types/database';
import { WorkoutCard } from '../../../components/lists/WorkoutCard';
import { COLORS } from '../../../utils/constants';
import { formatDate } from '../../../utils/formatters';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button } from '../../../components/Button';

interface WorkoutListItemExt extends Workout {
    exercise_count: number;
}

export default function HistoryListScreen() {
    const { items, isLoading, hasMore, loadInitial, loadMore, error } = useHistoryStore();
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
                        icon={error ? 'alert-circle-outline' : 'calendar-outline'}
                        title={error ? 'Something went wrong' : 'No Workouts Yet'}
                        message={error ? 'We couldn\'t load your history. Please try again.' : 'Complete your first workout to start tracking your progress'}
                        action={
                            error ? (
                                <Button
                                    title="Retry"
                                    onPress={loadInitial}
                                    accessibilityRole="button"
                                    accessibilityLabel="Retry loading history"
                                />
                            ) : undefined
                        }
                    />
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={!!isLoading && data.length === 0}
                                onRefresh={loadInitial}
                                tintColor={COLORS.accent.primary}
                            />
                        }
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                            if (!isLoading && hasMore) loadMore();
                        }}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        removeClippedSubviews
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
