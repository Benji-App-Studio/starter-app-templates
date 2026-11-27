import type { MuscleGroup } from './exerciseLibrary';
import { getDatabase } from './index';

export type RoutineExercise = {
  id: number;
  routineId: number;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  position: number;
  targetSets: number;
};

export type RoutineExerciseInput = {
  exerciseId: string;
  targetSets: number;
};

type RoutineExerciseRow = {
  id: number;
  routine_id: number;
  exercise_id: string;
  exercise_name: string;
  muscle_group: MuscleGroup;
  position: number;
  target_sets: number;
};

function toRoutineExercise(row: RoutineExerciseRow): RoutineExercise {
  return {
    id: row.id,
    routineId: row.routine_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    muscleGroup: row.muscle_group,
    position: row.position,
    targetSets: row.target_sets,
  };
}

export async function listRoutineExercises(routineId: number): Promise<RoutineExercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RoutineExerciseRow>(
    `SELECT re.*, e.name AS exercise_name, e.muscle_group
     FROM routine_exercises re
     JOIN exercises e ON e.id = re.exercise_id
     WHERE re.routine_id = ?
     ORDER BY re.position`,
    routineId,
  );
  return rows.map(toRoutineExercise);
}

/** The routine editor saves the whole list at once, so replace rather than diff. */
export async function replaceRoutineExercises(routineId: number, items: RoutineExerciseInput[]): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM routine_exercises WHERE routine_id = ?', routineId);
    for (const [position, item] of items.entries()) {
      await txn.runAsync(
        'INSERT INTO routine_exercises (routine_id, exercise_id, position, target_sets) VALUES (?, ?, ?, ?)',
        routineId,
        item.exerciseId,
        position,
        item.targetSets,
      );
    }
  });
}
