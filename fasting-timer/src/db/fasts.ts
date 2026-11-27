import { getDatabase } from './index';

/** One fast. `endedAt` is null while it is running; only one fast runs at a time. */
export type Fast = {
  id: number;
  protocolId: string;
  /** Snapshot of the plan's fasting hours when the fast was logged. */
  goalHours: number;
  /** Unix time in milliseconds. */
  startedAt: number;
  endedAt: number | null;
};

export type FastInput = Omit<Fast, 'id'>;

type FastRow = {
  id: number;
  protocol_id: string;
  goal_hours: number;
  started_at: number;
  ended_at: number | null;
};

function toFast(row: FastRow): Fast {
  return {
    id: row.id,
    protocolId: row.protocol_id,
    goalHours: row.goal_hours,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

/** Finished fasts, newest first. */
export async function listFasts(): Promise<Fast[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<FastRow>(
    'SELECT * FROM fasts WHERE ended_at IS NOT NULL ORDER BY started_at DESC',
  );
  return rows.map(toFast);
}

export async function getActiveFast(): Promise<Fast | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<FastRow>(
    'SELECT * FROM fasts WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
  );
  return row ? toFast(row) : null;
}

export async function getFast(id: number): Promise<Fast | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<FastRow>('SELECT * FROM fasts WHERE id = ?', id);
  return row ? toFast(row) : null;
}

export async function createFast(input: FastInput): Promise<Fast> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO fasts (protocol_id, goal_hours, started_at, ended_at) VALUES (?, ?, ?, ?)',
    input.protocolId,
    input.goalHours,
    input.startedAt,
    input.endedAt,
  );
  return { id: result.lastInsertRowId, ...input };
}

export async function updateFast(id: number, input: FastInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE fasts SET protocol_id = ?, goal_hours = ?, started_at = ?, ended_at = ? WHERE id = ?',
    input.protocolId,
    input.goalHours,
    input.startedAt,
    input.endedAt,
    id,
  );
}

export async function deleteFast(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM fasts WHERE id = ?', id);
}

export async function deleteAllFasts(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM fasts');
}
