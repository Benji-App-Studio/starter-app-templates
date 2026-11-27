import { clearAttempts, endAttempt, startAttempt } from '@/db/attempts';
import { getDatabase } from '@/db/index';

import type { Profile } from './profile';
import { DAY_MS, HOUR_MS } from './time';

/**
 * Development only: two finished attempts and a current one with a week of cravings,
 * so every screen can be seen populated (and shot for the App Store) without waiting.
 */
export async function loadSampleData(profile: Profile): Promise<void> {
  await clearAttempts();
  const now = Date.now();
  const { unitsPerDay, costPerDay } = profile;

  const first = await startAttempt(now - 61 * DAY_MS, unitsPerDay, costPerDay);
  await endAttempt(first.id, now - 56 * DAY_MS, 'A stressful week; gave in on the Friday.');
  const second = await startAttempt(now - 52 * DAY_MS, unitsPerDay, costPerDay);
  await endAttempt(second.id, now - 33 * DAY_MS, 'A wedding. One led to a few.');
  const current = await startAttempt(now - 12 * DAY_MS - 4 * HOUR_MS - 23 * 60_000, unitsPerDay, costPerDay);

  const cravings: [daysAgo: number, hour: number, trigger: string, seconds: number][] = [
    [11, 9, 'coffee', 56],
    [11, 18, 'routine', 56],
    [10, 8, 'coffee', 56],
    [10, 13, 'stress', 0],
    [10, 21, 'boredom', 56],
    [9, 9, 'coffee', 56],
    [8, 20, 'social', 112],
    [6, 10, 'routine', 56],
    [6, 16, 'stress', 56],
    [5, 19, 'social', 56],
    [3, 9, 'coffee', 0],
    [2, 22, 'boredom', 56],
    [1, 14, 'stress', 56],
    [0, 8, 'coffee', 56],
  ];

  const db = await getDatabase();
  for (const [daysAgo, hour, trigger, seconds] of cravings) {
    const day = new Date(now - daysAgo * DAY_MS);
    day.setHours(hour, 12, 0, 0);
    await db.runAsync(
      'INSERT INTO cravings (attempt_id, created_at, trigger, breathing_seconds) VALUES (?, ?, ?, ?)',
      current.id,
      day.getTime(),
      trigger,
      seconds,
    );
  }
}
