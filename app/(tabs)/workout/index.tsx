// Workout planner entry screen (tab root)

import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '../../../store/workoutStore';
import { usePlannerStore } from '../../../store/plannerStore';
import { COLORS } from '../../../utils/constants';

export default function WorkoutIndexScreen() {
    const { activeWorkout, loadActiveWorkout, startWorkout } = useWorkoutStore();
    const { plannedExercises, plannedExerciseIds, clear, savePlan } = usePlannerStore();

    // Load active workout on mount
    useEffect(() => {
        loadActiveWorkout();
    }, []);

    // If there's an active workout, navigate to logger
    useEffect(() => {
        if (activeWorkout && activeWorkout.status === 'in_progress') {
            router.push('/workout/logger' as any);
        }
    }, [activeWorkout]);

    const handleStartWorkout = async () => {
        await startWorkout();
        // If there's a plan, add planned exercises to the new workout
        if (plannedExerciseIds.length > 0) {
            const ids = [...plannedExerciseIds];
            await useWorkoutStore.getState().addExercisesToWorkout(ids);
            clear();
            router.push('/workout/logger' as any);
            return;
        }
        router.push('/workout/exercise-picker' as any);
    };

    const handleAddExercises = () => {
        router.push({ pathname: '/workout/exercise-picker', params: { mode: 'plan' } } as any);
    };

    const handleSavePlan = async () => {
        if (plannedExerciseIds.length === 0) return;
        await savePlan();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4">
                    <Text className="text-3xl font-bold text-white">Workout</Text>
                    <Text className="text-gray-400 text-base mt-1">Plan and track your session</Text>
                </View>

                <ScrollView className="flex-1 px-6">
                    {/* Planner State */}
                    {plannedExercises.length === 0 ? (
                        <View className="items-center justify-center py-16">
                            <Ionicons name="barbell-outline" size={64} color={COLORS.text.tertiary} />
                            <Text className="text-xl font-semibold text-white mt-6 mb-2">
                                Plan your workout
                            </Text>
                            <Text className="text-gray-400 text-center mb-8 px-8">
                                Add exercises to build a plan before you start logging
                            </Text>
                            <Pressable
                                onPress={handleAddExercises}
                                className="px-8 py-4 rounded-full"
                                style={{ backgroundColor: COLORS.accent.primary }}
                            >
                                <Text className="text-black text-lg font-semibold">Add Exercises</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View className="py-4">
                            {plannedExercises.map((ex, idx) => (
                                <View key={ex.id} className="flex-row items-center justify-between py-3 border-b" style={{ borderBottomColor: COLORS.border }}>
                                    <View className="flex-row items-center">
                                        <Text className="text-gray-400 mr-3">{idx + 1}.</Text>
                                        <Text className="text-white font-medium">{ex.name}</Text>
                                    </View>
                                    <Pressable onPress={() => usePlannerStore.getState().removeExercise(ex.id)}>
                                        <Ionicons name="trash-outline" size={20} color={COLORS.text.secondary} />
                                    </Pressable>
                                </View>
                            ))}
                            {/* Planner actions */}
                            <View className="mt-6">
                                <Pressable
                                    onPress={handleAddExercises}
                                    className="px-6 py-4 rounded-xl mb-3 items-center"
                                    style={{ backgroundColor: COLORS.background.tertiary }}
                                >
                                    <Text className="text-white font-semibold">Add More Exercises</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleSavePlan}
                                    className="px-6 py-4 rounded-xl mb-3 items-center"
                                    style={{ backgroundColor: COLORS.background.tertiary }}
                                >
                                    <Text className="text-white font-semibold">Save Plan</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleStartWorkout}
                                    className="px-6 py-4 rounded-xl items-center"
                                    style={{ backgroundColor: COLORS.accent.primary }}
                                >
                                    <Text className="text-black font-bold">Start Workout</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
