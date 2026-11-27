import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components';

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
  /** The closing step: shows the plan computed from the answers instead of a question. */
  plan?: boolean;
};

/**
 * The onboarding flow. The answers feed the app: `budget` sets the monthly total,
 * `topCategory` takes the biggest share of it and is the default when logging,
 * `payday` is the day the month resets (see `src/features/expenses/budgetPlan.ts`).
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'One number a day',
    body: 'Tallyo turns your monthly budget into one daily number and keeps it honest with every expense you log. No bank login, nothing leaves your phone.',
    icon: 'wallet',
  },
  {
    id: 'budget',
    title: 'How much do you want to spend a month?',
    body: 'Everything except rent and savings. The daily number below comes from this.',
    icon: 'banknote',
    question: {
      id: 'budget',
      options: [
        { id: 'under-1000', label: 'Under $1,000' },
        { id: '1000-2000', label: '$1,000 to $2,000' },
        { id: '2000-3500', label: '$2,000 to $3,500' },
        { id: 'over-3500', label: 'Over $3,500' },
      ],
    },
  },
  {
    id: 'topCategory',
    title: 'Where does most of it go?',
    body: 'That category gets the biggest share of your budget and comes up first when you log.',
    icon: 'budgets',
    question: {
      id: 'topCategory',
      options: [
        { id: 'food', label: 'Food & drink' },
        { id: 'shopping', label: 'Shopping' },
        { id: 'bills', label: 'Bills' },
        { id: 'fun', label: 'Going out' },
      ],
    },
  },
  {
    id: 'payday',
    title: 'When does your money month start?',
    body: 'Your budget resets on this day, so the daily number lines up with your pay.',
    icon: 'calendar',
    question: {
      id: 'payday',
      options: [
        { id: 'first', label: '1st of the month' },
        { id: 'fifteenth', label: '15th' },
        { id: 'twenty-fifth', label: '25th' },
        { id: 'unsure', label: 'Not sure, use the 1st' },
      ],
    },
  },
  {
    id: 'plan',
    title: 'Your plan',
    body: 'Change any of this later in Budgets and Settings.',
    icon: 'checkCircle',
    plan: true,
  },
];
