import type { IconName } from '@/components/icons';
import type { HabitInput } from '@/db/habits';

import { EVERY_DAY } from './dates';

/**
 * How the onboarding answers become the first habits.
 * `focus` picks the starter set; `checkin` picks the reminder time.
 */

export type Starter = { name: string; icon: IconName };

const STARTERS: Record<string, Starter[]> = {
  health: [
    { name: 'Drink a glass of water', icon: 'water' },
    { name: 'Walk 20 minutes', icon: 'walk' },
    { name: 'Eat a vegetable', icon: 'meal' },
    { name: 'In bed by 11', icon: 'sleep' },
  ],
  focus: [
    { name: 'Plan the day', icon: 'write' },
    { name: 'One hour of deep work', icon: 'laptop' },
    { name: 'No phone for the first hour', icon: 'phone' },
    { name: 'Clear the desk', icon: 'home' },
  ],
  mind: [
    { name: 'Five quiet minutes', icon: 'leaf' },
    { name: 'Write three lines', icon: 'write' },
    { name: 'Step outside', icon: 'sun' },
    { name: 'No screens in bed', icon: 'moon' },
  ],
  learn: [
    { name: 'Read ten pages', icon: 'read' },
    { name: 'Practice for 15 minutes', icon: 'music' },
    { name: 'Learn five new words', icon: 'language' },
    { name: 'Write down one thing learned', icon: 'brain' },
  ],
};

export const CHECKIN_TIMES: Record<string, { label: string; time: string }> = {
  morning: { label: 'Morning', time: '07:30' },
  midday: { label: 'Midday', time: '12:30' },
  evening: { label: 'Evening', time: '18:30' },
  night: { label: 'Night', time: '21:00' },
};

const DEFAULT_FOCUS = 'health';
const DEFAULT_CHECKIN = 'evening';

export function startersFor(answers: Record<string, string>): Starter[] {
  return STARTERS[answers.focus] ?? STARTERS[DEFAULT_FOCUS];
}

export function checkinFor(answers: Record<string, string>): { id: string; label: string; time: string } {
  const id = answers.checkin in CHECKIN_TIMES ? answers.checkin : DEFAULT_CHECKIN;
  return { id, ...CHECKIN_TIMES[id] };
}

/** The reminder time new habits start with. */
export function defaultReminderTime(answers: Record<string, string>): string {
  return checkinFor(answers).time;
}

export function starterToHabit(starter: Starter, reminderTime: string): HabitInput {
  return { name: starter.name, icon: starter.icon, days: EVERY_DAY, reminderTime };
}
