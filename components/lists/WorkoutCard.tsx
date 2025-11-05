// WorkoutCard - summary card for a completed workout in history

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Workout } from '../../types/database';
import { useSettingsStore } from '../../store/settingsStore';
import { COLORS } from '../../utils/constants';
import { formatDate, formatDuration, formatWeightClean } from '../../utils/formatters';

interface WorkoutCardProps {
    workout: Workout;
    exerciseCount: number;
    onPress?: () => void;
}

function WorkoutCardInner({ workout, exerciseCount, onPress }: WorkoutCardProps) {
    const unit = useSettingsStore((s) => s.unitPreference);

    const minutes = workout.duration ? Math.floor(workout.duration / 60) : 0;

    return (
        <Pressable
            onPress={onPress}
            className="p-4 rounded-2xl mb-3 flex-row items-center"
            style={{ backgroundColor: COLORS.background.secondary }}
            accessibilityRole="button"
            accessibilityLabel={`Open workout from ${formatDate(workout.started_at, 'medium')}`}
        >
            <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                    {formatDate(workout.started_at, 'medium')}
                </Text>
                <Text className="text-gray-400 mt-1">
                    {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'} • {workout.total_sets} {workout.total_sets === 1 ? 'set' : 'sets'} • {formatWeightClean(workout.total_volume, unit)}
                </Text>
            </View>
            <View className="items-end">
                <Text className="text-white font-semibold">{formatDuration(minutes)}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
            </View>
        </Pressable>
    );
}

export const WorkoutCard = React.memo(WorkoutCardInner);
