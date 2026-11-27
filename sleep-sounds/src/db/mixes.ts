import type { MixSound } from '@/features/mixer/sounds';

import { getDatabase } from './index';

/** A saved mix: the sounds with their levels and the sleep timer to start it with. */
export type Mix = {
  id: number;
  name: string;
  sounds: MixSound[];
  /** Minutes until the mix fades out, or null to play until stopped. */
  timerMinutes: number | null;
  /** Unix time in milliseconds. */
  createdAt: number;
};

type MixRow = {
  id: number;
  name: string;
  sounds: string;
  timer_minutes: number | null;
  created_at: number;
};

function toMix(row: MixRow): Mix {
  return {
    id: row.id,
    name: row.name,
    sounds: JSON.parse(row.sounds) as MixSound[],
    timerMinutes: row.timer_minutes,
    createdAt: row.created_at,
  };
}

export async function listMixes(): Promise<Mix[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MixRow>('SELECT * FROM mixes ORDER BY created_at DESC');
  return rows.map(toMix);
}

export async function createMix(
  name: string,
  sounds: MixSound[],
  timerMinutes: number | null,
): Promise<Mix> {
  const db = await getDatabase();
  const createdAt = Date.now();
  const result = await db.runAsync(
    'INSERT INTO mixes (name, sounds, timer_minutes, created_at) VALUES (?, ?, ?, ?)',
    name,
    JSON.stringify(sounds),
    timerMinutes,
    createdAt,
  );
  return { id: result.lastInsertRowId, name, sounds, timerMinutes, createdAt };
}

export async function deleteMix(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM mixes WHERE id = ?', id);
}

export async function deleteAllMixes(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM mixes');
}
