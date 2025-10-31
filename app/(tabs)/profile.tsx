// Profile tab screen

import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { useSettingsStore } from '../../store/settingsStore';

export default function ProfileScreen() {
  const unitPreference = useSettingsStore((state) => state.unitPreference);
  const weeklyTargetDays = useSettingsStore((state) => state.weeklyTargetDays);
  const updateUnitPreference = useSettingsStore((state) => state.updateUnitPreference);

  const toggleUnits = async () => {
    const newUnit = unitPreference === 'kg' ? 'lb' : 'kg';
    await updateUnitPreference(newUnit);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-white">Profile</Text>
          <Text className="text-gray-400 text-base mt-1">Settings and preferences</Text>
        </View>

        <ScrollView className="flex-1">
          {/* Settings Section */}
          <View className="px-6">
            <Text className="text-xl font-semibold text-white mb-4">Settings</Text>

            {/* Units */}
            <Pressable
              onPress={toggleUnits}
              className="bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons name="barbell-outline" size={24} color={COLORS.text.secondary} />
                <View className="ml-3">
                  <Text className="text-white text-base font-medium">Weight Units</Text>
                  <Text className="text-gray-400 text-sm">Currently using {unitPreference}</Text>
                </View>
              </View>
              <Text style={{ color: COLORS.accent.primary }} className="text-base font-semibold">
                {unitPreference.toUpperCase()}
              </Text>
            </Pressable>

            {/* Weekly Target */}
            <View className="bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={24} color={COLORS.text.secondary} />
                <View className="ml-3">
                  <Text className="text-white text-base font-medium">Weekly Target</Text>
                  <Text className="text-gray-400 text-sm">Workouts per week</Text>
                </View>
              </View>
              <Text style={{ color: COLORS.accent.primary }} className="text-base font-semibold">
                {weeklyTargetDays}
              </Text>
            </View>

            {/* Rest Timer */}
            <View className="bg-gray-800 rounded-2xl p-4 mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="timer-outline" size={24} color={COLORS.text.secondary} />
                <View className="ml-3">
                  <Text className="text-white text-base font-medium">Rest Timer</Text>
                  <Text className="text-gray-400 text-sm">Default rest period</Text>
                </View>
              </View>
              <Text style={{ color: COLORS.accent.primary }} className="text-base font-semibold">
                90s
              </Text>
            </View>

            {/* Data Section */}
            <Text className="text-xl font-semibold text-white mb-4 mt-4">Data</Text>

            <View className="bg-gray-800 rounded-2xl p-4 mb-3">
              <Text className="text-white text-base font-medium">Export Data</Text>
              <Text className="text-gray-400 text-sm mt-1">Download your workout history</Text>
            </View>

            <View className="bg-gray-800 rounded-2xl p-4 mb-6">
              <Text className="text-white text-base font-medium">Delete All Data</Text>
              <Text className="text-gray-400 text-sm mt-1">Permanently remove all data</Text>
            </View>

            {/* About Section */}
            <Text className="text-xl font-semibold text-white mb-4 mt-4">About</Text>

            <View className="bg-gray-800 rounded-2xl p-4 mb-6">
              <Text className="text-white text-base font-medium">PulseLift</Text>
              <Text className="text-gray-400 text-sm mt-1">Version 1.0.0</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
