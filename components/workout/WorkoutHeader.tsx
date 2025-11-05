// WorkoutHeader component - Timer and finish button

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { formatTimerDuration } from '../../utils/formatters';

interface WorkoutHeaderProps {
  elapsedSeconds: number;
  onFinish: () => void;
  onCancel: () => void;
  onOpenNotes?: () => void;
  // Rest timer pill
  restRemaining?: number;
  restTimerActive?: boolean;
  onOpenRestTimer?: () => void;
}

export function WorkoutHeader({
  elapsedSeconds,
  onFinish,
  onCancel,
  onOpenNotes,
  restRemaining = 0,
  restTimerActive = false,
  onOpenRestTimer,
}: WorkoutHeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between px-6 py-4 border-b"
      style={{ borderBottomColor: COLORS.border }}
    >
      {/* Cancel Button */}
      <Pressable
        onPress={onCancel}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Cancel workout"
      >
        <Ionicons name="close" size={28} color={COLORS.text.secondary} />
      </Pressable>

      {/* Timers */}
      <View className="items-center">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={20} color={COLORS.accent.primary} />
          <Text className="ml-2 text-2xl font-bold" style={{ color: COLORS.accent.primary }}>
            {formatTimerDuration(elapsedSeconds)}
          </Text>
        </View>
        <Text className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
          Workout Duration
        </Text>

        {/* Rest timer pill */}
        {restRemaining > 0 && (
          <Pressable
            onPress={onOpenRestTimer}
            accessibilityRole="button"
            accessibilityLabel={restTimerActive ? `Rest timer running ${formatTimerDuration(restRemaining)}` : `Rest timer paused ${formatTimerDuration(restRemaining)}`}
            className="mt-2 px-3 py-1 rounded-full flex-row items-center"
            style={{ backgroundColor: COLORS.background.secondary }}
            hitSlop={8}
          >
            <Ionicons
              name={restTimerActive ? 'timer-outline' : 'pause'}
              size={14}
              color={COLORS.text.primary}
            />
            <Text className="ml-2 text-xs font-medium" style={{ color: COLORS.text.primary }}>
              {formatTimerDuration(restRemaining)}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Notes + Finish */}
      <View className="flex-row items-center">
        {onOpenNotes && (
          <Pressable
            onPress={onOpenNotes}
            hitSlop={10}
            className="mr-3"
            accessibilityRole="button"
            accessibilityLabel="Open workout notes"
          >
            <Ionicons name="document-text-outline" size={24} color={COLORS.text.secondary} />
          </Pressable>
        )}
        <Pressable
          onPress={onFinish}
          className="px-4 py-2 rounded-full"
          style={{ backgroundColor: COLORS.accent.secondary }}
          accessibilityRole="button"
          accessibilityLabel="Finish workout"
        >
          <Text className="text-black font-bold">Finish</Text>
        </Pressable>
      </View>
    </View>
  );
}
