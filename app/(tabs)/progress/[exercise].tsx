// Exercise progress detail screen

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../utils/constants';
import { exerciseService } from '../../../services/exerciseService';
import { prService } from '../../../services/prService';
import { workoutService } from '../../../services/workoutService';
import { Exercise, PersonalRecord } from '../../../types/database';
import { formatRelativeTime } from '../../../utils/formatters';
import { calculate1RM } from '../../../utils/calculations';
import { useSettingsStore } from '../../../store/settingsStore';

export default function ExerciseProgressScreen() {
    const { exercise } = useLocalSearchParams<{ exercise: string }>();
    const exerciseId = Number(exercise);

    const [loading, setLoading] = useState(true);
    const [ex, setEx] = useState<Exercise | null>(null);
    const [stats, setStats] = useState<{
        totalWorkouts: number;
        totalSets: number;
        totalVolume: number;
    } | null>(null);
    const [prs, setPrs] = useState<PersonalRecord[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<'1RM' | 'TopSet' | 'Volume' | 'Frequency'>('1RM');
    const [sessionMetrics, setSessionMetrics] = useState<Array<{
        workout_id: number;
        started_at: number;
        best1RM: number;
        topSet: number;
        volume: number;
        setCount: number;
    }>>([]);
    const unit = useSettingsStore((s) => s.unitPreference);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const exerciseData = await exerciseService.getById(exerciseId);
                if (!active) return;
                setEx(exerciseData);

                const statData = await exerciseService.getWithStats(exerciseId);
                if (!active) return;
                setStats(statData ? {
                    totalWorkouts: statData.totalWorkouts,
                    totalSets: statData.totalSets,
                    totalVolume: statData.totalVolume,
                } : { totalWorkouts: 0, totalSets: 0, totalVolume: 0 });

                const recentPrs = await prService.getByExercise(exerciseId);
                if (!active) return;
                setPrs(recentPrs);

                // Load sets grouped by workout to compute per-session metrics
                const rows = await workoutService.getExerciseSetsWithWorkouts(exerciseId);
                if (!active) return;
                const byWorkout = new Map<number, { started_at: number; sets: Array<{ reps: number; weight: number; is_warmup: number; is_completed: number }> }>();
                for (const r of rows) {
                    if (!byWorkout.has(r.workout_id)) {
                        byWorkout.set(r.workout_id, { started_at: r.started_at, sets: [] });
                    }
                    byWorkout.get(r.workout_id)!.sets.push({ reps: r.reps, weight: r.weight, is_warmup: r.is_warmup, is_completed: r.is_completed });
                }
                const metrics: Array<{ workout_id: number; started_at: number; best1RM: number; topSet: number; volume: number; setCount: number }> = [];
                for (const [workout_id, { started_at, sets }] of byWorkout) {
                    const comp = sets.filter((s) => s.is_completed === 1 && s.is_warmup === 0);
                    let best1RM = 0;
                    let topSet = 0;
                    let volume = 0;
                    for (const s of comp) {
                        const est = calculate1RM(s.weight, s.reps);
                        if (est > best1RM) best1RM = est;
                        if (s.weight > topSet) topSet = s.weight;
                        volume += s.weight * s.reps;
                    }
                    metrics.push({ workout_id, started_at, best1RM, topSet, volume, setCount: comp.length });
                }
                // sort by date ascending for chart
                metrics.sort((a, b) => a.started_at - b.started_at);
                setSessionMetrics(metrics);
            } catch (e) {
                console.error('Failed to load exercise progress', e);
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, [exerciseId]);

    const chartSeries = useMemo(() => {
        if (selectedMetric === 'Frequency') {
            // weekly frequency for last 8 weeks
            if (sessionMetrics.length === 0) return [] as Array<{ label: string; value: number }>;
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            // get Monday of current week
            const day = now.getDay();
            const diffToMonday = (day + 6) % 7;
            const thisWeekStart = new Date(now);
            thisWeekStart.setDate(now.getDate() - diffToMonday);
            const buckets: Array<{ start: number; label: string; value: number }> = [];
            for (let i = 7; i >= 0; i--) {
                const start = new Date(thisWeekStart.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
                const label = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const value = sessionMetrics.filter(s => s.started_at >= start.getTime() && s.started_at < end.getTime()).length;
                buckets.push({ start: start.getTime(), label, value });
            }
            return buckets.map(b => ({ label: b.label, value: b.value }));
        }
        const mapMetric = (m: typeof selectedMetric) => (s: typeof sessionMetrics[number]) => (
            m === '1RM' ? s.best1RM : m === 'TopSet' ? s.topSet : s.volume
        );
        return sessionMetrics.map(s => ({ label: new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: mapMetric(selectedMetric)(s) }));
    }, [sessionMetrics, selectedMetric]);

    const maxValue = useMemo(() => chartSeries.reduce((m, p) => Math.max(m, p.value), 0), [chartSeries]);

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={COLORS.accent.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
            <View className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                <Pressable onPress={() => router.back()} className="p-2 mr-2">
                    <Ionicons name="arrow-back" size={22} color={COLORS.text.secondary} />
                </Pressable>
                <Text className="text-2xl font-bold text-white" numberOfLines={1}>{ex?.name || 'Exercise'}</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                {/* Stats */}
                <View className="flex-row mb-6">
                    <View className="flex-1 items-center p-4 rounded-2xl mr-2" style={{ backgroundColor: COLORS.background.secondary }}>
                        <Text className="text-3xl font-bold" style={{ color: COLORS.accent.primary }}>{stats?.totalWorkouts || 0}</Text>
                        <Text className="text-gray-400 text-xs mt-1">Workouts</Text>
                    </View>
                    <View className="flex-1 items-center p-4 rounded-2xl ml-2" style={{ backgroundColor: COLORS.background.secondary }}>
                        <Text className="text-3xl font-bold" style={{ color: COLORS.accent.primary }}>{stats?.totalSets || 0}</Text>
                        <Text className="text-gray-400 text-xs mt-1">Sets</Text>
                    </View>
                </View>
                <View className="items-center p-6 rounded-2xl mb-6" style={{ backgroundColor: COLORS.background.secondary }}>
                    <Text className="text-white font-semibold">Total Volume</Text>
                    <Text className="text-4xl font-bold mt-2" style={{ color: COLORS.accent.secondary }}>{Math.round(stats?.totalVolume || 0)}</Text>
                </View>

                {/* Metric Switcher */}
                <View className="flex-row mb-4">
                    {(['1RM', 'TopSet', 'Volume', 'Frequency'] as const).map((m) => {
                        const active = selectedMetric === m;
                        return (
                            <Pressable key={m} onPress={() => setSelectedMetric(m)} className={`px-3 py-2 mr-2 rounded-full ${active ? '' : ''}`} style={{ backgroundColor: active ? COLORS.accent.primary : COLORS.background.secondary }}>
                                <Text className={active ? 'text-black font-semibold' : 'text-white'}>{m}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Trend chart (lightweight bars) */}
                <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: COLORS.background.secondary }}>
                    {chartSeries.length === 0 || maxValue === 0 ? (
                        <View className="py-8"><Text className="text-gray-400 text-center">No data yet</Text></View>
                    ) : (
                        <View>
                            <View className="flex-row items-end justify-between" style={{ height: 120 }}>
                                {chartSeries.map((p, idx) => {
                                    const h = Math.max(4, Math.round((p.value / maxValue) * 110));
                                    return (
                                        <View key={`${p.label}-${idx}`} className="items-center" style={{ width: 20 }}>
                                            <View style={{ height: h, backgroundColor: COLORS.accent.primary, width: 12, borderRadius: 6 }} />
                                        </View>
                                    );
                                })}
                            </View>
                            <View className="flex-row justify-between mt-3">
                                {chartSeries.map((p, idx) => (
                                    <Text key={`${p.label}-${idx}`} className="text-xs" style={{ color: COLORS.text.tertiary }}>{p.label}</Text>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Session list filtered to this exercise */}
                <Text className="text-xl font-semibold text-white mb-3">Sessions</Text>
                <View className="rounded-2xl mb-6" style={{ backgroundColor: COLORS.background.secondary }}>
                    {sessionMetrics.length === 0 ? (
                        <View className="p-6"><Text className="text-gray-400 text-center">No sessions yet</Text></View>
                    ) : (
                        sessionMetrics
                            .slice()
                            .sort((a, b) => b.started_at - a.started_at)
                            .map((s) => {
                                const value = selectedMetric === '1RM' ? `${s.best1RM.toFixed(1)} ${unit}` : selectedMetric === 'TopSet' ? `${s.topSet.toFixed(1)} ${unit}` : selectedMetric === 'Volume' ? `${Math.round(s.volume)}` : `${s.setCount} sets`;
                                return (
                                    <Pressable key={s.workout_id} className="px-6 py-4 border-b" style={{ borderBottomColor: COLORS.border }} onPress={() => router.push(`/history/${s.workout_id}` as any)}>
                                        <View className="flex-row items-center justify-between">
                                            <View>
                                                <Text className="text-white font-semibold">{new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                                <Text className="text-gray-400 text-sm mt-1">{s.setCount} sets</Text>
                                            </View>
                                            <Text className="text-white font-semibold">{value}</Text>
                                        </View>
                                    </Pressable>
                                );
                            })
                    )}
                </View>

                {/* PRs */}
                <Text className="text-xl font-semibold text-white mb-3">Personal Records</Text>
                <View className="rounded-2xl" style={{ backgroundColor: COLORS.background.secondary }}>
                    {prs.length === 0 ? (
                        <View className="p-6"><Text className="text-gray-400 text-center">No PRs yet</Text></View>
                    ) : (
                        prs.map((pr) => (
                            <View key={pr.id} className="px-6 py-4 border-b" style={{ borderBottomColor: COLORS.border }}>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-white font-semibold">{pr.type}</Text>
                                    <View className="items-end">
                                        <Text className="text-white font-semibold">{pr.value.toFixed(1)}</Text>
                                        <Text className="text-gray-500 text-xs mt-1">{formatRelativeTime(pr.achieved_at)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
