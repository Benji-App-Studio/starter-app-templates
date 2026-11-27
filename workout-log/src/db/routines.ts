import { getDatabase } from './index';

export type Routine = {
  id: number;
  name: string;
  /** Unix time in milliseconds. */
  createdAt: number;
};

export type RoutineSummary = Routine & {
  exerciseCount: number;
  setCount: number;
  /** Start of the last finished workout from this routine, or null. */
  lastPerformedAt: number | null;
};

type RoutineRow = {
  id: number;
  name: string;
  created_at: number;
};

type RoutineSummaryRow = RoutineRow & {
  exercise_count: number;
  set_count: number;
  last_performed_at: number | null;
};

function toRoutine(row: RoutineRow): Routine {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

export async function listRoutines(): Promise<RoutineSummary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RoutineSummaryRow>(
    `SELECT r.*,
       (SELECT COUNT(*) FROM routine_exercises re WHERE re.routine_id = r.id) AS exercise_count,
       (SELECT COALESCE(SUM(target_sets), 0) FROM routine_exercises re WHERE re.routine_id = r.id) AS set_count,
       (SELECT MAX(started_at) FROM workouts w WHERE w.routine_id = r.id AND w.finished_at IS NOT NULL) AS last_performed_at
     FROM routines r
     ORDER BY r.created_at ASC`,
  );
  return rows.map((row) => ({
    ...toRoutine(row),
    exerciseCount: row.exercise_count,
    setCount: row.set_count,
    lastPerformedAt: row.last_performed_at,
  }));
}

export async function getRoutine(id: number): Promise<Routine | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RoutineRow>('SELECT * FROM routines WHERE id = ?', id);
  return row ? toRoutine(row) : null;
}

export async function createRoutine(name: string): Promise<Routine> {
  const db = await getDatabase();
  const createdAt = Date.now();
  const result = await db.runAsync('INSERT INTO routines (name, created_at) VALUES (?, ?)', name.trim(), createdAt);
  return { id: result.lastInsertRowId, name: name.trim(), createdAt };
}

export async function renameRoutine(id: number, name: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE routines SET name = ? WHERE id = ?', name.trim(), id);
}

export async function deleteRoutine(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM routines WHERE id = ?', id);
}
