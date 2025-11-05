// Profile tab screen

import { View, Text, ScrollView, Pressable, Switch, Alert, Share, TextInput } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { useSettingsStore } from '../../store/settingsStore';
import { SegmentedControl } from '../../components/inputs/SegmentedControl';
import { exportService } from '../../services/exportService';
import { databaseService } from '../../services/database';
import { importService } from '../../services/importService';
import { useWorkoutStore } from '../../store/workoutStore';
import { useHistoryStore } from '../../store/historyStore';
import { useProgressStore } from '../../store/progressStore';

export default function ProfileScreen() {
  const unitPreference = useSettingsStore((state) => state.unitPreference);
  const weeklyTargetDays = useSettingsStore((state) => state.weeklyTargetDays);
  const updateUnitPreference = useSettingsStore((state) => state.updateUnitPreference);
  const updateWeeklyTarget = useSettingsStore((state) => state.updateWeeklyTarget);
  const restTimerDefault = useSettingsStore((state) => state.restTimerDefault);
  const autoStartRestTimer = useSettingsStore((state) => state.autoStartRestTimer);
  const updateRestTimerDefault = useSettingsStore((state) => state.updateRestTimerDefault);
  const updateAutoStartRestTimer = useSettingsStore((state) => state.updateAutoStartRestTimer);

  const [editingWeeklyTarget, setEditingWeeklyTarget] = useState(false);
  const [editingRestTimer, setEditingRestTimer] = useState(false);
  const [importExpanded, setImportExpanded] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExport = async () => {
    try {
      const payload = await exportService.exportAll();
      const json = JSON.stringify(payload, null, 2);
      await Share.share({
        message: json,
        title: 'PulseLift Export',
      });
    } catch (e) {
      console.error('Export failed:', e);
      Alert.alert('Export failed', 'Unable to export data. Please try again.');
    }
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      'Delete all data?',
      'This will permanently remove all workouts, sets, exercises usage data, PRs, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.reset();
              // Clear in-memory stores and reload defaults
              useWorkoutStore.getState().clearWorkout();
              useHistoryStore.getState().clear();
              await useSettingsStore.getState().loadSettings();
              await useProgressStore.getState().refresh();
              Alert.alert('Data deleted', 'All app data has been reset.');
            } catch (e) {
              console.error('Delete all failed:', e);
              Alert.alert('Delete failed', 'Unable to delete data. Please try again.');
            }
          },
        },
      ]
    );
  };

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
              accessibilityRole="button"
              accessibilityLabel={`Toggle weight units. Currently ${unitPreference}`}
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
            <Pressable
              onPress={() => setEditingWeeklyTarget((v) => !v)}
              className="bg-gray-800 rounded-2xl p-4 mb-3"
              accessibilityRole="button"
              accessibilityLabel="Edit weekly workout target"
            >
              <View className="flex-row items-center justify-between">
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

              {editingWeeklyTarget && (
                <View className="mt-4">
                  <Text className="text-gray-400 text-sm mb-2">Select days per week</Text>
                  <SegmentedControl
                    options={["0", "1", "2", "3", "4", "5", "6", "7"]}
                    selectedIndex={Math.min(7, Math.max(0, weeklyTargetDays))}
                    onSelect={async (index) => {
                      await updateWeeklyTarget(index);
                    }}
                  />
                  <View className="flex-row justify-end mt-3">
                    <Pressable
                      onPress={() => setEditingWeeklyTarget(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Done editing weekly target"
                    >
                      <Text className="text-white" style={{ color: COLORS.accent.primary }}>Done</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Pressable>

            {/* Rest Timer */}
            <Pressable
              onPress={() => setEditingRestTimer((v) => !v)}
              className="bg-gray-800 rounded-2xl p-4 mb-6"
              accessibilityRole="button"
              accessibilityLabel="Edit rest timer settings"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="timer-outline" size={24} color={COLORS.text.secondary} />
                  <View className="ml-3">
                    <Text className="text-white text-base font-medium">Rest Timer</Text>
                    <Text className="text-gray-400 text-sm">Default rest period</Text>
                  </View>
                </View>
                <Text style={{ color: COLORS.accent.primary }} className="text-base font-semibold">
                  {restTimerDefault}s
                </Text>
              </View>

              {editingRestTimer && (
                <View className="mt-4">
                  {/* Duration options */}
                  <Text className="text-gray-400 text-sm mb-2">Default duration</Text>
                  <SegmentedControl
                    options={["30s", "60s", "90s", "120s"]}
                    selectedIndex={[30, 60, 90, 120].indexOf(restTimerDefault) >= 0 ? [30, 60, 90, 120].indexOf(restTimerDefault) : 2}
                    onSelect={async (index) => {
                      const value = [30, 60, 90, 120][index] ?? 90;
                      await updateRestTimerDefault(value);
                    }}
                  />

                  {/* Auto-start toggle */}
                  <View className="flex-row items-center justify-between mt-4">
                    <View>
                      <Text className="text-white text-base font-medium">Auto-start after set</Text>
                      <Text className="text-gray-400 text-sm">Start rest timer when a set is completed</Text>
                    </View>
                    <Switch
                      value={autoStartRestTimer}
                      onValueChange={async (val) => {
                        await updateAutoStartRestTimer(val);
                      }}
                      trackColor={{ false: '#555', true: COLORS.accent.primary }}
                      thumbColor={autoStartRestTimer ? '#000' : '#f4f3f4'}
                      accessibilityLabel="Auto-start rest timer after completing a set"
                    />
                  </View>

                  <View className="flex-row justify-end mt-3">
                    <Pressable
                      onPress={() => setEditingRestTimer(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Done editing rest timer"
                    >
                      <Text className="text-white" style={{ color: COLORS.accent.primary }}>Done</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Pressable>

            {/* Data Section */}
            <Text className="text-xl font-semibold text-white mb-4 mt-4">Data</Text>

            <Pressable
              onPress={handleExport}
              className="bg-gray-800 rounded-2xl p-4 mb-3"
              accessibilityRole="button"
              accessibilityLabel="Export data to JSON"
            >
              <Text className="text-white text-base font-medium">Export Data</Text>
              <Text className="text-gray-400 text-sm mt-1">Share your data as JSON</Text>
            </Pressable>

            {/* Import Data */}
            <Pressable
              onPress={() => setImportExpanded((v) => !v)}
              className="bg-gray-800 rounded-2xl p-4 mb-3"
              accessibilityRole="button"
              accessibilityLabel="Import data from JSON"
              accessibilityHint="Expands to show paste area and actions"
            >
              <Text className="text-white text-base font-medium">Import Data</Text>
              <Text className="text-gray-400 text-sm mt-1">Paste previously exported JSON</Text>
              {importExpanded && (
                <View className="mt-3">
                  <TextInput
                    className="bg-gray-900 rounded-xl text-white p-3"
                    placeholder="Paste JSON here"
                    placeholderTextColor="#666"
                    value={importText}
                    onChangeText={setImportText}
                    multiline
                    numberOfLines={6}
                    style={{ textAlignVertical: 'top' }}
                  />
                  <View className="flex-row justify-end mt-3">
                    <Pressable
                      onPress={() => setImportText('')}
                      className="mr-4"
                      accessibilityRole="button"
                      accessibilityLabel="Clear import text"
                    >
                      <Text className="text-gray-300">Clear</Text>
                    </Pressable>
                    <Pressable
                      onPress={async () => {
                        try {
                          await importService.importJSON(importText);
                          setImportExpanded(false);
                          setImportText('');
                          // Refresh stores
                          await useSettingsStore.getState().loadSettings();
                          useWorkoutStore.getState().clearWorkout();
                          useHistoryStore.getState().clear();
                          await useProgressStore.getState().refresh();
                          Alert.alert('Import complete', 'Your data has been restored.');
                        } catch (e: any) {
                          console.error('Import failed:', e);
                          Alert.alert('Import failed', e?.message || 'Unable to import data.');
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Import data"
                    >
                      <Text style={{ color: COLORS.accent.primary }} className="font-semibold">Import</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={handleDeleteAll}
              className="bg-gray-800 rounded-2xl p-4 mb-6"
              accessibilityRole="button"
              accessibilityLabel="Delete all data"
              accessibilityHint="This action cannot be undone"
            >
              <Text className="text-white text-base font-medium">Delete All Data</Text>
              <Text className="text-gray-400 text-sm mt-1">Permanently remove all data</Text>
            </Pressable>

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
