// Progress tab screen

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-white">Progress</Text>
          <Text className="text-gray-400 text-base mt-1">Track your gains</Text>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Consistency Ring - Placeholder */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Weekly Consistency</Text>
            <View className="bg-gray-800 rounded-2xl p-8 items-center">
              <View
                className="w-32 h-32 rounded-full items-center justify-center"
                style={{ borderWidth: 8, borderColor: COLORS.border }}
              >
                <Text className="text-4xl font-bold text-white">0%</Text>
              </View>
              <Text className="text-gray-400 text-base mt-4">0 of 3 workouts this week</Text>
            </View>
          </View>

          {/* Volume Chart - Placeholder */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Weekly Volume</Text>
            <View className="bg-gray-800 rounded-2xl p-6">
              <Text className="text-gray-400 text-center">No data yet</Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                Complete workouts to see your progress
              </Text>
            </View>
          </View>

          {/* Top Exercises - Placeholder */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-white mb-4">Top Exercises</Text>
            <View className="bg-gray-800 rounded-2xl p-6">
              <Text className="text-gray-400 text-center">No exercises tracked</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
