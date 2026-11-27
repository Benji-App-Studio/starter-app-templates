import { EXPERIENCE_QUESTION_ID } from '@/config/onboarding';
import { replaceRoutineExercises, type RoutineExerciseInput } from '@/db/routineExercises';
import { createRoutine } from '@/db/routines';
import { appState } from '@/state/appState';

export type StarterRoutine = { name: string; exercises: RoutineExerciseInput[] };

export type StarterPlan = {
  /** "Push / Pull / Legs" */
  splitName: string;
  routines: StarterRoutine[];
};

function sets(exerciseId: string, targetSets = 3): RoutineExerciseInput {
  return { exerciseId, targetSets };
}

const fullBody: StarterPlan = {
  splitName: 'Full body A / B',
  routines: [
    {
      name: 'Full Body A',
      exercises: [sets('squat'), sets('bench-press'), sets('lat-pulldown'), sets('dumbbell-shoulder-press'), sets('plank')],
    },
    {
      name: 'Full Body B',
      exercises: [sets('deadlift'), sets('incline-dumbbell-press'), sets('seated-cable-row'), sets('leg-press'), sets('hanging-knee-raise')],
    },
  ],
};

const pushPullLegs: StarterPlan = {
  splitName: 'Push / Pull / Legs',
  routines: [
    {
      name: 'Push',
      exercises: [sets('bench-press', 4), sets('overhead-press'), sets('incline-dumbbell-press'), sets('lateral-raise'), sets('triceps-pushdown')],
    },
    {
      name: 'Pull',
      exercises: [sets('deadlift'), sets('pull-up'), sets('barbell-row'), sets('face-pull'), sets('biceps-curl')],
    },
    {
      name: 'Legs',
      exercises: [sets('squat', 4), sets('romanian-deadlift'), sets('leg-press'), sets('leg-curl'), sets('calf-raise', 4)],
    },
  ],
};

const upperLower: StarterPlan = {
  splitName: 'Upper / Lower',
  routines: [
    {
      name: 'Upper A',
      exercises: [sets('bench-press', 4), sets('barbell-row', 4), sets('overhead-press'), sets('lat-pulldown'), sets('biceps-curl'), sets('triceps-pushdown')],
    },
    {
      name: 'Lower A',
      exercises: [sets('squat', 4), sets('romanian-deadlift'), sets('leg-press'), sets('leg-curl'), sets('calf-raise', 4)],
    },
    {
      name: 'Upper B',
      exercises: [sets('incline-bench-press', 4), sets('pull-up', 4), sets('dumbbell-shoulder-press'), sets('seated-cable-row'), sets('hammer-curl'), sets('skull-crusher')],
    },
    {
      name: 'Lower B',
      exercises: [sets('deadlift', 4), sets('front-squat'), sets('bulgarian-split-squat'), sets('hip-thrust'), sets('hanging-knee-raise')],
    },
  ],
};

/** The split for an experience answer; new lifters get the two full-body days. */
export function starterPlanFor(experience: string | undefined): StarterPlan {
  switch (experience) {
    case 'solid':
      return pushPullLegs;
    case 'advanced':
      return upperLower;
    default:
      return fullBody;
  }
}

let seeding: Promise<void> | undefined;

/** Creates the starter routines once. Called from the onboarding plan step and, as a fallback, from Home. */
export function seedStarterRoutines(): Promise<void> {
  if (appState.get().routinesSeeded) {
    return Promise.resolve();
  }
  seeding ??= (async () => {
    const plan = starterPlanFor(appState.get().onboardingAnswers[EXPERIENCE_QUESTION_ID]);
    for (const routine of plan.routines) {
      const created = await createRoutine(routine.name);
      await replaceRoutineExercises(created.id, routine.exercises);
    }
    appState.set({ routinesSeeded: true });
  })().finally(() => {
    seeding = undefined;
  });
  return seeding;
}
