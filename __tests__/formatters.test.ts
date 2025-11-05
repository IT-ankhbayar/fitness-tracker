import { formatWeight, formatWeightClean, formatDuration, formatTimerDuration, formatVolume, formatPercentage, formatWorkoutSummary, formatRelativeTime } from '../utils/formatters';

describe('utils/formatters', () => {
  test('formatWeight and formatWeightClean', () => {
    expect(formatWeight(100, 'kg')).toBe('100.0 kg');
    expect(formatWeightClean(100, 'kg')).toBe('100 kg');
    expect(formatWeightClean(100.5, 'lb')).toBe('100.5 lb');
  });

  test('formatDuration renders h/m variants', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(75)).toBe('1h 15m');
  });

  test('formatTimerDuration pads mm:ss', () => {
    expect(formatTimerDuration(0)).toBe('00:00');
    expect(formatTimerDuration(59)).toBe('00:59');
    expect(formatTimerDuration(60)).toBe('01:00');
    expect(formatTimerDuration(125)).toBe('02:05');
  });

  test('formatVolume uses k suffix >= 1000', () => {
    expect(formatVolume(999, 'kg')).toBe('999 kg');
    expect(formatVolume(1000, 'kg')).toBe('1.0k kg');
    expect(formatVolume(1500, 'lb')).toBe('1.5k lb');
  });

  test('formatPercentage rounds to decimals', () => {
    expect(formatPercentage(33.333, 0)).toBe('33%');
    expect(formatPercentage(33.333, 2)).toBe('33.33%');
  });

  test('formatWorkoutSummary composes parts', () => {
    expect(formatWorkoutSummary(0, 0)).toBe('');
    expect(formatWorkoutSummary(1, 0)).toBe('1 exercise');
    expect(formatWorkoutSummary(2, 1)).toBe('2 exercises • 1 set');
    expect(formatWorkoutSummary(2, 4, 1200, 'kg')).toBe('2 exercises • 4 sets • 1.2k kg');
  });

  test('formatRelativeTime buckets correctly', () => {
    const now = new Date();
    const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
    const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    expect(formatRelativeTime(now)).toBe('just now');
    expect(formatRelativeTime(minutesAgo(10))).toBe('10m ago');
    expect(formatRelativeTime(hoursAgo(2))).toBe('2h ago');
    expect(formatRelativeTime(daysAgo(1))).toBe('yesterday');

    const threeDays = formatRelativeTime(daysAgo(3));
    expect(['3d ago', '2d ago', '4d ago']).toContain(threeDays); // time rounding tolerance
  });
});
