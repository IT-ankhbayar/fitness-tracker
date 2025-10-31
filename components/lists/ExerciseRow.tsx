// ExerciseRow component - Display exercise in list with actions

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../../types/database';
import { COLORS } from '../../utils/constants';

interface ExerciseRowProps {
  exercise: Exercise;
  onPress?: () => void;
  onAddPress?: () => void;
  onFavoritePress?: () => void;
  onInfoPress?: () => void;
  showAddButton?: boolean;
  showFavoriteButton?: boolean;
  isSelected?: boolean;
}

export function ExerciseRow({
  exercise,
  onPress,
  onAddPress,
  onFavoritePress,
  onInfoPress,
  showAddButton = false,
  showFavoriteButton = true,
  isSelected = false,
}: ExerciseRowProps) {
  const handleMainPress = () => {
    if (onPress) {
      onPress();
    } else if (onInfoPress) {
      onInfoPress();
    }
  };

  return (
    <Pressable
      onPress={handleMainPress}
      className="flex-row items-center p-4 rounded-2xl mb-2"
      style={{
        backgroundColor: isSelected
          ? COLORS.background.tertiary
          : COLORS.background.secondary,
        borderWidth: isSelected ? 1 : 0,
        borderColor: COLORS.accent.primary,
      }}
    >
      {/* Main Content */}
      <View className="flex-1 mr-3">
        <Text className="text-white text-base font-semibold mb-1">
          {exercise.name}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-gray-400 text-sm">
            {exercise.primary_muscle}
          </Text>
          <View
            className="w-1 h-1 rounded-full mx-2"
            style={{ backgroundColor: COLORS.text.tertiary }}
          />
          <Text className="text-gray-400 text-sm">
            {exercise.equipment}
          </Text>
          {exercise.is_bodyweight === 1 && (
            <>
              <View
                className="w-1 h-1 rounded-full mx-2"
                style={{ backgroundColor: COLORS.text.tertiary }}
              />
              <Text className="text-gray-400 text-sm">Bodyweight</Text>
            </>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center">
        {showFavoriteButton && onFavoritePress && (
          <Pressable
            onPress={onFavoritePress}
            hitSlop={8}
            className="mr-3"
          >
            <Ionicons
              name={exercise.is_favorite === 1 ? 'heart' : 'heart-outline'}
              size={24}
              color={exercise.is_favorite === 1 ? COLORS.accent.secondary : COLORS.text.secondary}
            />
          </Pressable>
        )}

        {onInfoPress && (
          <Pressable
            onPress={onInfoPress}
            hitSlop={8}
            className="mr-3"
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={COLORS.text.secondary}
            />
          </Pressable>
        )}

        {showAddButton && onAddPress && (
          <Pressable
            onPress={onAddPress}
            hitSlop={8}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{
              backgroundColor: isSelected
                ? COLORS.accent.secondary
                : COLORS.accent.primary,
            }}
          >
            <Ionicons
              name={isSelected ? 'checkmark' : 'add'}
              size={20}
              color={COLORS.background.primary}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
