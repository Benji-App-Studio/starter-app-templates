import type { MixSound } from '@/features/mixer/sounds';

import { getDatabase } from './index';

export type Rating = 'rough' | 'okay' | 'rested';

/** One night: the stretch the mix played, and how the night went if the user said. */
export type Session = {
  id: number;
  /** Unix time in milliseconds. */
  startedAt: number;
  endedAt: number;
  timerMinutes: number | null;
  sounds: MixSound[];
  rating: Rating | null;
};

type SessionRow = {
  id: number;
  started_at: number;
  ended_at: number;
  timer_minutes: number | null;
  sounds: string;
  rating: Rating | null;
};

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    timerMinutes: row.timer_minutes,
    sounds: JSON.parse(row.sounds) as MixSound[],
    rating: row.rating,
  };
}

export async function listSessions(limit = 60): Promise<Session[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?',
    limit,
  );
  return rows.map(toSession);
}

export async function createSession(
  session: Omit<Session, 'id' | 'rating'>,
): Promise<Session> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO sessions (started_at, ended_at, timer_minutes, sounds, rating) VALUES (?, ?, ?, ?, NULL)',
    session.startedAt,
    session.endedAt,
    session.timerMinutes,
    JSON.stringify(session.sounds),
  );
  return { ...session, id: result.lastInsertRowId, rating: null };
}

export async function rateSession(id: number, rating: Rating): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE sessions SET rating = ? WHERE id = ?', rating, id);
}

export async function deleteSession(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sessions WHERE id = ?', id);
}

export async function deleteAllSessions(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sessions');
}
