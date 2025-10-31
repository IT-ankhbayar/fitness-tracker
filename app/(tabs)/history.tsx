// History tab screen

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-white">History</Text>
          <Text className="text-gray-400 text-base mt-1">Your workout log</Text>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Empty State */}
          <View className="items-center justify-center py-16">
            <Ionicons name="calendar-outline" size={64} color={COLORS.text.tertiary} />
            <Text className="text-xl font-semibold text-white mt-6 mb-2">
              No Workouts Yet
            </Text>
            <Text className="text-gray-400 text-center px-8">
              Complete your first workout to start tracking your progress
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
