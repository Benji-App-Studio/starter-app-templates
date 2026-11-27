import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components/icons';

export type OnboardingOption = {
  id: string;
  label: string;
  /** One line under the label, when the choice needs it. */
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
 * The onboarding flow: a welcome, three questions, and a closing "Your night" step that
 * `src/features/mixer/plan.ts` computes from the answers. The screens, progress bar and
 * answer storage come from the base.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Sounds that help you sleep',
    body: 'Mix rain, noise and low tones, set a timer, and let the room go quiet on its own.',
    icon: 'moonStars',
  },
  {
    id: 'goal',
    title: 'What do you want help with?',
    body: 'We will shape your first mix around it.',
    icon: 'bed',
    question: {
      id: 'goal',
      options: [
        { id: 'fall-asleep', label: 'Falling asleep', detail: 'My mind keeps going at bedtime' },
        { id: 'stay-asleep', label: 'Staying asleep', detail: 'I wake up during the night' },
        { id: 'block-noise', label: 'Blocking out noise', detail: 'Traffic, neighbours, a snorer' },
        { id: 'wind-down', label: 'Winding down', detail: 'Reading, resting, a quieter evening' },
      ],
    },
  },
  {
    id: 'sounds',
    title: 'Which sounds relax you most?',
    body: 'Pick one to start with. You can mix all of them later.',
    icon: 'rain',
    question: {
      id: 'sounds',
      options: [
        { id: 'rain', label: 'Rain', detail: 'Steady rain with distant thunder rumble' },
        { id: 'steady', label: 'Steady noise', detail: 'Pink noise and a fan, like a quiet room' },
        { id: 'deep', label: 'Deep and low', detail: 'Brown noise with a soft drone' },
        { id: 'nature', label: 'Wind and waves', detail: 'Slow swells and moving air' },
      ],
    },
  },
  {
    id: 'fall-asleep-time',
    title: 'How long does it take you to fall asleep?',
    body: 'This sets how long the mix plays before it fades out.',
    icon: 'timer',
    question: {
      id: 'fallAsleepTime',
      options: [
        { id: 'quick', label: 'Under 15 minutes' },
        { id: 'half-hour', label: 'About half an hour' },
        { id: 'hour', label: 'Close to an hour' },
        { id: 'longer', label: 'Longer than that' },
      ],
    },
  },
  {
    id: 'plan',
    title: 'Your night',
    body: 'Built from your answers. Change it any time.',
    icon: 'sparkles',
  },
];
