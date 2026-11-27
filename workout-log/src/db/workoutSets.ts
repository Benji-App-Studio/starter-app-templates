import type { MuscleGroup } from './exerciseLibrary';
import { getDatabase } from './index';

export type WorkoutSet = {
  id: number;
  workoutId: number;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  /** Order of the exercise within the workout. */
  exercisePosition: number;
  /** 1-based order within the exercise. */
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
  isPr: boolean;
};

export type SetValues = { weightKg: number | null; reps: number | null };

export type ExerciseRecord = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  bestWeightKg: number;
  bestWeightReps: number;
  bestWeightAt: number;
  /** Epley estimate from the best completed set. */
  bestOneRepMaxKg: number;
  sessions: number;
};

export type ExerciseSession = {
  workoutId: number;
  workoutName: string;
  startedAt: number;
  sets: { setNumber: number; weightKg: number | null; reps: number | null; isPr: boolean }[];
};

type WorkoutSetRow = {
  id: number;
  workout_id: number;
  exercise_id: string;
  exercise_name: string;
  muscle_group: MuscleGroup;
  exercise_position: number;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  completed: number;
  is_pr: number;
};

const SET_SELECT = `
  SELECT s.*, e.name AS exercise_name, e.muscle_group
  FROM workout_sets s
  JOIN exercises e ON e.id = s.exercise_id`;

function toWorkoutSet(row: WorkoutSetRow): WorkoutSet {
  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    muscleGroup: row.muscle_group,
    exercisePosition: row.exercise_position,
    setNumber: row.set_number,
    weightKg: row.weight_kg,
    reps: row.reps,
    completed: row.completed === 1,
    isPr: row.is_pr === 1,
  };
}

export async function listWorkoutSets(workoutId: number): Promise<WorkoutSet[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<WorkoutSetRow>(
    `${SET_SELECT} WHERE s.workout_id = ? ORDER BY s.exercise_position, s.set_number`,
    workoutId,
  );
  return rows.map(toWorkoutSet);
}

export async function addWorkoutSet(
  workoutId: number,
  exerciseId: string,
  exercisePosition: number,
  setNumber: number,
  values: SetValues = { weightKg: null, reps: null },
): Promise<WorkoutSet> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO workout_sets (workout_id, exercise_id, exercise_position, set_number, weight_kg, reps)
     VALUES (?, ?, ?, ?, ?, ?)`,
    workoutId,
    exerciseId,
    exercisePosition,
    setNumber,
    values.weightKg,
    values.reps,
  );
  const row = await db.getFirstAsync<WorkoutSetRow>(`${SET_SELECT} WHERE s.id = ?`, result.lastInsertRowId);
  if (!row) {
    throw new Error('Set was not saved');
  }
  return toWorkoutSet(row);
}

export async function updateWorkoutSet(id: number, patch: Partial<SetValues> & { completed?: boolean }): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const params: (number | null)[] = [];
  if (patch.weightKg !== undefined) {
    assignments.push('weight_kg = ?');
    params.push(patch.weightKg);
  }
  if (patch.reps !== undefined) {
    assignments.push('reps = ?');
    params.push(patch.reps);
  }
  if (patch.completed !== undefined) {
    assignments.push('completed = ?');
    params.push(patch.completed ? 1 : 0);
  }
  if (assignments.length === 0) {
    return;
  }
  await db.runAsync(`UPDATE workout_sets SET ${assignments.join(', ')} WHERE id = ?`, ...params, id);
}

export async function deleteWorkoutSet(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM workout_sets WHERE id = ?', id);
}

export async function removeExerciseFromWorkout(workoutId: number, exercisePosition: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM workout_sets WHERE workout_id = ? AND exercise_position = ?',
    workoutId,
    exercisePosition,
  );
}

/** Drops the rows the user never checked off, so history only holds real sets. */
export async function deleteIncompleteSets(workoutId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM workout_sets WHERE workout_id = ? AND completed = 0', workoutId);
}

/** The completed sets of this exercise from the most recent finished workout, for the "previous" column. */
export async function listPreviousSets(exerciseId: string, excludingWorkoutId: number): Promise<SetValues[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ weight_kg: number | null; reps: number | null }>(
    `SELECT s.weight_kg, s.reps
     FROM workout_sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND s.completed = 1 AND w.finished_at IS NOT NULL AND w.id != ?
       AND w.id = (
         SELECT w2.id FROM workouts w2
         JOIN workout_sets s2 ON s2.workout_id = w2.id
         WHERE s2.exercise_id = ? AND s2.completed = 1 AND w2.finished_at IS NOT NULL AND w2.id != ?
         ORDER BY w2.started_at DESC LIMIT 1
       )
     ORDER BY s.set_number`,
    exerciseId,
    excludingWorkoutId,
    exerciseId,
    excludingWorkoutId,
  );
  return rows.map((row) => ({ weightKg: row.weight_kg, reps: row.reps }));
}

/** Heaviest completed weight for each exercise across finished workouts other than `excludingWorkoutId`. */
export async function getBestWeights(excludingWorkoutId: number): Promise<Record<string, number>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ exercise_id: string; best: number }>(
    `SELECT s.exercise_id, MAX(s.weight_kg) AS best
     FROM workout_sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.completed = 1 AND s.weight_kg IS NOT NULL AND w.finished_at IS NOT NULL AND w.id != ?
     GROUP BY s.exercise_id`,
    excludingWorkoutId,
  );
  return Object.fromEntries(rows.map((row) => [row.exercise_id, row.best]));
}

export type RecordCandidate = Pick<WorkoutSet, 'id' | 'exerciseId' | 'weightKg' | 'reps' | 'completed'>;

/**
 * The personal-record rule, shared by the live set table and the saved workout: the heaviest
 * completed set of an exercise in this workout is a record when it beats that exercise's best from
 * earlier finished workouts. With no earlier best there is nothing to beat, so the first time an
 * exercise is logged it only sets the baseline. Returns the ids of the record sets.
 */
export function findPersonalRecords(sets: RecordCandidate[], previousBest: Record<string, number>): Set<number> {
  const counted: { id: number; exerciseId: string; weightKg: number }[] = [];
  for (const set of sets) {
    if (set.completed && set.weightKg !== null && (set.reps ?? 0) > 0) {
      counted.push({ id: set.id, exerciseId: set.exerciseId, weightKg: set.weightKg });
    }
  }
  const topInWorkout = new Map<string, number>();
  for (const set of counted) {
    topInWorkout.set(set.exerciseId, Math.max(topInWorkout.get(set.exerciseId) ?? 0, set.weightKg));
  }
  const records = new Set<number>();
  for (const set of counted) {
    const best = previousBest[set.exerciseId];
    if (best !== undefined && set.weightKg === topInWorkout.get(set.exerciseId) && set.weightKg > best) {
      records.add(set.id);
    }
  }
  return records;
}

/** Saves the `findPersonalRecords` result on this workout's sets. Returns how many are records. */
export async function markPersonalRecords(workoutId: number): Promise<number> {
  const db = await getDatabase();
  const [sets, best] = await Promise.all([listWorkoutSets(workoutId), getBestWeights(workoutId)]);
  const prIds = [...findPersonalRecords(sets, best)];
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('UPDATE workout_sets SET is_pr = 0 WHERE workout_id = ?', workoutId);
    for (const id of prIds) {
      await txn.runAsync('UPDATE workout_sets SET is_pr = 1 WHERE id = ?', id);
    }
  });
  return prIds.length;
}

/** One record per exercise that has at least one completed weighted set. */
export async function listRecords(): Promise<ExerciseRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    exercise_id: string;
    exercise_name: string;
    muscle_group: MuscleGroup;
    best_weight_kg: number;
    best_weight_reps: number;
    best_weight_at: number;
    best_one_rep_max_kg: number;
    sessions: number;
  }>(
    `SELECT e.id AS exercise_id, e.name AS exercise_name, e.muscle_group,
       b.weight_kg AS best_weight_kg, b.reps AS best_weight_reps, b.started_at AS best_weight_at,
       (SELECT MAX(s.weight_kg * (1 + s.reps / 30.0)) FROM workout_sets s
          JOIN workouts w ON w.id = s.workout_id
          WHERE s.exercise_id = e.id AND s.completed = 1 AND w.finished_at IS NOT NULL) AS best_one_rep_max_kg,
       (SELECT COUNT(DISTINCT s.workout_id) FROM workout_sets s
          JOIN workouts w ON w.id = s.workout_id
          WHERE s.exercise_id = e.id AND s.completed = 1 AND w.finished_at IS NOT NULL) AS sessions
     FROM exercises e
     JOIN (
       SELECT s.exercise_id, s.weight_kg, s.reps, w.started_at,
         ROW_NUMBER() OVER (PARTITION BY s.exercise_id ORDER BY s.weight_kg DESC, s.reps DESC, w.started_at DESC) AS rank
       FROM workout_sets s
       JOIN workouts w ON w.id = s.workout_id
       WHERE s.completed = 1 AND s.weight_kg IS NOT NULL AND s.reps > 0 AND w.finished_at IS NOT NULL
     ) b ON b.exercise_id = e.id AND b.rank = 1
     ORDER BY b.started_at DESC`,
  );
  return rows.map((row) => ({
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    muscleGroup: row.muscle_group,
    bestWeightKg: row.best_weight_kg,
    bestWeightReps: row.best_weight_reps,
    bestWeightAt: row.best_weight_at,
    bestOneRepMaxKg: row.best_one_rep_max_kg,
    sessions: row.sessions,
  }));
}

/** Every finished session of one exercise, newest first, with its completed sets. */
export async function listExerciseSessions(exerciseId: string): Promise<ExerciseSession[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    workout_id: number;
    workout_name: string;
    started_at: number;
    set_number: number;
    weight_kg: number | null;
    reps: number | null;
    is_pr: number;
  }>(
    `SELECT s.workout_id, w.name AS workout_name, w.started_at, s.set_number, s.weight_kg, s.reps, s.is_pr
     FROM workout_sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND s.completed = 1 AND w.finished_at IS NOT NULL
     ORDER BY w.started_at DESC, s.set_number`,
    exerciseId,
  );
  const sessions: ExerciseSession[] = [];
  for (const row of rows) {
    let session = sessions[sessions.length - 1];
    if (!session || session.workoutId !== row.workout_id) {
      session = { workoutId: row.workout_id, workoutName: row.workout_name, startedAt: row.started_at, sets: [] };
      sessions.push(session);
    }
    session.sets.push({ setNumber: row.set_number, weightKg: row.weight_kg, reps: row.reps, isPr: row.is_pr === 1 });
  }
  return sessions;
}
