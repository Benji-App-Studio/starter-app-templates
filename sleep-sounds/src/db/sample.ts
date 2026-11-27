import type { MixSound } from '@/features/mixer/sounds';

import { getDatabase } from './index';
import type { Rating } from './sessions';

const DAY_MS = 86_400_000;

const sampleMixes: { name: string; sounds: MixSound[]; timerMinutes: number | null }[] = [
  { name: 'Rainy window', sounds: [{ id: 'rain', volume: 0.8 }, { id: 'brown-noise', volume: 0.35 }], timerMinutes: 45 },
  { name: 'Hotel room', sounds: [{ id: 'fan', volume: 0.7 }, { id: 'pink-noise', volume: 0.4 }], timerMinutes: null },
  { name: 'Shoreline', sounds: [{ id: 'ocean', volume: 0.85 }, { id: 'wind', volume: 0.3 }, { id: 'low-drone', volume: 0.2 }], timerMinutes: 60 },
];

const sampleNights: { daysAgo: number; startHour: number; minutes: number; mix: number; rating: Rating | null }[] = [
  { daysAgo: 0, startHour: 23, minutes: 45, mix: 0, rating: null },
  { daysAgo: 1, startHour: 22.5, minutes: 52, mix: 0, rating: 'rested' },
  { daysAgo: 2, startHour: 23.5, minutes: 30, mix: 1, rating: 'okay' },
  { daysAgo: 3, startHour: 23, minutes: 95, mix: 2, rating: 'rested' },
  { daysAgo: 4, startHour: 0.5, minutes: 40, mix: 0, rating: 'rough' },
  { daysAgo: 6, startHour: 22, minutes: 61, mix: 1, rating: 'rested' },
  { daysAgo: 7, startHour: 23, minutes: 48, mix: 0, rating: 'okay' },
  { daysAgo: 8, startHour: 23.25, minutes: 70, mix: 2, rating: 'rested' },
  { daysAgo: 9, startHour: 22.75, minutes: 35, mix: 0, rating: 'okay' },
  { daysAgo: 10, startHour: 23, minutes: 55, mix: 1, rating: 'rested' },
];

/** Development only: fills the saved mixes and the sleep log so every screen can be seen full. */
export async function loadSampleData(): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  const midnightTonight = new Date(now);
  midnightTonight.setHours(0, 0, 0, 0);

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync('DELETE FROM mixes');
    await txn.runAsync('DELETE FROM sessions');
    for (const [index, mix] of sampleMixes.entries()) {
      await txn.runAsync(
        'INSERT INTO mixes (name, sounds, timer_minutes, created_at) VALUES (?, ?, ?, ?)',
        mix.name,
        JSON.stringify(mix.sounds),
        mix.timerMinutes,
        now - index * DAY_MS,
      );
    }
    for (const night of sampleNights) {
      // Evenings start on the calendar day before "daysAgo" midnights; small hours land after it.
      const evening = midnightTonight.getTime() - night.daysAgo * DAY_MS;
      const startedAt =
        night.startHour >= 12
          ? evening - DAY_MS + night.startHour * 3600_000
          : evening + night.startHour * 3600_000;
      const mix = sampleMixes[night.mix];
      await txn.runAsync(
        'INSERT INTO sessions (started_at, ended_at, timer_minutes, sounds, rating) VALUES (?, ?, ?, ?, ?)',
        startedAt,
        startedAt + night.minutes * 60_000,
        mix.timerMinutes,
        JSON.stringify(mix.sounds),
        night.rating,
      );
    }
  });
}
