// EmptyState component - Display when no results/data

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = 'search-outline',
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-16 px-8">
      <Ionicons name={icon} size={64} color={COLORS.text.tertiary} />
      <Text className="text-xl font-semibold text-white mt-6 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-gray-400 text-center mb-6">
        {message}
      </Text>
      {action && <View>{action}</View>}
    </View>
  );
}
