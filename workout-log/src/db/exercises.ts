import { MUSCLE_GROUPS, type MuscleGroup } from './exerciseLibrary';
import { getDatabase } from './index';

export type { MuscleGroup } from './exerciseLibrary';
export { MUSCLE_GROUPS } from './exerciseLibrary';

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
};

type ExerciseRow = {
  id: string;
  name: string;
  muscle_group: string;
  is_custom: number;
};

function toExercise(row: ExerciseRow): Exercise {
  const muscleGroup = MUSCLE_GROUPS.find((group) => group === row.muscle_group) ?? 'Core';
  return { id: row.id, name: row.name, muscleGroup, isCustom: row.is_custom === 1 };
}

const GROUP_ORDER = `CASE muscle_group ${MUSCLE_GROUPS.map((group, index) => `WHEN '${group}' THEN ${index}`).join(' ')} END`;

export async function listExercises(): Promise<Exercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>(`SELECT * FROM exercises ORDER BY ${GROUP_ORDER}, name`);
  return rows.map(toExercise);
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ExerciseRow>('SELECT * FROM exercises WHERE id = ?', id);
  return row ? toExercise(row) : null;
}

export async function createCustomExercise(name: string, muscleGroup: MuscleGroup): Promise<Exercise> {
  const db = await getDatabase();
  const id = `custom-${Date.now()}`;
  await db.runAsync(
    'INSERT INTO exercises (id, name, muscle_group, is_custom) VALUES (?, ?, ?, 1)',
    id,
    name.trim(),
    muscleGroup,
  );
  return { id, name: name.trim(), muscleGroup, isCustom: true };
}
