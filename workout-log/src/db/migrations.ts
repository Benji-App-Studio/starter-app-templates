import type { SQLiteDatabase } from 'expo-sqlite';

import { exerciseLibrary } from './exerciseLibrary';

const seedExercises = exerciseLibrary
  .map((exercise) => `('${exercise.id}', '${exercise.name}', '${exercise.muscleGroup}', 0)`)
  .join(',\n    ');

/**
 * One entry per schema version, in order. Never edit a shipped migration:
 * append a new one (e.g. `ALTER TABLE workouts ADD COLUMN ...`) instead.
 * Weights are stored in kilograms; the unit setting only changes display and input.
 */
const migrations: string[] = [
  `CREATE TABLE exercises (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    is_custom INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE routines (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE routine_exercises (
    id INTEGER PRIMARY KEY NOT NULL,
    routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES exercises(id),
    position INTEGER NOT NULL,
    target_sets INTEGER NOT NULL
  );
  CREATE TABLE workouts (
    id INTEGER PRIMARY KEY NOT NULL,
    routine_id INTEGER REFERENCES routines(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    finished_at INTEGER
  );
  CREATE TABLE workout_sets (
    id INTEGER PRIMARY KEY NOT NULL,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES exercises(id),
    exercise_position INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight_kg REAL,
    reps INTEGER,
    completed INTEGER NOT NULL DEFAULT 0,
    is_pr INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX workout_sets_by_workout ON workout_sets(workout_id, exercise_position, set_number);
  CREATE INDEX workout_sets_by_exercise ON workout_sets(exercise_id, completed);
  INSERT INTO exercises (id, name, muscle_group, is_custom) VALUES
    ${seedExercises};`,
];

/** Bring the database up to the latest schema version. Safe to run on every launch. */
export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (let version = currentVersion; version < migrations.length; version += 1) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migrations[version]);
      await txn.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
