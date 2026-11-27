import type { IconName } from '@/components/icons';

export type OnboardingOption = {
  id: string;
  label: string;
  /** Second line under the label. */
  detail?: string;
};

export type OnboardingQuestion = {
  /** Key the answer is stored under in `appState.onboardingAnswers`. */
  id: string;
  options: OnboardingOption[];
};

/**
 * What the visual slot shows. `table` is a slice of the live set table; `split` and `ring`
 * are live previews that react to the answer; `plan` is the computed "Your plan" step.
 */
export type OnboardingPreview = 'table' | 'split' | 'ring' | 'plan';

export type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  icon: IconName;
  preview: OnboardingPreview;
  /** Single-choice question. Continue stays disabled until an option is picked. */
  question?: OnboardingQuestion;
};

/** Answer ids for the experience question. The starter routines are chosen from them. */
export const EXPERIENCE_QUESTION_ID = 'experience';
/** Answer ids are the number of days; the week ring's goal reads this. */
export const DAYS_QUESTION_ID = 'daysPerWeek';

/**
 * The onboarding flow. A niche template edits this array and nothing else:
 * the screens, progress bar and answer storage come from the base.
 */
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Every set, written down',
    body: 'Start a routine, log weight and reps while you rest, and watch the numbers beat last week.',
    icon: 'barbell',
    preview: 'table',
  },
  {
    id: EXPERIENCE_QUESTION_ID,
    title: 'How long have you been lifting?',
    body: 'Picks the split your first routines follow. You can rebuild them any time.',
    icon: 'strength',
    preview: 'split',
    question: {
      id: EXPERIENCE_QUESTION_ID,
      options: [
        { id: 'new', label: 'Just starting', detail: 'Full body, twice a week' },
        { id: 'some', label: 'Under a year', detail: 'Full body A and B' },
        { id: 'solid', label: 'One to three years', detail: 'Push, pull, legs' },
        { id: 'advanced', label: 'Three years or more', detail: 'Upper and lower, four days' },
      ],
    },
  },
  {
    id: DAYS_QUESTION_ID,
    title: 'How many days a week?',
    body: 'Sets the goal on your week ring. Missed days do not reset anything.',
    icon: 'calendar',
    preview: 'ring',
    question: {
      id: DAYS_QUESTION_ID,
      options: [
        { id: '2', label: '2 days' },
        { id: '3', label: '3 days' },
        { id: '4', label: '4 days' },
        { id: '5', label: '5 days' },
      ],
    },
  },
  {
    id: 'plan',
    title: 'Your plan',
    body: 'Built from your answers. Everything here can be changed later.',
    icon: 'check',
    preview: 'plan',
  },
];
