import { getDatabase } from './index';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** One logged food. Calories and macros are totals for the servings logged. */
export type FoodLog = {
  id: number;
  /** Local calendar day, `YYYY-MM-DD`. */
  day: string;
  meal: Meal;
  name: string;
  servings: number;
  calories: number;
  /** Grams. */
  protein: number;
  carbs: number;
  fat: number;
  /** Unix time in milliseconds. */
  createdAt: number;
};

export type NewFoodLog = Omit<FoodLog, 'id' | 'createdAt'>;

export type DayTotal = {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: number;
};

type FoodLogRow = {
  id: number;
  day: string;
  meal: Meal;
  name: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: number;
};

function toFoodLog(row: FoodLogRow): FoodLog {
  return {
    id: row.id,
    day: row.day,
    meal: row.meal,
    name: row.name,
    servings: row.servings,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    createdAt: row.created_at,
  };
}

export async function listFoodLogs(day: string): Promise<FoodLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<FoodLogRow>(
    'SELECT * FROM food_logs WHERE day = ? ORDER BY created_at ASC',
    day,
  );
  return rows.map(toFoodLog);
}

/** Totals per day, newest first, for days on or after `sinceDay`. Days without logs are absent. */
export async function listDayTotals(sinceDay: string): Promise<DayTotal[]> {
  const db = await getDatabase();
  return db.getAllAsync<DayTotal>(
    `SELECT day,
            SUM(calories) AS calories,
            SUM(protein) AS protein,
            SUM(carbs) AS carbs,
            SUM(fat) AS fat,
            COUNT(*) AS entries
     FROM food_logs
     WHERE day >= ?
     GROUP BY day
     ORDER BY day DESC`,
    sinceDay,
  );
}

export async function createFoodLog(input: NewFoodLog): Promise<FoodLog> {
  const db = await getDatabase();
  const createdAt = Date.now();
  const result = await db.runAsync(
    `INSERT INTO food_logs (day, meal, name, servings, calories, protein, carbs, fat, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.day,
    input.meal,
    input.name,
    input.servings,
    input.calories,
    input.protein,
    input.carbs,
    input.fat,
    createdAt,
  );
  return { ...input, id: result.lastInsertRowId, createdAt };
}

export async function deleteFoodLog(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM food_logs WHERE id = ?', id);
}

export async function deleteAllFoodLogs(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM food_logs');
}
