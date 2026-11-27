import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components/icons';

export type OnboardingOption = {
  id: string;
  label: string;
  /** A second line under the label. */
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
  /** Shown in the illustration slot when the step has no live preview and no `image`. */
  icon: IconName;
  /** Optional picture for the illustration slot, e.g. `require('../../assets/welcome.png')`. */
  image?: ImageSourcePropType;
  /** Single-choice question. Continue stays disabled until an option is picked. */
  question?: OnboardingQuestion;
};

/**
 * The onboarding flow. Each answer feeds the timer: `experience` picks the
 * starting plan, `lastMeal` sets the hour the fast starts and the daily reminder.
 * The last step shows the plan built from both.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Fasting, kept simple',
    body: 'Hold to start a fast, watch the hours fill in, end it when the marker turns gold. Two questions and your plan is set.',
    icon: 'timer',
  },
  {
    id: 'experience',
    title: 'Have you fasted before?',
    body: 'This picks your starting plan. Change it any time from the timer.',
    icon: 'moon',
    question: {
      id: 'experience',
      options: [
        { id: 'new', label: 'Never, this is my first time', detail: 'Start with 14:10' },
        { id: 'some', label: 'A few times', detail: 'Start with 16:8' },
        { id: 'regular', label: 'Most weeks', detail: 'Start with 18:6' },
        { id: 'advanced', label: 'I fast most days', detail: 'Start with 20:4' },
      ],
    },
  },
  {
    id: 'lastMeal',
    title: 'When do you usually finish your last meal?',
    body: 'Your fast starts when eating stops. This sets the daily reminder and your eating window.',
    icon: 'sun',
    question: {
      id: 'lastMeal',
      options: [
        { id: '18', label: 'Around 6 PM' },
        { id: '19', label: 'Around 7 PM' },
        { id: '20', label: 'Around 8 PM' },
        { id: '21', label: '9 PM or later' },
      ],
    },
  },
  {
    id: 'plan',
    title: 'Your plan',
    body: 'Built from your answers. Everything here can be changed in Settings.',
    icon: 'sparkle',
  },
];
