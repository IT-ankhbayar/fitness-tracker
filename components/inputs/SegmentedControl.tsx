// SegmentedControl component - Tab-like switcher

import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { COLORS } from '../../utils/constants';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onSelect,
}: SegmentedControlProps) {
  return (
    <View
      className="flex-row p-1 rounded-xl"
      style={{ backgroundColor: COLORS.background.secondary }}
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(index)}
            className="flex-1 py-2 px-4 rounded-lg items-center"
            style={{
              backgroundColor: isSelected
                ? COLORS.background.tertiary
                : 'transparent',
              minHeight: 44,
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Select ${option}`}
          >
            <Text
              className="text-sm font-medium"
              style={{
                color: isSelected ? COLORS.text.primary : COLORS.text.secondary,
              }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
