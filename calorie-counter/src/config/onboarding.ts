import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components/icons';

export type OnboardingOption = {
  id: string;
  label: string;
  /** One line under the label, e.g. what the choice means for the plan. */
  detail?: string;
};

export type OnboardingQuestion = {
  /** Key the answer is stored under in `appState.onboardingAnswers`. */
  id: string;
  options: OnboardingOption[];
};

export type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  /** Shown in the illustration slot when no `image` is given. */
  icon: IconName;
  /** Optional picture for the illustration slot, e.g. `require('../../assets/welcome.png')`. */
  image?: ImageSourcePropType;
  /** Single-choice question. Continue stays disabled until an option is picked. */
  question?: OnboardingQuestion;
};

/**
 * The onboarding flow: welcome, two questions, then the plan built from the
 * answers. The question ids and option ids are read by
 * `src/features/diary/target.ts` to compute the daily calorie target.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Know where you stand, every meal',
    body: 'Log what you eat in a few taps and watch the ring tell you how much room is left today.',
    icon: 'flame',
  },
  {
    id: 'goal',
    title: 'What do you want from the next few months?',
    body: 'This sets the direction of your daily target.',
    icon: 'target',
    question: {
      id: 'goal',
      options: [
        { id: 'lose', label: 'Lose weight', detail: 'A steady deficit of about 500 kcal a day' },
        { id: 'maintain', label: 'Stay where I am', detail: 'Eat around what you burn' },
        { id: 'gain', label: 'Gain weight', detail: 'A surplus of about 300 kcal a day' },
      ],
    },
  },
  {
    id: 'activity',
    title: 'How does a normal day look?',
    body: 'Movement counts, even before any workout.',
    icon: 'walk',
    question: {
      id: 'activity',
      options: [
        { id: 'sitting', label: 'Mostly sitting', detail: 'Desk work, little walking' },
        { id: 'light', label: 'On my feet some of the day', detail: 'Errands, short walks, light chores' },
        { id: 'active', label: 'Active most days', detail: 'Regular workouts or a job on your feet' },
        { id: 'very', label: 'Training hard', detail: 'Physical work or daily intense training' },
      ],
    },
  },
  {
    id: 'plan',
    title: 'Your daily target is ready',
    body: 'A starting point from your goal and your days. Adjust it any time in Settings.',
    icon: 'checkCircle',
  },
];
