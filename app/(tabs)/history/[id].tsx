// Workout detail screen - summary with exercise accordion and actions

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { workoutService } from '../../../services/workoutService';
import { exerciseService } from '../../../services/exerciseService';
import { useHistoryStore } from '../../../store/historyStore';
import { COLORS } from '../../../utils/constants';
import { formatDate, formatDuration, formatWeightClean } from '../../../utils/formatters';
import { Workout, WorkoutExercise, Set } from '../../../types/database';

interface ExerciseDetail {
    id: number; // workout_exercise id
    exercise_id: number;
    name: string;
    sets: Set[];
}

export default function HistoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const workoutId = Number(id);

    const [loading, setLoading] = useState(true);
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    // Units are read via useSettingsUnit() when needed

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const w = await workoutService.getById(workoutId);
                if (!active) return;
                if (!w) {
                    router.back();
                    return;
                }
                setWorkout(w);

                const wes = await workoutService.getWorkoutExercises(workoutId);
                const details: ExerciseDetail[] = [];
                for (const we of wes) {
                    const ex = await exerciseService.getById(we.exercise_id);
                    const sets = await workoutService.getSets(we.id);
                    details.push({ id: we.id, exercise_id: we.exercise_id, name: ex?.name || 'Exercise', sets });
                }
                if (!active) return;
                setExerciseDetails(details);
            } catch (e) {
                console.error('Failed to load workout detail', e);
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, [workoutId]);

    const totals = useMemo(() => {
        if (!exerciseDetails.length) return { completedSets: 0, totalReps: 0, totalVolume: 0 };
        let completedSets = 0;
        let totalReps = 0;
        let totalVolume = 0;
        for (const d of exerciseDetails) {
            for (const s of d.sets) {
                if (s.is_completed === 1) {
                    completedSets += 1;
                    totalReps += s.reps;
                    totalVolume += s.reps * s.weight;
                }
            }
        }
        return { completedSets, totalReps, totalVolume };
    }, [exerciseDetails]);

    const handleRepeat = async () => {
        if (!workout) return;
        try {
            await useHistoryStore.getState().repeatWorkout(workout.id, { includeSets: false });
            router.push('/workout/logger' as any);
        } catch (e) {
            console.error('Failed to repeat workout', e);
        }
    };

    const handleDelete = async () => {
        if (!workout) return;
        Alert.alert(
            'Delete Workout',
            'This will permanently delete the workout and its sets. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await useHistoryStore.getState().deleteWorkout(workout.id);
                        router.back();
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={COLORS.accent.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!workout) return null;

    const minutes = workout.duration ? Math.floor(workout.duration / 60) : 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 border-b" style={{ borderBottomColor: COLORS.border }}>
                    <Text className="text-3xl font-bold text-white">Workout Detail</Text>
                    <Text className="text-gray-400 text-base mt-1">{formatDate(workout.started_at)}</Text>
                </View>

                <ScrollView className="flex-1 px-6 py-6">
                    {/* KPI Grid */}
                    <View className="flex-row mb-6">
                        <View className="flex-1 items-center p-4 rounded-2xl mr-2" style={{ backgroundColor: COLORS.background.secondary }}>
                            <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>{minutes}</Text>
                            <Text className="text-gray-400 text-sm mt-1">Minutes</Text>
                        </View>
                        <View className="flex-1 items-center p-4 rounded-2xl ml-2" style={{ backgroundColor: COLORS.background.secondary }}>
                            <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>{exerciseDetails.length}</Text>
                            <Text className="text-gray-400 text-sm mt-1">{exerciseDetails.length === 1 ? 'Exercise' : 'Exercises'}</Text>
                        </View>
                    </View>

                    <View className="flex-row mb-6">
                        <View className="flex-1 items-center p-4 rounded-2xl mr-2" style={{ backgroundColor: COLORS.background.secondary }}>
                            <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>{totals.completedSets}</Text>
                            <Text className="text-gray-400 text-sm mt-1">Sets</Text>
                        </View>
                        <View className="flex-1 items-center p-4 rounded-2xl ml-2" style={{ backgroundColor: COLORS.background.secondary }}>
                            <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>{totals.totalReps}</Text>
                            <Text className="text-gray-400 text-sm mt-1">Reps</Text>
                        </View>
                    </View>

                    {/* Volume */}
                    <View className="items-center p-6 rounded-2xl mb-6" style={{ backgroundColor: COLORS.background.secondary }}>
                        <Text className="text-5xl font-bold" style={{ color: COLORS.accent.secondary }}>
                            {formatWeightClean(totals.totalVolume, useSettingsUnit())}
                        </Text>
                        <Text className="text-gray-400 text-base mt-2">Total Volume</Text>
                    </View>

                    {/* Notes */}
                    {workout.notes ? (
                        <View className="p-4 rounded-2xl mb-6" style={{ backgroundColor: COLORS.background.secondary }}>
                            <Text className="text-white font-semibold mb-2">Notes</Text>
                            <Text className="text-gray-300">{workout.notes}</Text>
                        </View>
                    ) : null}

                    {/* Exercise Accordion */}
                    <Text className="text-xl font-semibold text-white mb-3">Exercises</Text>
                    {exerciseDetails.map((d) => {
                        const isOpen = expanded[d.id] === true;
                        const completed = d.sets.filter((s) => s.is_completed === 1).length;
                        return (
                            <View key={d.id} className="rounded-2xl mb-3" style={{ backgroundColor: COLORS.background.secondary }}>
                                <Pressable
                                    onPress={() => setExpanded((prev) => ({ ...prev, [d.id]: !prev[d.id] }))}
                                    className="flex-row items-center justify-between p-4"
                                >
                                    <View>
                                        <Text className="text-white font-semibold">{d.name}</Text>
                                        <Text className="text-gray-400 text-sm mt-1">{completed}/{d.sets.length} sets completed</Text>
                                    </View>
                                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.text.secondary} />
                                </Pressable>
                                {isOpen && (
                                    <View className="px-4 pb-4">
                                        {/* Table header */}
                                        <View className="flex-row items-center py-2 border-b" style={{ borderBottomColor: COLORS.border }}>
                                            <View className="w-12"><Text className="text-center text-xs" style={{ color: COLORS.text.tertiary }}>SET</Text></View>
                                            <View className="flex-1 mx-2"><Text className="text-center text-xs" style={{ color: COLORS.text.tertiary }}>REPS</Text></View>
                                            <View className="flex-1 mx-2"><Text className="text-center text-xs" style={{ color: COLORS.text.tertiary }}>WEIGHT</Text></View>
                                            <View className="w-10 mx-2" />
                                        </View>
                                        {d.sets.map((s, idx) => (
                                            <View key={s.id} className="flex-row items-center py-3 border-b" style={{ borderBottomColor: COLORS.border }}>
                                                <View className="w-12"><Text className="text-center text-white">{idx + 1}</Text></View>
                                                <View className="flex-1 mx-2"><Text className="text-center text-white">{s.reps}</Text></View>
                                                <View className="flex-1 mx-2"><Text className="text-center text-white">{s.weight}</Text></View>
                                                <View className="w-10 mx-2 items-center justify-center">
                                                    {s.is_completed === 1 && <Ionicons name="checkmark-circle" size={18} color={COLORS.accent.secondary} />}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Actions */}
                <View className="px-6 py-4 border-t" style={{ borderTopColor: COLORS.border }}>
                    <View className="flex-row">
                        <Pressable
                            onPress={handleDelete}
                            className="flex-1 py-4 rounded-full mr-2 items-center"
                            style={{ backgroundColor: COLORS.background.tertiary }}
                        >
                            <Text className="text-white font-semibold">Delete</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleRepeat}
                            className="flex-1 py-4 rounded-full ml-2 items-center"
                            style={{ backgroundColor: COLORS.accent.primary }}
                        >
                            <Text className="text-black font-bold">Repeat Workout</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

// Helper hook to get units without wiring store across screen logic
import { useSettingsStore } from '../../../store/settingsStore';
function useSettingsUnit() {
    return useSettingsStore((s) => s.unitPreference);
}
