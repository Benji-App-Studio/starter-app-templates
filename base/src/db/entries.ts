import { getDatabase } from './index';

/**
 * Example table module. A niche copies this file per table:
 * a row type, and one function per query with bound parameters.
 */
export type Entry = {
  id: number;
  title: string;
  /** Unix time in milliseconds. */
  createdAt: number;
};

type EntryRow = {
  id: number;
  title: string;
  created_at: number;
};

function toEntry(row: EntryRow): Entry {
  return { id: row.id, title: row.title, createdAt: row.created_at };
}

export async function listEntries(): Promise<Entry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<EntryRow>('SELECT * FROM entries ORDER BY created_at DESC');
  return rows.map(toEntry);
}

export async function createEntry(title: string): Promise<Entry> {
  const db = await getDatabase();
  const createdAt = Date.now();
  const result = await db.runAsync(
    'INSERT INTO entries (title, created_at) VALUES (?, ?)',
    title,
    createdAt,
  );
  return { id: result.lastInsertRowId, title, createdAt };
}

export async function deleteEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM entries WHERE id = ?', id);
}
