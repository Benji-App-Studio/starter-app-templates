import { getDatabase } from './index';

/** One logged drink. `day` is the local calendar day as `YYYY-MM-DD`. */
export type Drink = {
  id: number;
  day: string;
  amountMl: number;
  /** Unix time in milliseconds. */
  loggedAt: number;
};

type DrinkRow = {
  id: number;
  day: string;
  amount_ml: number;
  logged_at: number;
};

/** A day's total, for history and streaks. */
export type DayTotal = {
  day: string;
  totalMl: number;
};

type DayTotalRow = {
  day: string;
  total_ml: number;
};

function toDrink(row: DrinkRow): Drink {
  return { id: row.id, day: row.day, amountMl: row.amount_ml, loggedAt: row.logged_at };
}

export async function listDrinks(day: string): Promise<Drink[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DrinkRow>(
    'SELECT * FROM drinks WHERE day = ? ORDER BY logged_at DESC',
    day,
  );
  return rows.map(toDrink);
}

export async function createDrink(day: string, amountMl: number, loggedAt = Date.now()): Promise<Drink> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO drinks (day, amount_ml, logged_at) VALUES (?, ?, ?)',
    day,
    amountMl,
    loggedAt,
  );
  return { id: result.lastInsertRowId, day, amountMl, loggedAt };
}

export async function deleteDrink(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM drinks WHERE id = ?', id);
}

/** Totals per day in the inclusive range, only for days with at least one drink. */
export async function listDayTotals(fromDay: string, toDay: string): Promise<DayTotal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DayTotalRow>(
    `SELECT day, SUM(amount_ml) AS total_ml FROM drinks
     WHERE day BETWEEN ? AND ? GROUP BY day ORDER BY day DESC`,
    fromDay,
    toDay,
  );
  return rows.map((row) => ({ day: row.day, totalMl: row.total_ml }));
}

export async function deleteAllDrinks(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM drinks');
}
