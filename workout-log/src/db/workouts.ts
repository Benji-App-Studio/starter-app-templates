import { getDatabase } from './index';

export type Workout = {
  id: number;
  routineId: number | null;
  name: string;
  /** Unix time in milliseconds. */
  startedAt: number;
  /** Null while the workout is in progress. */
  finishedAt: number | null;
};

export type WorkoutSummary = Workout & {
  finishedAt: number;
  exerciseCount: number;
  setCount: number;
  volumeKg: number;
  prCount: number;
};

type WorkoutRow = {
  id: number;
  routine_id: number | null;
  name: string;
  started_at: number;
  finished_at: number | null;
};

type WorkoutSummaryRow = WorkoutRow & {
  finished_at: number;
  exercise_count: number;
  set_count: number;
  volume_kg: number;
  pr_count: number;
};

function toWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    routineId: row.routine_id,
    name: row.name,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  };
}

function toSummary(row: WorkoutSummaryRow): WorkoutSummary {
  return {
    ...toWorkout(row),
    finishedAt: row.finished_at,
    exerciseCount: row.exercise_count,
    setCount: row.set_count,
    volumeKg: row.volume_kg,
    prCount: row.pr_count,
  };
}

const SUMMARY_SELECT = `
  SELECT w.*,
    (SELECT COUNT(DISTINCT exercise_id) FROM workout_sets s WHERE s.workout_id = w.id AND s.completed = 1) AS exercise_count,
    (SELECT COUNT(*) FROM workout_sets s WHERE s.workout_id = w.id AND s.completed = 1) AS set_count,
    (SELECT COALESCE(SUM(COALESCE(weight_kg, 0) * COALESCE(reps, 0)), 0) FROM workout_sets s WHERE s.workout_id = w.id AND s.completed = 1) AS volume_kg,
    (SELECT COUNT(*) FROM workout_sets s WHERE s.workout_id = w.id AND s.is_pr = 1) AS pr_count
  FROM workouts w`;

/** The one unfinished workout, if any. Starting a new one while this exists is a choice for the user. */
export async function getActiveWorkout(): Promise<Workout | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WorkoutRow>(
    'SELECT * FROM workouts WHERE finished_at IS NULL ORDER BY started_at DESC LIMIT 1',
  );
  return row ? toWorkout(row) : null;
}

export async function getWorkout(id: number): Promise<Workout | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WorkoutRow>('SELECT * FROM workouts WHERE id = ?', id);
  return row ? toWorkout(row) : null;
}

export async function getWorkoutSummary(id: number): Promise<WorkoutSummary | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WorkoutSummaryRow>(`${SUMMARY_SELECT} WHERE w.id = ? AND w.finished_at IS NOT NULL`, id);
  return row ? toSummary(row) : null;
}

export async function createWorkout(name: string, routineId: number | null, startedAt = Date.now()): Promise<Workout> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO workouts (routine_id, name, started_at) VALUES (?, ?, ?)',
    routineId,
    name,
    startedAt,
  );
  return { id: result.lastInsertRowId, routineId, name, startedAt, finishedAt: null };
}

export async function finishWorkout(id: number, finishedAt = Date.now()): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE workouts SET finished_at = ? WHERE id = ?', finishedAt, id);
}

export async function deleteWorkout(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM workouts WHERE id = ?', id);
}

export async function listFinishedWorkouts(): Promise<WorkoutSummary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WorkoutSummaryRow>(`${SUMMARY_SELECT} WHERE w.finished_at IS NOT NULL ORDER BY w.started_at DESC`);
  return rows.map(toSummary);
}

/** Start times of finished workouts since `since`, for the week ring. */
export async function listWorkoutStartsSince(since: number): Promise<number[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ started_at: number }>(
    'SELECT started_at FROM workouts WHERE finished_at IS NOT NULL AND started_at >= ? ORDER BY started_at',
    since,
  );
  return rows.map((row) => row.started_at);
}

/** Removes every workout and set. Routines and exercises stay. */
export async function deleteAllWorkouts(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM workouts');
}

/** Removes everything the user created: workouts, routines and custom exercises. */
export async function deleteAllData(): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM workouts');
    await txn.runAsync('DELETE FROM routines');
    await txn.runAsync('DELETE FROM exercises WHERE is_custom = 1');
  });
}
