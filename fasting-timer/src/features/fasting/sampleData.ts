import { createFast } from '@/db/fasts';

import { getProtocol } from './protocols';
import { HOUR_MS, MINUTE_MS, addDays } from './time';

/**
 * Two weeks of plausible fasts for App Store screenshots and demos.
 * Development only: Settings shows the row behind `__DEV__`.
 */
export async function loadSampleData(startHour: number) {
  const now = Date.now();
  // [days ago the fast ended, hours fasted, plan]. Yesterday and the five days before it complete, so the streak reads 6.
  const rows: [number, number, '16:8' | '18:6' | '14:10'][] = [
    [1, 16.4, '16:8'],
    [2, 17.1, '16:8'],
    [3, 16.0, '16:8'],
    [4, 18.3, '18:6'],
    [5, 16.6, '16:8'],
    [6, 16.2, '16:8'],
    [7, 13.2, '16:8'],
    [9, 16.8, '16:8'],
    [10, 14.5, '14:10'],
    [11, 16.1, '16:8'],
    [13, 15.9, '16:8'],
    [14, 16.3, '16:8'],
  ];

  for (const [daysAgo, hours, protocolId] of rows) {
    const startedAt = new Date(addDays(now, -daysAgo - 1));
    startedAt.setHours(startHour, 10 + (daysAgo % 4) * 7, 0, 0);
    const endedAt = startedAt.getTime() + hours * HOUR_MS + (daysAgo % 3) * 4 * MINUTE_MS;
    await createFast({
      protocolId,
      goalHours: getProtocol(protocolId).fastHours,
      startedAt: startedAt.getTime(),
      endedAt,
    });
  }
}
