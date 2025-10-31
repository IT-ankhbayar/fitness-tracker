import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';

export default function RootLayout() {
  const { isReady, error } = useDatabase();

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white text-lg mb-2">Database Error</Text>
        <Text className="text-gray-400 text-sm">{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#D4FF00" />
        <Text className="text-white text-lg mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
