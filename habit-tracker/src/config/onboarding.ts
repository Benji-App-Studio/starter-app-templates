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

/**
 * The onboarding flow. Each step's visual lives in `src/features/onboarding/StepVisual.tsx`,
 * keyed by the step id. The answers drive the starter habits (`focus`) and the default
 * reminder time (`checkin`) in `src/features/habits/starters.ts`.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'One dot a day',
    body: 'Pick a few habits, hold to check them off, and watch the grid fill in. Two quick questions first.',
    icon: 'progress',
  },
  {
    id: 'focus',
    title: 'What do you want to work on first?',
    body: 'We will suggest four starter habits for it. You can change them any time.',
    icon: 'target',
    question: {
      id: 'focus',
      options: [
        { id: 'health', label: 'Health and energy' },
        { id: 'focus', label: 'Focus and deep work' },
        { id: 'mind', label: 'Calm and headspace' },
        { id: 'learn', label: 'Learning a skill' },
      ],
    },
  },
  {
    id: 'checkin',
    title: 'When will you check in?',
    body: 'Sets the reminder time for your habits. Each habit can have its own later.',
    icon: 'clock',
    question: {
      id: 'checkin',
      options: [
        { id: 'morning', label: 'Morning, with coffee' },
        { id: 'midday', label: 'Midday, over lunch' },
        { id: 'evening', label: 'Evening, after work' },
        { id: 'night', label: 'Night, before bed' },
      ],
    },
  },
  {
    id: 'plan',
    title: 'Your plan',
    body: 'Four starter habits and a daily reminder. Untick anything you do not want.',
    icon: 'sparkles',
  },
];
