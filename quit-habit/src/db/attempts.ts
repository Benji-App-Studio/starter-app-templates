import { getDatabase } from './index';

/**
 * One quit attempt: from the moment the counter started until a slip ended it.
 * The rates are copied from the profile when the attempt starts, so money and
 * units saved stay correct for past attempts even if the user changes them later.
 */
export type Attempt = {
  id: number;
  /** Unix time in milliseconds. */
  startedAt: number;
  /** Null while the attempt is the current one. */
  endedAt: number | null;
  unitsPerDay: number;
  costPerDay: number;
  /** What the user wrote when logging the slip that ended this attempt. */
  note: string | null;
};

type AttemptRow = {
  id: number;
  started_at: number;
  ended_at: number | null;
  units_per_day: number;
  cost_per_day: number;
  note: string | null;
};

function toAttempt(row: AttemptRow): Attempt {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    unitsPerDay: row.units_per_day,
    costPerDay: row.cost_per_day,
    note: row.note,
  };
}

export async function getActiveAttempt(): Promise<Attempt | undefined> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<AttemptRow>(
    'SELECT * FROM attempts WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
  );
  return row ? toAttempt(row) : undefined;
}

/** Newest first. */
export async function listAttempts(): Promise<Attempt[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<AttemptRow>('SELECT * FROM attempts ORDER BY started_at DESC');
  return rows.map(toAttempt);
}

export async function startAttempt(
  startedAt: number,
  unitsPerDay: number,
  costPerDay: number,
): Promise<Attempt> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO attempts (started_at, units_per_day, cost_per_day) VALUES (?, ?, ?)',
    startedAt,
    unitsPerDay,
    costPerDay,
  );
  return { id: result.lastInsertRowId, startedAt, endedAt: null, unitsPerDay, costPerDay, note: null };
}

/** Closes the attempt at `endedAt`, keeping its row for the history screen. */
export async function endAttempt(id: number, endedAt: number, note: string | null): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE attempts SET ended_at = ?, note = ? WHERE id = ?', endedAt, note, id);
}

/** Keeps the live counter in step with rates edited in Settings. */
export async function updateActiveRates(unitsPerDay: number, costPerDay: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE attempts SET units_per_day = ?, cost_per_day = ? WHERE ended_at IS NULL',
    unitsPerDay,
    costPerDay,
  );
}

/** Deletes every attempt and, through the foreign key, every craving. */
export async function clearAttempts(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('PRAGMA foreign_keys = ON; DELETE FROM attempts;');
}
