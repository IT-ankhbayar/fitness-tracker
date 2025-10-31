// ExerciseInfoSheet - Bottom sheet showing exercise details

import React from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../../types/database';
import { COLORS } from '../../utils/constants';

interface ExerciseInfoSheetProps {
  exercise: Exercise | null;
  visible: boolean;
  onClose: () => void;
}

export function ExerciseInfoSheet({
  exercise,
  visible,
  onClose,
}: ExerciseInfoSheetProps) {
  if (!exercise) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: COLORS.background.primary }}
        edges={['bottom']}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b"
            style={{ borderBottomColor: COLORS.border }}
          >
            <Text className="text-2xl font-bold text-white">
              Exercise Info
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={28} color={COLORS.text.primary} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            {/* Exercise Name */}
            <Text className="text-3xl font-bold text-white mb-4">
              {exercise.name}
            </Text>

            {/* Metadata */}
            <View className="mb-6">
              <InfoItem
                icon="barbell"
                label="Primary Muscle"
                value={exercise.primary_muscle}
              />
              {exercise.secondary_muscles && (
                <InfoItem
                  icon="fitness"
                  label="Secondary Muscles"
                  value={exercise.secondary_muscles}
                />
              )}
              <InfoItem
                icon="cube"
                label="Equipment"
                value={exercise.equipment}
              />
              {exercise.movement_pattern && (
                <InfoItem
                  icon="trending-up"
                  label="Movement Pattern"
                  value={exercise.movement_pattern}
                />
              )}
              {exercise.difficulty && (
                <InfoItem
                  icon="stats-chart"
                  label="Difficulty"
                  value={exercise.difficulty}
                />
              )}
              {exercise.is_bodyweight === 1 && (
                <InfoItem
                  icon="person"
                  label="Type"
                  value="Bodyweight Exercise"
                />
              )}
            </View>

            {/* Form Tips */}
            {exercise.form_tips && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="information-circle"
                    size={24}
                    color={COLORS.accent.primary}
                  />
                  <Text className="text-xl font-semibold text-white ml-2">
                    Form Tips
                  </Text>
                </View>
                <View
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: COLORS.background.secondary }}
                >
                  <Text className="text-gray-300 text-base leading-6">
                    {exercise.form_tips}
                  </Text>
                </View>
              </View>
            )}

            {/* Placeholder for future video/image */}
            <View
              className="p-8 rounded-2xl items-center justify-center mb-6"
              style={{ backgroundColor: COLORS.background.secondary }}
            >
              <Ionicons name="play-circle-outline" size={48} color={COLORS.text.tertiary} />
              <Text className="text-gray-400 text-sm mt-2">
                Video guide coming soon
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// Helper component for info items
function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-3">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: COLORS.background.secondary }}
      >
        <Ionicons name={icon as any} size={20} color={COLORS.accent.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-400 text-xs mb-1">{label}</Text>
        <Text className="text-white text-base font-medium">{value}</Text>
      </View>
    </View>
  );
}
