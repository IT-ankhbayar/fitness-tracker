// Calculation utilities for workout metrics

import { Set } from '../types/database';
import { UNIT_CONVERSION } from './constants';

/**
 * Calculate estimated 1RM using Epley formula
 * Formula: weight × (1 + reps / 30)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps === 0) return 0;

  return weight * (1 + reps / 30);
}

/**
 * Calculate estimated 1RM using Brzycki formula (alternative)
 * Formula: weight × (36 / (37 - reps))
 */
export function calculate1RMBrzycki(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps === 0 || reps > 36) return 0;

  return weight * (36 / (37 - reps));
}

/**
 * Calculate volume for a single set
 * Volume = weight × reps
 */
export function calculateSetVolume(set: Set): number {
  return set.weight * set.reps;
}

/**
 * Calculate total volume for multiple sets
 */
export function calculateTotalVolume(sets: Set[]): number {
  return sets.reduce((total, set) => {
    if (set.is_completed) {
      return total + calculateSetVolume(set);
    }
    return total;
  }, 0);
}

/**
 * Calculate total reps for multiple sets
 */
export function calculateTotalReps(sets: Set[]): number {
  return sets.reduce((total, set) => {
    if (set.is_completed) {
      return total + set.reps;
    }
    return total;
  }, 0);
}

/**
 * Calculate estimated 1RM from the best set in a collection
 */
export function calculateBest1RM(sets: Set[]): number {
  const completedSets = sets.filter((set) => set.is_completed && !set.is_warmup);

  if (completedSets.length === 0) return 0;

  let best1RM = 0;

  for (const set of completedSets) {
    const estimated1RM = calculate1RM(set.weight, set.reps);
    if (estimated1RM > best1RM) {
      best1RM = estimated1RM;
    }
  }

  return best1RM;
}

/**
 * Get the top set (heaviest weight) from a collection
 */
export function getTopSet(sets: Set[]): Set | null {
  const completedSets = sets.filter((set) => set.is_completed && !set.is_warmup);

  if (completedSets.length === 0) return null;

  return completedSets.reduce((topSet, currentSet) => {
    return currentSet.weight > topSet.weight ? currentSet : topSet;
  });
}

/**
 * Convert weight from kg to lb
 */
export function kgToLb(kg: number): number {
  return kg * UNIT_CONVERSION.KG_TO_LB;
}

/**
 * Convert weight from lb to kg
 */
export function lbToKg(lb: number): number {
  return lb * UNIT_CONVERSION.LB_TO_KG;
}

/**
 * Convert weight based on unit preference
 */
export function convertWeight(
  weight: number,
  from: 'kg' | 'lb',
  to: 'kg' | 'lb'
): number {
  if (from === to) return weight;

  return from === 'kg' ? kgToLb(weight) : lbToKg(weight);
}

/**
 * Calculate workout intensity (percentage of 1RM)
 */
export function calculateIntensity(weight: number, estimated1RM: number): number {
  if (estimated1RM === 0) return 0;
  return (weight / estimated1RM) * 100;
}

/**
 * Calculate relative strength (weight lifted / body weight)
 * Useful for bodyweight comparison
 */
export function calculateRelativeStrength(
  weightLifted: number,
  bodyWeight: number
): number {
  if (bodyWeight === 0) return 0;
  return weightLifted / bodyWeight;
}

/**
 * Calculate streak from workout dates
 * Returns number of consecutive days with workouts
 */
export function calculateStreak(workoutDates: Date[]): number {
  if (workoutDates.length === 0) return 0;

  // Sort dates in descending order (most recent first)
  const sortedDates = workoutDates
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentWorkout = new Date(sortedDates[0]);
  mostRecentWorkout.setHours(0, 0, 0, 0);

  // Check if most recent workout was today or yesterday
  const daysSinceLastWorkout = Math.floor(
    (today.getTime() - mostRecentWorkout.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastWorkout > 1) {
    return 0; // Streak broken
  }

  let streak = 1;
  let currentDate = new Date(mostRecentWorkout);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      // Consecutive day
      streak++;
      currentDate = prevDate;
    } else if (dayDiff === 0) {
      // Same day, continue
      continue;
    } else {
      // Gap in streak
      break;
    }
  }

  return streak;
}

/**
 * Calculate weekly consistency (percentage of target met)
 */
export function calculateWeeklyConsistency(
  workoutsThisWeek: number,
  weeklyTarget: number
): number {
  if (weeklyTarget === 0) return 0;
  return Math.min((workoutsThisWeek / weeklyTarget) * 100, 100);
}

/**
 * Calculate time between sets (rest period)
 */
export function calculateRestPeriod(
  previousSetTime: number,
  currentSetTime: number
): number {
  return Math.floor((currentSetTime - previousSetTime) / 1000); // seconds
}

/**
 * Calculate workout duration in minutes
 */
export function calculateWorkoutDuration(startTime: number, endTime: number): number {
  return Math.floor((endTime - startTime) / (1000 * 60)); // minutes
}

/**
 * Estimate calories burned (rough approximation)
 * Based on volume and duration
 */
export function estimateCaloriesBurned(
  totalVolume: number,
  durationMinutes: number,
  bodyWeight: number = 70 // kg
): number {
  // Very rough estimate: ~5 calories per minute + volume factor
  const baseCalories = durationMinutes * 5;
  const volumeCalories = (totalVolume / 1000) * 0.5; // Small bonus for volume

  return Math.round(baseCalories + volumeCalories);
}

/**
 * Calculate training volume load (sets × reps × weight)
 * Useful for tracking training load over time
 */
export function calculateVolumeLoad(sets: Set[]): number {
  return calculateTotalVolume(sets);
}

/**
 * Calculate average RPE from sets
 */
export function calculateAverageRPE(sets: Set[]): number {
  const setsWithRPE = sets.filter((set) => set.rpe !== null && set.rpe !== undefined);

  if (setsWithRPE.length === 0) return 0;

  const totalRPE = setsWithRPE.reduce((sum, set) => sum + (set.rpe || 0), 0);
  return totalRPE / setsWithRPE.length;
}

/**
 * Determine if a new PR has been achieved
 */
export function isNewPR(
  currentValue: number,
  previousBest: number | null,
  type: '1RM' | 'volume' | 'reps' | 'weight'
): boolean {
  if (previousBest === null) return true;
  return currentValue > previousBest;
}

/**
 * Calculate percent change between two values
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Round weight to nearest plate (for barbell exercises)
 * Common plates: 2.5, 5, 10, 20, 25 kg
 */
export function roundToNearestPlate(weight: number, unit: 'kg' | 'lb' = 'kg'): number {
  const plateIncrements = unit === 'kg' ? [2.5, 5, 10, 20, 25] : [5, 10, 25, 45];
  const smallestIncrement = unit === 'kg' ? 2.5 : 5;

  return Math.round(weight / smallestIncrement) * smallestIncrement;
}
