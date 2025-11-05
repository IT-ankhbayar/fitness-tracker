// RestTimerSheet - Bottom sheet for controlling the rest timer

import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { useWorkoutStore } from '../../store/workoutStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatTimerDuration } from '../../utils/formatters';

interface RestTimerSheetProps {
    visible: boolean;
    onClose: () => void;
}

export function RestTimerSheet({ visible, onClose }: RestTimerSheetProps) {
    const {
        restRemaining,
        restTimerActive,
        startRestTimer,
        stopRestTimer,
        pauseRestTimer,
        resumeRestTimer,
    } = useWorkoutStore();

    const { restTimerDefault } = useSettingsStore();

    const presets = [30, 60, 90, 120];

    const handleStart = (duration?: number) => {
        const dur = duration || restTimerDefault || 90;
        startRestTimer(dur);
    };

    const handlePauseResume = () => {
        if (restTimerActive) {
            pauseRestTimer();
        } else if (restRemaining > 0) {
            resumeRestTimer();
        } else {
            handleStart();
        }
    };

    const handleCancel = () => {
        stopRestTimer();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }} edges={['bottom']}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b" style={{ borderBottomColor: COLORS.border }}>
                    <Text className="text-2xl font-bold text-white">Rest Timer</Text>
                    <Pressable
                        onPress={onClose}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Close rest timer"
                    >
                        <Ionicons name="close" size={28} color={COLORS.text.primary} />
                    </Pressable>
                </View>

                {/* Timer Display */}
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-6xl font-extrabold mb-2" style={{ color: COLORS.accent.primary }}>
                        {formatTimerDuration(restRemaining > 0 ? restRemaining : (restTimerDefault || 90))}
                    </Text>
                    <Text className="text-gray-400">{restTimerActive ? 'Counting down' : restRemaining > 0 ? 'Paused' : 'Ready'}</Text>

                    {/* Controls */}
                    <View className="flex-row items-center mt-8">
                        <Pressable
                            onPress={handlePauseResume}
                            className="mx-3 w-16 h-16 rounded-full items-center justify-center"
                            style={{ backgroundColor: COLORS.accent.primary }}
                            accessibilityRole="button"
                            accessibilityLabel={restTimerActive ? 'Pause rest timer' : restRemaining > 0 ? 'Resume rest timer' : 'Start rest timer'}
                        >
                            <Ionicons name={restTimerActive ? 'pause' : 'play'} size={28} color={COLORS.background.primary} />
                        </Pressable>
                        <Pressable
                            onPress={handleCancel}
                            className="mx-3 w-16 h-16 rounded-full items-center justify-center"
                            style={{ backgroundColor: COLORS.background.secondary }}
                            accessibilityRole="button"
                            accessibilityLabel="Stop rest timer"
                        >
                            <Ionicons name="stop" size={24} color={COLORS.text.primary} />
                        </Pressable>
                    </View>

                    {/* Presets */}
                    <View className="flex-row flex-wrap justify-center mt-10">
                        {presets.map((p) => (
                            <Pressable
                                key={p}
                                onPress={() => handleStart(p)}
                                className="px-4 py-2 rounded-full m-2"
                                style={{ backgroundColor: COLORS.background.secondary }}
                                accessibilityRole="button"
                                accessibilityLabel={`Start ${p} seconds timer`}
                            >
                                <Text className="text-white font-medium">{p}s</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <View className="px-6 py-4 border-t" style={{ borderTopColor: COLORS.border }}>
                    <Pressable
                        onPress={() => { onClose(); }}
                        className="py-4 rounded-full items-center"
                        style={{ backgroundColor: COLORS.background.secondary }}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                    >
                        <Text className="text-white text-base">Close</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
