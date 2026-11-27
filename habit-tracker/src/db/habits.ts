import { icons, type IconName } from '@/components/icons';

import { getDatabase } from './index';

export type Habit = {
  id: number;
  name: string;
  icon: IconName;
  /** Weekdays the habit is scheduled on, 0 = Sunday … 6 = Saturday (as `Date.getDay()`). */
  days: number[];
  /** Reminder time as 'HH:MM' (24h), or null when this habit has no reminder. */
  reminderTime: string | null;
  /** Unix time in milliseconds. Days before it do not count against the streak. */
  createdAt: number;
};

export type HabitInput = Omit<Habit, 'id' | 'createdAt'>;

type HabitRow = {
  id: number;
  name: string;
  icon: string;
  days: string;
  reminder_time: string | null;
  created_at: number;
};

const FALLBACK_ICON: IconName = 'target';

/** Rows written by an older version may name an icon that no longer exists. */
function toIconName(value: string): IconName {
  return value in icons ? (value as IconName) : FALLBACK_ICON;
}

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: toIconName(row.icon),
    days: row.days.split(',').map(Number),
    reminderTime: row.reminder_time,
    createdAt: row.created_at,
  };
}

function serializeDays(days: number[]): string {
  return [...new Set(days)].sort((a, b) => a - b).join(',');
}

export async function listHabits(): Promise<Habit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<HabitRow>('SELECT * FROM habits ORDER BY created_at ASC');
  return rows.map(toHabit);
}

export async function getHabit(id: number): Promise<Habit | undefined> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<HabitRow>('SELECT * FROM habits WHERE id = ?', id);
  return row ? toHabit(row) : undefined;
}

export async function createHabit(input: HabitInput): Promise<Habit> {
  const db = await getDatabase();
  const createdAt = Date.now();
  const result = await db.runAsync(
    'INSERT INTO habits (name, icon, days, reminder_time, created_at) VALUES (?, ?, ?, ?, ?)',
    input.name,
    input.icon,
    serializeDays(input.days),
    input.reminderTime,
    createdAt,
  );
  return { id: result.lastInsertRowId, ...input, createdAt };
}

export async function updateHabit(id: number, input: HabitInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE habits SET name = ?, icon = ?, days = ?, reminder_time = ? WHERE id = ?',
    input.name,
    input.icon,
    serializeDays(input.days),
    input.reminderTime,
    id,
  );
}

/** Removes the habit and its check-ins. */
export async function deleteHabit(id: number): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM completions WHERE habit_id = ?', id);
    await txn.runAsync('DELETE FROM habits WHERE id = ?', id);
  });
}

/** Removes every habit and check-in. Used by the Settings reset. */
export async function deleteAllHabits(): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync('DELETE FROM completions');
    await txn.execAsync('DELETE FROM habits');
  });
}
