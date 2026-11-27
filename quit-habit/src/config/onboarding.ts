import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components/icons';

export type OnboardingOption = {
  id: string;
  label: string;
  hint?: string;
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
  /** Shown in the illustration slot when no `image` is given and the step has no live preview. */
  icon: IconName;
  /** Optional picture for the illustration slot, e.g. `require('../../assets/welcome.png')`. */
  image?: ImageSourcePropType;
  /** Single-choice question. Continue stays disabled until an option is picked. */
  question?: OnboardingQuestion;
};

/**
 * The onboarding flow. The answers feed the counter: `habit` picks the preset
 * (unit names, "Smoke-free"), `amount` sets units per day, `spend` sets money per day.
 * The last step shows the plan computed from them.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Make this the last time',
    body: 'Clearstreak keeps count of the time, the money and the habit you leave behind, and stays with you when a craving hits.',
    icon: 'timer',
  },
  {
    id: 'habit',
    title: 'What are you leaving behind?',
    body: 'This sets what the counter counts.',
    icon: 'other',
    question: {
      id: 'habit',
      options: [
        { id: 'smoking', label: 'Smoking', hint: 'Cigarettes, counted one by one' },
        { id: 'vaping', label: 'Vaping', hint: 'Counted in puffs' },
        { id: 'drinking', label: 'Drinking', hint: 'Counted in drinks' },
        { id: 'other', label: 'Something else', hint: 'Counted each time you would have' },
      ],
    },
  },
  {
    id: 'amount',
    title: 'How much, on a typical day?',
    body: 'Roughly is fine. Fine-tune it later in Settings.',
    icon: 'perDay',
    question: {
      id: 'amount',
      options: [
        { id: 'light', label: 'A little', hint: 'Now and then' },
        { id: 'moderate', label: 'A fair amount', hint: 'Most days, several times' },
        { id: 'heavy', label: 'A lot', hint: 'Every day, through the day' },
        { id: 'constant', label: 'All day', hint: 'It ran the day' },
      ],
    },
  },
  {
    id: 'spend',
    title: 'What did it cost you per day?',
    body: 'Every hour you stay free turns into money kept.',
    icon: 'money',
    question: {
      id: 'spend',
      options: [
        { id: 'under5', label: 'Under $5' },
        { id: '5to10', label: '$5 to $10' },
        { id: '10to20', label: '$10 to $20' },
        { id: 'over20', label: 'More than $20' },
      ],
    },
  },
  {
    id: 'plan',
    title: 'Your counter is set',
    body: 'Your first month, if you start today.',
    icon: 'checkCircle',
  },
];
