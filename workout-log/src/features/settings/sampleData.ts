import { listRoutineExercises } from '@/db/routineExercises';
import { listRoutines } from '@/db/routines';
import { createWorkout, finishWorkout } from '@/db/workouts';
import { addWorkoutSet, markPersonalRecords, updateWorkoutSet } from '@/db/workoutSets';
import { seedStarterRoutines } from '@/features/routines/starterRoutines';
import { startOfDay } from '@/features/workout/format';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 5;
/** Monday, Wednesday, Friday. */
const TRAIN_DAYS = [0, 2, 4];
const BODYWEIGHT = new Set(['pull-up', 'push-up', 'dip', 'plank', 'hanging-knee-raise', 'ab-wheel', 'russian-twist']);

/** A plausible working weight in kg for the first week, by exercise. */
function baseWeight(exerciseId: string): number {
  const table: Record<string, number> = {
    squat: 80,
    'front-squat': 60,
    deadlift: 100,
    'romanian-deadlift': 70,
    'bench-press': 60,
    'incline-bench-press': 50,
    'incline-dumbbell-press': 22.5,
    'dumbbell-press': 25,
    'overhead-press': 40,
    'dumbbell-shoulder-press': 17.5,
    'barbell-row': 60,
    'lat-pulldown': 55,
    'seated-cable-row': 55,
    'leg-press': 140,
    'hip-thrust': 90,
    'leg-curl': 40,
    'calf-raise': 80,
    'bulgarian-split-squat': 16,
  };
  return table[exerciseId] ?? 20;
}

/**
 * Development only: five weeks of finished workouts over the starter routines, with
 * weights creeping up so history, the chart and the records screen have something to show.
 */
export async function loadSampleData(): Promise<void> {
  await seedStarterRoutines();
  const routines = await listRoutines();
  if (routines.length === 0) {
    return;
  }
  const today = startOfDay(Date.now());
  const monday = today - ((new Date(today).getDay() + 6) % 7) * DAY_MS;
  let routineIndex = 0;

  for (let week = WEEKS - 1; week >= 0; week -= 1) {
    for (const dayOffset of TRAIN_DAYS) {
      const start = monday - week * 7 * DAY_MS + dayOffset * DAY_MS + 18 * 60 * 60 * 1000;
      if (start > Date.now()) {
        continue;
      }
      const routine = routines[routineIndex % routines.length];
      routineIndex += 1;
      const workout = await createWorkout(routine.name, routine.id, start);
      const exercises = await listRoutineExercises(routine.id);
      const progress = WEEKS - 1 - week;
      for (const exercise of exercises) {
        const weightless = BODYWEIGHT.has(exercise.exerciseId);
        const weight = weightless ? null : baseWeight(exercise.exerciseId) + progress * 2.5;
        for (let setNumber = 1; setNumber <= exercise.targetSets; setNumber += 1) {
          const reps = weightless ? 10 + progress : setNumber === exercise.targetSets ? 6 : 8;
          const set = await addWorkoutSet(workout.id, exercise.exerciseId, exercise.position, setNumber, {
            weightKg: weight,
            reps,
          });
          await updateWorkoutSet(set.id, { completed: true });
        }
      }
      await markPersonalRecords(workout.id);
      await finishWorkout(workout.id, start + (52 + (progress % 3) * 4) * 60 * 1000);
    }
  }
}
