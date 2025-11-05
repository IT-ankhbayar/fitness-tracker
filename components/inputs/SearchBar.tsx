// SearchBar component with debouncing

import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, APP_CONFIG } from '../../utils/constants';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  debounceMs?: number;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search exercises...',
  value,
  onChangeText,
  debounceMs = APP_CONFIG.debounceDelay,
  autoFocus = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeText(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
  };

  return (
    <View
      className="flex-row items-center px-4 py-3 rounded-2xl"
      style={{ backgroundColor: COLORS.background.secondary }}
    >
      <Ionicons
        name="search"
        size={20}
        color={COLORS.text.secondary}
        style={{ marginRight: 8 }}
      />
      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.tertiary}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        className="flex-1 text-white text-base"
      />
      {localValue.length > 0 && (
        <Pressable
          onPress={handleClear}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={20} color={COLORS.text.secondary} />
        </Pressable>
      )}
    </View>
  );
}
