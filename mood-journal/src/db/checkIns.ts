import { listTagsByCheckIn, replaceTags } from './checkInTags';
import { getDatabase } from './index';

/** The five-point mood scale, 1 = awful … 5 = great. */
export type MoodScore = 1 | 2 | 3 | 4 | 5;

/** What the note is: a gratitude line or free writing. Changes the prompt, not the storage. */
export type NoteKind = 'gratitude' | 'free';

/** One day's check-in. There is at most one per calendar day. */
export type CheckIn = {
  id: number;
  /** Local calendar day, `YYYY-MM-DD`. */
  day: string;
  score: MoodScore;
  note: string;
  noteKind: NoteKind;
  tags: string[];
  /** Unix time in milliseconds. */
  createdAt: number;
  updatedAt: number;
};

export type CheckInInput = Pick<CheckIn, 'day' | 'score' | 'note' | 'noteKind' | 'tags'>;

type CheckInRow = {
  id: number;
  day: string;
  score: number;
  note: string;
  note_kind: string;
  created_at: number;
  updated_at: number;
};

const SCORES: readonly MoodScore[] = [1, 2, 3, 4, 5];

function toScore(value: number): MoodScore {
  return SCORES.find((score) => score === value) ?? 3;
}

function toCheckIn(row: CheckInRow, tags: string[]): CheckIn {
  return {
    id: row.id,
    day: row.day,
    score: toScore(row.score),
    note: row.note,
    noteKind: row.note_kind === 'gratitude' ? 'gratitude' : 'free',
    tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCheckIn(day: string): Promise<CheckIn | undefined> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CheckInRow>('SELECT * FROM check_ins WHERE day = ?', day);
  if (!row) {
    return undefined;
  }
  const tags = await listTagsByCheckIn(db, [row.id]);
  return toCheckIn(row, tags.get(row.id) ?? []);
}

/** Check-ins between two days (inclusive), newest first. */
export async function listCheckIns(fromDay: string, toDay: string): Promise<CheckIn[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CheckInRow>(
    'SELECT * FROM check_ins WHERE day BETWEEN ? AND ? ORDER BY day DESC',
    fromDay,
    toDay,
  );
  const tags = await listTagsByCheckIn(
    db,
    rows.map((row) => row.id),
  );
  return rows.map((row) => toCheckIn(row, tags.get(row.id) ?? []));
}

/** Every day with a check-in, oldest first. Enough for streaks without loading notes. */
export async function listCheckInDays(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ day: string }>('SELECT day FROM check_ins ORDER BY day ASC');
  return rows.map((row) => row.day);
}

export async function countCheckIns(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM check_ins');
  return row?.count ?? 0;
}

/** Creates the day's check-in or replaces it; a day never has two. */
export async function saveCheckIn(input: CheckInInput): Promise<CheckIn> {
  const db = await getDatabase();
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO check_ins (day, score, note, note_kind, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(day) DO UPDATE SET
         score = excluded.score,
         note = excluded.note,
         note_kind = excluded.note_kind,
         updated_at = excluded.updated_at`,
      input.day,
      input.score,
      input.note.trim(),
      input.noteKind,
      now,
      now,
    );
    const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM check_ins WHERE day = ?', input.day);
    if (row) {
      await replaceTags(db, row.id, input.tags);
    }
  });
  const saved = await getCheckIn(input.day);
  if (!saved) {
    throw new Error(`Check-in for ${input.day} was not saved`);
  }
  return saved;
}

export async function deleteCheckIn(id: number): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM check_in_tags WHERE check_in_id = ?', id);
    await db.runAsync('DELETE FROM check_ins WHERE id = ?', id);
  });
}

export async function deleteAllCheckIns(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM check_in_tags');
    await db.runAsync('DELETE FROM check_ins');
  });
}
