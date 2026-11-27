import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components/icons';

export type OnboardingOption = {
  id: string;
  label: string;
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

/** Answer ids for the `focus` question. Read by `src/features/journal/prompts.ts`. */
export type FocusAnswer = 'patterns' | 'gratitude' | 'stress' | 'habit';

/** Answer ids for the `checkInTime` question. Read by `src/features/reminders/reminders.ts`. */
export type CheckInTimeAnswer = 'morning' | 'midday' | 'evening' | 'night';

/**
 * The onboarding flow. Step one welcomes, two and three ask, the last one shows
 * the plan built from the answers. The screens come from `src/features/onboarding`.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'One honest minute a day',
    body: 'Slide to how you feel, name what shaped it, write a line. Over the weeks, a picture of your year fills in.',
    icon: 'face',
  },
  {
    id: 'focus',
    title: 'What brings you here?',
    body: 'It sets the prompt you see every day.',
    icon: 'sparkles',
    question: {
      id: 'focus',
      options: [
        { id: 'patterns', label: 'Understand what moves my mood' },
        { id: 'gratitude', label: 'Notice the good more often' },
        { id: 'stress', label: 'Get worries out of my head' },
        { id: 'habit', label: 'Keep a simple daily record' },
      ],
    },
  },
  {
    id: 'checkInTime',
    title: 'When is a good moment to check in?',
    body: 'Your reminder is set for this time. You can change it in Settings.',
    icon: 'clock',
    question: {
      id: 'checkInTime',
      options: [
        { id: 'morning', label: 'Morning, with coffee' },
        { id: 'midday', label: 'Around lunch' },
        { id: 'evening', label: 'In the evening' },
        { id: 'night', label: 'Right before bed' },
      ],
    },
  },
  {
    id: 'plan',
    title: 'Your journal is ready',
    body: 'Built from your answers.',
    icon: 'checkCircle',
  },
];
