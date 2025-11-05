// NotesSheet - Modal to edit workout notes

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface NotesSheetProps {
    visible: boolean;
    initialValue?: string;
    onSave: (notes: string) => void;
    onClose: () => void;
}

export function NotesSheet({ visible, initialValue, onSave, onClose }: NotesSheetProps) {
    const [text, setText] = useState(initialValue || '');

    useEffect(() => {
        if (visible) {
            setText(initialValue || '');
        }
    }, [visible, initialValue]);

    const handleSave = () => {
        onSave(text.trim());
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }} edges={['bottom']}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b" style={{ borderBottomColor: COLORS.border }}>
                    <Text className="text-2xl font-bold text-white">Workout Notes</Text>
                    <Pressable
                        onPress={onClose}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Close notes"
                    >
                        <Ionicons name="close" size={28} color={COLORS.text.primary} />
                    </Pressable>
                </View>

                {/* Content */}
                <View className="flex-1 px-6 py-6">
                    <Text className="text-gray-400 mb-2">Add any notes for this session</Text>
                    <View className="rounded-2xl p-3" style={{ backgroundColor: COLORS.background.secondary }}>
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            placeholder="Notes (optional)"
                            placeholderTextColor={COLORS.text.tertiary}
                            multiline
                            textAlignVertical="top"
                            style={{ color: COLORS.text.primary, minHeight: 160, fontSize: 16 }}
                        />
                    </View>
                </View>

                {/* Footer */}
                <View className="px-6 py-4 border-t" style={{ borderTopColor: COLORS.border }}>
                    <Pressable
                        onPress={handleSave}
                        className="py-4 rounded-full items-center"
                        style={{ backgroundColor: COLORS.accent.primary }}
                        accessibilityRole="button"
                        accessibilityLabel="Save notes"
                    >
                        <Text className="text-black text-lg font-bold">Save Notes</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </Modal>
    );
}
