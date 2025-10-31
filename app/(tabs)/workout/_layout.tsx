// Workout stack layout inside the Workout tab

import { Stack } from 'expo-router';

export default function WorkoutStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false, title: 'Workout' }} />
            <Stack.Screen name="exercise-picker" options={{ presentation: 'modal', title: 'Add Exercises' }} />
            <Stack.Screen name="logger" options={{ headerShown: false, title: 'Logger' }} />
            <Stack.Screen name="finish" options={{ headerShown: false, title: 'Summary' }} />
        </Stack>
    );
}
