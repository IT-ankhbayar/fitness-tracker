// Workout Logger Screen - Active workout tracking

import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, Text, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '../../../store/workoutStore';
import { WorkoutHeader } from '../../../components/workout/WorkoutHeader';
import { ExerciseSection } from '../../../components/workout/ExerciseSection';
import { ExerciseInfoSheet } from '../../../components/sheets/ExerciseInfoSheet';
import { RestTimerSheet } from '../../../components/sheets/RestTimerSheet';
import { NotesSheet } from '../../../components/sheets/NotesSheet';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Exercise, Set } from '../../../types/database';
import { WorkoutExerciseWithDetails } from '../../../types/workout';
import { COLORS } from '../../../utils/constants';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

export default function LoggerScreen() {
  const {
    activeWorkout,
    workoutExercises,
    sessionElapsed,
    restRemaining,
    restTimerActive,
    updateSet,
    toggleSetComplete,
    deleteSet,
    addSet,
    duplicateLastSet,
    removeExerciseFromWorkout,
    finishWorkout,
    cancelWorkout,
  } = useWorkoutStore();

  const [infoSheetExercise, setInfoSheetExercise] = useState<Exercise | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [orderedExercises, setOrderedExercises] = useState<WorkoutExerciseWithDetails[]>([]);
  const [restOpen, setRestOpen] = useState(false);

  // Redirect if no active workout
  useEffect(() => {
    if (!activeWorkout) {
      router.back();
    }
  }, [activeWorkout]);

  // Enable LayoutAnimation on Android (fallback; Reanimated handles row transitions)
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const handleFinish = () => {
    if (workoutExercises.length === 0) {
      Alert.alert(
        'Empty Workout',
        'Add at least one exercise before finishing.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Finish Workout',
      'Are you ready to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            await finishWorkout();
            router.push('/workout/finish' as any);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel? All progress will be lost.',
      [
        { text: 'Keep Workout', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: async () => {
            await cancelWorkout();
            router.back();
          },
        },
      ]
    );
  };

  const handleAddExercises = () => {
    router.push('/workout/exercise-picker' as any);
  };

  const handleOpenNotes = () => {
    setNotesDraft(activeWorkout?.notes || '');
    setNotesOpen(true);
  };

  const handleUpdateSet = async (setId: number, data: Partial<Set>) => {
    await updateSet(setId, data);
  };

  const handleToggleSetComplete = async (setId: number) => {
    const exercise = workoutExercises.find((we) =>
      we.sets.some((s: Set) => s.id === setId)
    );
    if (exercise) {
      await toggleSetComplete(setId, exercise.id);
    }
  };

  const handleDeleteSet = async (setId: number, workoutExerciseId: number) => {
    // Fallback layout animation; primary animations handled by Reanimated exiting
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await deleteSet(setId, workoutExerciseId);
  };

  const handleAddSet = async (workoutExerciseId: number) => {
    // Fallback layout animation; primary animations handled by Reanimated entering
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await addSet(workoutExerciseId);
  };

  const handleDuplicateLastSet = async (workoutExerciseId: number) => {
    await duplicateLastSet(workoutExerciseId);
  };

  const handleRemoveExercise = (workoutExerciseId: number) => {
    Alert.alert(
      'Remove Exercise',
      'Remove this exercise and all its sets?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeExerciseFromWorkout(workoutExerciseId);
          },
        },
      ]
    );
  };

  // Keep local order in sync with store
  useEffect(() => {
    setOrderedExercises(workoutExercises);
  }, [workoutExercises]);

  const onDragEnd = async (data: WorkoutExerciseWithDetails[]) => {
    setOrderedExercises(data); // optimistic UI update
    const newOrderIds = data.map((we) => we.id);
    try {
      await useWorkoutStore.getState().reorderExercises(newOrderIds);
    } catch (e) {
      // If it fails, revert to store order
      setOrderedExercises(useWorkoutStore.getState().workoutExercises);
    }
  };

  const renderExerciseItem = ({ item, drag }: RenderItemParams<WorkoutExerciseWithDetails>) => (
    <Pressable onLongPress={drag} delayLongPress={120}>
      <ExerciseSection
        workoutExercise={item}
        onUpdateSet={handleUpdateSet}
        onToggleSetComplete={handleToggleSetComplete}
        onDeleteSet={(setId) => handleDeleteSet(setId, item.id)}
        onAddSet={() => handleAddSet(item.id)}
        onDuplicateLastSet={() => handleDuplicateLastSet(item.id)}
        onRemoveExercise={() => handleRemoveExercise(item.id)}
        onShowInfo={() => setInfoSheetExercise(item.exercise)}
      />
    </Pressable>
  );

  if (!activeWorkout) {
    return null; // Will redirect
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.background.primary }}
      edges={['top']}
    >
      <View className="flex-1">
        {/* Header with Timer */}
        <WorkoutHeader
          elapsedSeconds={sessionElapsed}
          onFinish={handleFinish}
          onCancel={handleCancel}
          onOpenNotes={handleOpenNotes}
          restRemaining={restRemaining}
          restTimerActive={restTimerActive}
          onOpenRestTimer={() => setRestOpen(true)}
        />

        {/* Exercise List */}
        {orderedExercises.length === 0 ? (
          <EmptyState
            icon="barbell-outline"
            title="No exercises yet"
            message="Add exercises to start logging your workout"
            action={
              <Pressable
                onPress={handleAddExercises}
                className="px-6 py-3 rounded-full"
                style={{ backgroundColor: COLORS.accent.primary }}
              >
                <Text className="text-black font-semibold">Add Exercises</Text>
              </Pressable>
            }
          />
        ) : (
          <DraggableFlatList
            data={orderedExercises}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderExerciseItem}
            onDragEnd={({ data }) => onDragEnd(data)}
            containerStyle={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          />
        )}

        {/* Floating Add Exercise Button */}
        {orderedExercises.length > 0 && (
          <Pressable
            onPress={handleAddExercises}
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: COLORS.accent.primary }}
            accessibilityRole="button"
            accessibilityLabel="Add exercises"
          >
            <Ionicons name="add" size={32} color={COLORS.background.primary} />
          </Pressable>
        )}

        {/* Floating Rest Timer Button */}
        <Pressable
          onPress={() => setRestOpen(true)}
          className="absolute bottom-6 left-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: COLORS.background.secondary }}
          accessibilityRole="button"
          accessibilityLabel="Open rest timer"
        >
          <Ionicons name="timer-outline" size={28} color={COLORS.text.primary} />
        </Pressable>

        {/* Exercise Info Sheet */}
        <ExerciseInfoSheet
          exercise={infoSheetExercise}
          visible={infoSheetExercise !== null}
          onClose={() => setInfoSheetExercise(null)}
        />

        {/* Notes Sheet */}
        <NotesSheet
          visible={notesOpen}
          initialValue={notesDraft}
          onSave={(text) => useWorkoutStore.getState().updateWorkoutNotes(text)}
          onClose={() => setNotesOpen(false)}
        />

        {/* Rest Timer Sheet */}
        <RestTimerSheet visible={restOpen} onClose={() => setRestOpen(false)} />
      </View>
    </SafeAreaView>
  );
}
