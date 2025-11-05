// FilterChip component - Toggleable filter tag

import React from 'react';
import { Pressable, Text } from 'react-native';
import { COLORS } from '../../utils/constants';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className="px-4 py-2 rounded-full mr-2 mb-2"
      style={{
        backgroundColor: selected ? COLORS.accent.primary : COLORS.background.secondary,
        borderWidth: 1,
        borderColor: selected ? COLORS.accent.primary : COLORS.border,
        minHeight: 44,
        justifyContent: 'center',
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label} filter ${selected ? 'selected' : 'not selected'}`}
    >
      <Text
        className="text-sm font-medium"
        style={{
          color: selected ? COLORS.background.primary : COLORS.text.primary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
