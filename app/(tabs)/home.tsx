// Home tab screen

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/constants';
import { getGreeting } from '../../utils/formatters';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Greeting Header */}
          <Text className="text-3xl font-bold text-white mb-2">
            {getGreeting()}
          </Text>
          <Text className="text-gray-400 text-base mb-8">
            Ready to crush your workout?
          </Text>

          {/* Quick Start Section - Placeholder */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Quick Start</Text>
            <View className="bg-gray-800 rounded-2xl p-6 mb-4">
              <Text className="text-white text-lg">Start Workout</Text>
            </View>
            <View className="bg-gray-800 rounded-2xl p-6 mb-4">
              <Text className="text-white text-lg">Repeat Last Workout</Text>
            </View>
          </View>

          {/* Streak Widget - Placeholder */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Your Progress</Text>
            <View className="bg-gray-800 rounded-2xl p-6">
              <Text className="text-4xl font-bold" style={{ color: COLORS.accent.primary }}>
                0
              </Text>
              <Text className="text-gray-400 text-base">Day Streak</Text>
            </View>
          </View>

          {/* Recent PRs - Placeholder */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Recent PRs</Text>
            <View className="bg-gray-800 rounded-2xl p-6">
              <Text className="text-gray-400 text-center">No personal records yet</Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                Complete your first workout to start tracking PRs
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
