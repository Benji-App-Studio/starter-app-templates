import { getDatabase } from './index';

/** A craving the user got through, logged from the craving screen. */
export type Craving = {
  id: number;
  attemptId: number;
  /** Unix time in milliseconds. */
  createdAt: number;
  /** Trigger id from `cravingTriggers`, or null when the user skipped the question. */
  trigger: string | null;
  /** How long the breathing exercise ran, 0 when it was skipped. */
  breathingSeconds: number;
};

type CravingRow = {
  id: number;
  attempt_id: number;
  created_at: number;
  trigger: string | null;
  breathing_seconds: number;
};

function toCraving(row: CravingRow): Craving {
  return {
    id: row.id,
    attemptId: row.attempt_id,
    createdAt: row.created_at,
    trigger: row.trigger,
    breathingSeconds: row.breathing_seconds,
  };
}

export async function logCraving(
  attemptId: number,
  trigger: string | null,
  breathingSeconds: number,
): Promise<Craving> {
  const db = await getDatabase();
  const createdAt = Date.now();
  const result = await db.runAsync(
    'INSERT INTO cravings (attempt_id, created_at, trigger, breathing_seconds) VALUES (?, ?, ?, ?)',
    attemptId,
    createdAt,
    trigger,
    breathingSeconds,
  );
  return { id: result.lastInsertRowId, attemptId, createdAt, trigger, breathingSeconds };
}

export async function countCravings(attemptId?: number): Promise<number> {
  const db = await getDatabase();
  const row =
    attemptId === undefined
      ? await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM cravings')
      : await db.getFirstAsync<{ total: number }>(
          'SELECT COUNT(*) AS total FROM cravings WHERE attempt_id = ?',
          attemptId,
        );
  return row?.total ?? 0;
}

/** Cravings logged at or after `since`, newest first. */
export async function listCravingsSince(since: number): Promise<Craving[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CravingRow>(
    'SELECT * FROM cravings WHERE created_at >= ? ORDER BY created_at DESC',
    since,
  );
  return rows.map(toCraving);
}
