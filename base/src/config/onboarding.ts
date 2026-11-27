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
 * The onboarding flow. A niche template edits this array and nothing else:
 * the screens, progress dots and answer storage come from the base.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Starter App',
    body: 'A few quick questions so the app fits the way you want to use it.',
    icon: 'sparkles-outline',
  },
  {
    id: 'goal',
    title: 'What brings you here?',
    body: 'Pick the one that matters most right now.',
    icon: 'flag-outline',
    question: {
      id: 'goal',
      options: [
        { id: 'start', label: 'Start a new habit' },
        { id: 'track', label: 'Keep track of my progress' },
        { id: 'learn', label: 'Learn something new' },
        { id: 'curious', label: 'Just curious' },
      ],
    },
  },
  {
    id: 'frequency',
    title: 'How often will you use it?',
    body: 'This sets a realistic starting pace. You can change it later.',
    icon: 'calendar-outline',
    question: {
      id: 'frequency',
      options: [
        { id: 'daily', label: 'Every day' },
        { id: 'few-times', label: 'A few times a week' },
        { id: 'weekly', label: 'Once a week' },
      ],
    },
  },
  {
    id: 'ready',
    title: 'You are all set',
    body: 'Your answers are saved. Next, pick a plan and start using the app.',
    icon: 'checkmark-circle-outline',
  },
];
