import { DAY_MS, HOUR_MS } from './time';

export type Milestone = {
  id: string;
  afterMs: number;
  title: string;
  /** Written about the effort, never about health. */
  body: string;
};

export const milestones: Milestone[] = [
  { id: 'h12', afterMs: 12 * HOUR_MS, title: '12 hours', body: 'Half a day. The first one is the hardest to start.' },
  { id: 'd1', afterMs: DAY_MS, title: '1 day', body: 'A full day without it. You know it is possible now.' },
  { id: 'd3', afterMs: 3 * DAY_MS, title: '3 days', body: 'Three mornings that began differently.' },
  { id: 'w1', afterMs: 7 * DAY_MS, title: '1 week', body: 'Seven days. The old routine has had a week to loosen.' },
  { id: 'w2', afterMs: 14 * DAY_MS, title: '2 weeks', body: 'Two weeks in. Notice how ordinary a free day has become.' },
  { id: 'm1', afterMs: 30 * DAY_MS, title: '1 month', body: 'A month. Thirty days of choosing this, one at a time.' },
  { id: 'm2', afterMs: 60 * DAY_MS, title: '2 months', body: 'Two months. This is a habit now, the good kind.' },
  { id: 'm3', afterMs: 90 * DAY_MS, title: '3 months', body: 'A quarter of a year. Remember day one?' },
  { id: 'm6', afterMs: 180 * DAY_MS, title: '6 months', body: 'Half a year free. Look how far the money has come.' },
  { id: 'y1', afterMs: 365 * DAY_MS, title: '1 year', body: 'One year. You did this one day at a time.' },
];

export type MilestoneProgress = {
  reached: Milestone[];
  next: Milestone | undefined;
  /** 0..1 progress from the last reached milestone (or the start) to the next one. */
  progress: number;
  /** Milliseconds until `next`, 0 when every milestone is reached. */
  remainingMs: number;
};

export function milestoneProgress(startedAt: number, now: number): MilestoneProgress {
  const elapsed = Math.max(0, now - startedAt);
  const reached = milestones.filter((milestone) => milestone.afterMs <= elapsed);
  const next = milestones.find((milestone) => milestone.afterMs > elapsed);
  if (!next) {
    return { reached, next, progress: 1, remainingMs: 0 };
  }
  const previousMs = reached.at(-1)?.afterMs ?? 0;
  return {
    reached,
    next,
    progress: (elapsed - previousMs) / (next.afterMs - previousMs),
    remainingMs: next.afterMs - elapsed,
  };
}
