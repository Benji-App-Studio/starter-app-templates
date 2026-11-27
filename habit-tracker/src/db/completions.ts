import { getDatabase } from './index';

/** One check-in: a habit marked done on a calendar day. */
export type Completion = {
  id: number;
  habitId: number;
  /** Local calendar day as 'YYYY-MM-DD'. */
  day: string;
  createdAt: number;
};

type CompletionRow = {
  id: number;
  habit_id: number;
  day: string;
  created_at: number;
};

function toCompletion(row: CompletionRow): Completion {
  return { id: row.id, habitId: row.habit_id, day: row.day, createdAt: row.created_at };
}

export async function listCompletions(): Promise<Completion[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CompletionRow>('SELECT * FROM completions ORDER BY day ASC');
  return rows.map(toCompletion);
}

/** Marks the habit done on that day, or undoes it when it already is. Resolves to the new state. */
export async function toggleCompletion(habitId: number, day: string): Promise<boolean> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM completions WHERE habit_id = ? AND day = ?',
    habitId,
    day,
  );
  if (existing) {
    await db.runAsync('DELETE FROM completions WHERE id = ?', existing.id);
    return false;
  }
  await db.runAsync(
    'INSERT INTO completions (habit_id, day, created_at) VALUES (?, ?, ?)',
    habitId,
    day,
    Date.now(),
  );
  return true;
}
