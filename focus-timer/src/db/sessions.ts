import { getDatabase } from './index';

/** A completed focus session. Breaks are not stored. */
export type Session = {
  id: number;
  /** What the user was working on, e.g. "Deep work". */
  label: string;
  /** Focused minutes, as planned when the session started. */
  minutes: number;
  /** Unix time in milliseconds. */
  startedAt: number;
  endedAt: number;
};

export type NewSession = Omit<Session, 'id'>;

/** Focused minutes and session count for one local calendar day. */
export type DailyTotal = {
  /** Local date as YYYY-MM-DD. */
  day: string;
  minutes: number;
  sessions: number;
};

type SessionRow = {
  id: number;
  label: string;
  minutes: number;
  started_at: number;
  ended_at: number;
};

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    label: row.label,
    minutes: row.minutes,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

export async function listSessions(): Promise<Session[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SessionRow>('SELECT * FROM sessions ORDER BY ended_at DESC');
  return rows.map(toSession);
}

export async function createSession(session: NewSession): Promise<Session> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO sessions (label, minutes, started_at, ended_at) VALUES (?, ?, ?, ?)',
    session.label,
    session.minutes,
    session.startedAt,
    session.endedAt,
  );
  return { id: result.lastInsertRowId, ...session };
}

export async function deleteSession(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sessions WHERE id = ?', id);
}

export async function deleteAllSessions(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sessions');
}

/** Totals per local day, newest first. Days without a session are absent. */
export async function listDailyTotals(): Promise<DailyTotal[]> {
  const db = await getDatabase();
  return db.getAllAsync<DailyTotal>(
    `SELECT date(ended_at / 1000, 'unixepoch', 'localtime') AS day,
            SUM(minutes) AS minutes,
            COUNT(*) AS sessions
     FROM sessions
     GROUP BY day
     ORDER BY day DESC`,
  );
}

/** Labels used before, most recently used first. */
export async function listRecentLabels(limit: number): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ label: string }>(
    'SELECT label FROM sessions GROUP BY label ORDER BY MAX(ended_at) DESC LIMIT ?',
    limit,
  );
  return rows.map((row) => row.label);
}
