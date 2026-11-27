import { getDatabase } from './index';

type DayGoalRow = {
  day: string;
  goal_ml: number;
};

/**
 * Remember which goal applied on a day, so history still shows the right
 * "goal reached" marks after the user changes the goal.
 */
export async function recordDayGoal(day: string, goalMl: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO day_goals (day, goal_ml) VALUES (?, ?)
     ON CONFLICT(day) DO UPDATE SET goal_ml = excluded.goal_ml`,
    day,
    goalMl,
  );
}

/** Goals keyed by day for the inclusive range. Days without a row used the current goal. */
export async function listDayGoals(fromDay: string, toDay: string): Promise<Record<string, number>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DayGoalRow>(
    'SELECT day, goal_ml FROM day_goals WHERE day BETWEEN ? AND ?',
    fromDay,
    toDay,
  );
  return Object.fromEntries(rows.map((row) => [row.day, row.goal_ml]));
}

export async function deleteAllDayGoals(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM day_goals');
}
