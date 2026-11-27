import type { FocusAnswer } from '@/config/onboarding';
import type { NoteKind } from '@/db/checkIns';

export type NotePrompt = {
  /** Which note type is pre-selected on a new check-in. */
  defaultKind: NoteKind;
  /** Placeholder for each note type. */
  placeholder: Record<NoteKind, string>;
  /** One line that names the plan on the onboarding summary. */
  planLine: string;
};

const GRATITUDE_PLACEHOLDER = 'One thing today you are glad happened';

const prompts: Record<FocusAnswer, NotePrompt> = {
  patterns: {
    defaultKind: 'free',
    placeholder: { free: 'What shaped the day?', gratitude: GRATITUDE_PLACEHOLDER },
    planLine: 'Each day asks what shaped your mood, and Trends connects the dots',
  },
  gratitude: {
    defaultKind: 'gratitude',
    placeholder: { free: 'Anything else from today', gratitude: 'What are you grateful for today?' },
    planLine: 'Each day starts with a gratitude line',
  },
  stress: {
    defaultKind: 'free',
    placeholder: { free: 'What is on your mind? Leave it here.', gratitude: GRATITUDE_PLACEHOLDER },
    planLine: 'Each day gives you room to put worries down',
  },
  habit: {
    defaultKind: 'free',
    placeholder: { free: 'A few words about today', gratitude: GRATITUDE_PLACEHOLDER },
    planLine: 'A short daily note, and a streak that grows',
  },
};

function isFocus(value: string | undefined): value is FocusAnswer {
  return value !== undefined && value in prompts;
}

/** The prompt for the user's onboarding focus; unknown or missing answers get the plain record. */
export function notePromptFor(focus: string | undefined): NotePrompt {
  return prompts[isFocus(focus) ? focus : 'habit'];
}
