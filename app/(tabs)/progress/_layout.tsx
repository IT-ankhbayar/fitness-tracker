// Progress stack layout

import { Stack } from 'expo-router';

export default function ProgressStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}
