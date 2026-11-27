import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components/icons';

export type OnboardingOption = {
  id: string;
  label: string;
  /** Second line under the label. */
  detail?: string;
  icon?: IconName;
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
  /** The closing step computes "your plan" from the answers instead of showing `body`. */
  kind?: 'plan';
};

/**
 * The onboarding flow. The screens, progress bar and answer storage come from
 * `src/features/onboarding`; the dial previews react to the `sessionLength` and
 * `dailyGoal` answers, and `purpose` picks the first label suggestions.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Set the dial. Then put the phone down.',
    body: 'Deepflow is a kitchen timer for your attention. Every session you finish is saved, so the focused hours add up where you can see them.',
    icon: 'timer',
  },
  {
    id: 'purpose',
    title: 'What are you focusing on?',
    body: 'This picks the first labels for your sessions. You can type your own any time.',
    icon: 'tag',
    question: {
      id: 'purpose',
      options: [
        { id: 'study', label: 'Studying', detail: 'Reading, revision, problem sets', icon: 'book' },
        { id: 'work', label: 'Work', detail: 'Deep work, writing, planning', icon: 'briefcase' },
        { id: 'creative', label: 'Creative projects', detail: 'Drawing, music, writing', icon: 'palette' },
        { id: 'mixed', label: 'A bit of everything', icon: 'sparkles' },
      ],
    },
  },
  {
    id: 'length',
    title: 'How long can you hold focus?',
    body: 'Your dial starts here. Drag it to any length before a session.',
    icon: 'timer',
    question: {
      id: 'sessionLength',
      options: [
        { id: '15', label: '15 minutes', detail: 'Short bursts' },
        { id: '25', label: '25 minutes', detail: 'The classic, with a 5-minute break' },
        { id: '45', label: '45 minutes', detail: 'Settled in, with a 10-minute break' },
        { id: '50', label: '50 minutes', detail: 'Deep work' },
      ],
    },
  },
  {
    id: 'goal',
    title: 'How many sessions a day?',
    body: 'A full day keeps your streak going. Pick something you can hit on a busy day too.',
    icon: 'target',
    question: {
      id: 'dailyGoal',
      options: [
        { id: '2', label: '2 sessions', detail: 'A steady start' },
        { id: '4', label: '4 sessions', detail: 'A solid morning' },
        { id: '6', label: '6 sessions', detail: 'Most of a workday' },
        { id: '8', label: '8 sessions', detail: 'A full day of deep work' },
      ],
    },
  },
  {
    id: 'plan',
    kind: 'plan',
    title: 'Your plan',
    body: '',
    icon: 'checkCircle',
  },
];
