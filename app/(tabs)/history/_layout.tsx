// History stack layout

import { Stack } from 'expo-router';

export default function HistoryStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}
