import type { MoodScore } from '@/db/checkIns';
import type { ThemeColors } from '@/theme/theme';

export type Mood = {
  score: MoodScore;
  /** One word a person would use, not a clinical label. */
  label: string;
};

export const moods: readonly Mood[] = [
  { score: 1, label: 'Awful' },
  { score: 2, label: 'Low' },
  { score: 3, label: 'Okay' },
  { score: 4, label: 'Good' },
  { score: 5, label: 'Great' },
];

export const MOOD_SCORES: readonly MoodScore[] = [1, 2, 3, 4, 5];

export function moodFor(score: MoodScore): Mood {
  return moods[score - 1];
}

export function moodColor(colors: ThemeColors, score: MoodScore): string {
  return colors.mood[score - 1];
}

/** Nearest scale step for a mean, e.g. 3.6 → 4. A worklet: the mood dial calls it on the UI thread. */
export function scoreForAverage(average: number): MoodScore {
  'worklet';
  return Math.round(Math.min(5, Math.max(1, average))) as MoodScore;
}

/** Position of a score on a 0..1 slider. */
export function progressForScore(score: MoodScore): number {
  'worklet';
  return (score - 1) / 4;
}

export function scoreForProgress(progress: number): MoodScore {
  'worklet';
  return scoreForAverage(1 + progress * 4);
}
