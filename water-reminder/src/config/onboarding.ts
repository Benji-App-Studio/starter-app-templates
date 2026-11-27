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
 * The onboarding flow. The three answers (weight, activity, climate) set the
 * recommended daily goal in `src/features/hydration/goal.ts`; the option ids
 * here must match the keys in that file.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Sipwell',
    body: 'Three quick questions and we will work out how much water you need each day.',
    icon: 'drop',
  },
  {
    id: 'weight',
    title: 'How much do you weigh?',
    body: 'Body weight is the biggest factor in how much water you need.',
    icon: 'weight',
    question: {
      id: 'weight',
      options: [
        { id: 'under-55', label: 'Under 55 kg (120 lb)' },
        { id: '55-70', label: '55–70 kg (120–155 lb)' },
        { id: '70-85', label: '70–85 kg (155–185 lb)' },
        { id: '85-100', label: '85–100 kg (185–220 lb)' },
        { id: 'over-100', label: 'Over 100 kg (220 lb)' },
      ],
    },
  },
  {
    id: 'activity',
    title: 'How active are you?',
    body: 'Sweat has to be replaced. Pick a typical day.',
    icon: 'walk',
    question: {
      id: 'activity',
      options: [
        { id: 'sitting', label: 'Mostly sitting' },
        { id: 'light', label: 'On my feet a few hours' },
        { id: 'active', label: 'I exercise most days' },
        { id: 'intense', label: 'Hard training or physical work' },
      ],
    },
  },
  {
    id: 'climate',
    title: 'What is the weather like where you live?',
    body: 'Warm weather means you lose more water without noticing.',
    icon: 'sun',
    question: {
      id: 'climate',
      options: [
        { id: 'cool', label: 'Cool or mild' },
        { id: 'warm', label: 'Warm' },
        { id: 'hot', label: 'Hot or humid' },
      ],
    },
  },
  {
    id: 'ready',
    title: 'Your daily goal is ready',
    body: 'Log every glass with one tap and let the reminders keep you on track until the goal is full.',
    icon: 'checkCircle',
  },
];
