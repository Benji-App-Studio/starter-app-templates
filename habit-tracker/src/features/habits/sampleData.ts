import { toggleCompletion } from '@/db/completions';
import { createHabit, deleteAllHabits, type HabitInput } from '@/db/habits';
import { getDatabase } from '@/db/index';

import { addDays, dayKey, EVERY_DAY, WEEKDAYS } from './dates';

const SAMPLE_HABITS: (HabitInput & { ageDays: number; consistency: number })[] = [
  {
    name: 'Drink a glass of water',
    icon: 'water',
    days: EVERY_DAY,
    reminderTime: '07:30',
    ageDays: 120,
    consistency: 0.92,
  },
  { name: 'Walk 20 minutes', icon: 'walk', days: EVERY_DAY, reminderTime: '18:30', ageDays: 95, consistency: 0.78 },
  { name: 'Read ten pages', icon: 'read', days: EVERY_DAY, reminderTime: '21:00', ageDays: 60, consistency: 0.85 },
  { name: 'Plan the day', icon: 'write', days: WEEKDAYS, reminderTime: '08:00', ageDays: 45, consistency: 0.7 },
  { name: 'Five quiet minutes', icon: 'leaf', days: EVERY_DAY, reminderTime: null, ageDays: 20, consistency: 0.95 },
];

/** Deterministic pseudo-random so the sample looks the same on every load. */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Replaces all data with five habits and a few months of check-ins. Development only:
 * used for App Store screenshots and for seeing populated screens without tapping in data.
 */
export async function loadSampleData(): Promise<void> {
  await deleteAllHabits();
  const db = await getDatabase();
  const today = new Date();

  for (const [index, sample] of SAMPLE_HABITS.entries()) {
    const { ageDays, consistency, ...input } = sample;
    const habit = await createHabit(input);
    const createdAt = addDays(today, -ageDays).getTime();
    await db.runAsync('UPDATE habits SET created_at = ? WHERE id = ?', createdAt, habit.id);

    for (let offset = ageDays; offset >= 1; offset -= 1) {
      const date = addDays(today, -offset);
      // Recent days are kept clean so the current streaks read well.
      const recent = offset <= 6;
      if (input.days.includes(date.getDay()) && (recent || noise(index * 1000 + offset) < consistency)) {
        await toggleCompletion(habit.id, dayKey(date));
      }
    }
    // Two habits already done today, so Today shows a day in progress rather than an empty ring.
    if (index < 2 && input.days.includes(today.getDay())) {
      await toggleCompletion(habit.id, dayKey(today));
    }
  }
}
