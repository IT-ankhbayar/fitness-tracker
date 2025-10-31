// SetRow component - Editable row in set table

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Set } from '../../types/database';
import { COLORS } from '../../utils/constants';
import { useSettingsStore } from '../../store/settingsStore';

interface SetRowProps {
  set: Set;
  setNumber: number;
  onUpdate: (data: Partial<Set>) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export function SetRow({
  set,
  setNumber,
  onUpdate,
  onToggleComplete,
  onDelete,
}: SetRowProps) {
  const unitPreference = useSettingsStore((state) => state.unitPreference);

  const [reps, setReps] = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weight.toString());

  const handleRepsChange = (text: string) => {
    setReps(text);
  };

  const handleRepsBlur = () => {
    const value = parseInt(reps, 10);
    if (!isNaN(value) && value >= 0) {
      onUpdate({ reps: value });
    } else {
      setReps(set.reps.toString());
    }
  };

  const handleWeightChange = (text: string) => {
    setWeight(text);
  };

  const handleWeightBlur = () => {
    const value = parseFloat(weight);
    if (!isNaN(value) && value >= 0) {
      onUpdate({ weight: value });
    } else {
      setWeight(set.weight.toString());
    }
  };

  const isCompleted = set.is_completed === 1;
  const isWarmup = set.is_warmup === 1;

  return (
    <View
      className="flex-row items-center py-3 border-b"
      style={{
        borderBottomColor: COLORS.border,
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      {/* Set Number */}
      <View className="w-12">
        <Text
          className="text-center font-semibold"
          style={{ color: isWarmup ? COLORS.accent.secondary : COLORS.text.primary }}
        >
          {isWarmup ? 'W' : setNumber}
        </Text>
      </View>

      {/* Reps Input */}
      <View className="flex-1 mx-2">
        <TextInput
          value={reps}
          onChangeText={handleRepsChange}
          onBlur={handleRepsBlur}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={COLORS.text.tertiary}
          className="text-white text-center text-base font-medium py-2 px-3 rounded-lg"
          style={{
            backgroundColor: COLORS.background.tertiary,
          }}
        />
      </View>

      {/* Weight Input */}
      <View className="flex-1 mx-2">
        <TextInput
          value={weight}
          onChangeText={handleWeightChange}
          onBlur={handleWeightBlur}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={COLORS.text.tertiary}
          className="text-white text-center text-base font-medium py-2 px-3 rounded-lg"
          style={{
            backgroundColor: COLORS.background.tertiary,
          }}
        />
        <Text className="text-xs text-center mt-1" style={{ color: COLORS.text.tertiary }}>
          {unitPreference}
        </Text>
      </View>

      {/* Complete Checkbox */}
      <Pressable
        onPress={onToggleComplete}
        hitSlop={8}
        className="w-10 h-10 rounded-full items-center justify-center mx-2"
        style={{
          backgroundColor: isCompleted ? COLORS.accent.secondary : COLORS.background.secondary,
        }}
      >
        {isCompleted && (
          <Ionicons name="checkmark" size={20} color={COLORS.background.primary} />
        )}
      </Pressable>

      {/* Delete Button */}
      <Pressable onPress={onDelete} hitSlop={8} className="ml-2">
        <Ionicons name="trash-outline" size={20} color={COLORS.text.tertiary} />
      </Pressable>
    </View>
  );
}
