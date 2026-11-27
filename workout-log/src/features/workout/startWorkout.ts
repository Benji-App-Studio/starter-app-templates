import { listRoutineExercises } from '@/db/routineExercises';
import type { Routine } from '@/db/routines';
import { createWorkout, type Workout } from '@/db/workouts';
import { addWorkoutSet } from '@/db/workoutSets';

/** Creates a workout with one empty set row per target set of the routine (or none, for an empty workout). */
export async function startWorkout(routine: Routine | null): Promise<Workout> {
  const workout = await createWorkout(routine?.name ?? 'Workout', routine?.id ?? null);
  if (routine) {
    const exercises = await listRoutineExercises(routine.id);
    for (const exercise of exercises) {
      for (let setNumber = 1; setNumber <= exercise.targetSets; setNumber += 1) {
        await addWorkoutSet(workout.id, exercise.exerciseId, exercise.position, setNumber);
      }
    }
  }
  return workout;
}
