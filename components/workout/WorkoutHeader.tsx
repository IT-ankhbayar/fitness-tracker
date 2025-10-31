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
}

export function WorkoutHeader({
  elapsedSeconds,
  onFinish,
  onCancel,
  onOpenNotes,
}: WorkoutHeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between px-6 py-4 border-b"
      style={{ borderBottomColor: COLORS.border }}
    >
      {/* Cancel Button */}
      <Pressable onPress={onCancel} hitSlop={8}>
        <Ionicons name="close" size={28} color={COLORS.text.secondary} />
      </Pressable>

      {/* Timer */}
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
      </View>

      {/* Notes + Finish */}
      <View className="flex-row items-center">
        {onOpenNotes && (
          <Pressable onPress={onOpenNotes} hitSlop={8} className="mr-3">
            <Ionicons name="document-text-outline" size={24} color={COLORS.text.secondary} />
          </Pressable>
        )}
        <Pressable
          onPress={onFinish}
          className="px-4 py-2 rounded-full"
          style={{ backgroundColor: COLORS.accent.secondary }}
        >
          <Text className="text-black font-bold">Finish</Text>
        </Pressable>
      </View>
    </View>
  );
}
