// Formatting utilities for display

import { UnitPreference } from '../types';

/**
 * Format weight with unit
 */
export function formatWeight(weight: number, unit: UnitPreference): string {
  return `${weight.toFixed(1)} ${unit}`;
}

/**
 * Format weight without decimal if it's a whole number
 */
export function formatWeightClean(weight: number, unit: UnitPreference): string {
  const formatted = weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1);
  return `${formatted} ${unit}`;
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatTimerDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | number, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  };

  const options = optionsMap[format];

  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format time to readable string
 */
export function formatTime(date: Date | number): string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;

  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | number): string {
  return `${formatDate(date, 'medium')}, ${formatTime(date)}`;
}

/**
 * Format relative time (e.g., "2 days ago", "just now")
 */
export function formatRelativeTime(date: Date | number): string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return formatDate(dateObj, 'short');
}

/**
 * Format volume (weight × reps) to readable string
 */
export function formatVolume(volume: number, unit: UnitPreference): string {
  if (volume < 1000) {
    return `${Math.round(volume)} ${unit}`;
  }

  return `${(volume / 1000).toFixed(1)}k ${unit}`;
}

/**
 * Format number with comma separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format RPE (Rate of Perceived Exertion)
 */
export function formatRPE(rpe: number | null): string {
  if (rpe === null || rpe === undefined) return '-';
  return `RPE ${rpe}`;
}

/**
 * Format set notation (weight × reps)
 */
export function formatSet(weight: number, reps: number, unit: UnitPreference): string {
  const weightStr = weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1);
  return `${weightStr}${unit} × ${reps}`;
}

/**
 * Format workout summary (e.g., "5 exercises, 15 sets")
 */
export function formatWorkoutSummary(
  exerciseCount: number,
  setCount: number,
  volume?: number,
  unit?: UnitPreference
): string {
  const parts: string[] = [];

  if (exerciseCount > 0) {
    parts.push(`${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`);
  }

  if (setCount > 0) {
    parts.push(`${setCount} ${setCount === 1 ? 'set' : 'sets'}`);
  }

  if (volume !== undefined && unit !== undefined && volume > 0) {
    parts.push(formatVolume(volume, unit));
  }

  return parts.join(' • ');
}

/**
 * Format day of week
 */
export function formatDayOfWeek(date: Date | number, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { weekday: 'short' },
    long: { weekday: 'long' },
  };

  const options = optionsMap[format];

  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format week range (e.g., "Jan 1 - Jan 7")
 */
export function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const endDay = endDate.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

/**
 * Format ordinal number (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format muscle group list
 */
export function formatMuscleList(muscles: string[]): string {
  if (muscles.length === 0) return '';
  if (muscles.length === 1) return muscles[0];
  if (muscles.length === 2) return muscles.join(' & ');

  return `${muscles.slice(0, -1).join(', ')} & ${muscles[muscles.length - 1]}`;
}
