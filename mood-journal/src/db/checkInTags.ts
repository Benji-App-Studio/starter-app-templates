import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from './index';

/** How often a tag was picked in a period, and the mean mood on those days. */
export type TagStat = {
  tag: string;
  count: number;
  averageScore: number;
};

type TagRow = { check_in_id: number; tag: string };
type TagStatRow = { tag: string; count: number; average_score: number };

/** Tags grouped by check-in id. The caller passes the db so this can run inside its transaction. */
export async function listTagsByCheckIn(
  db: SQLiteDatabase,
  checkInIds: number[],
): Promise<Map<number, string[]>> {
  const grouped = new Map<number, string[]>();
  if (checkInIds.length === 0) {
    return grouped;
  }
  const placeholders = checkInIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<TagRow>(
    `SELECT check_in_id, tag FROM check_in_tags WHERE check_in_id IN (${placeholders}) ORDER BY tag`,
    ...checkInIds,
  );
  for (const row of rows) {
    const tags = grouped.get(row.check_in_id) ?? [];
    tags.push(row.tag);
    grouped.set(row.check_in_id, tags);
  }
  return grouped;
}

export async function replaceTags(db: SQLiteDatabase, checkInId: number, tags: string[]): Promise<void> {
  await db.runAsync('DELETE FROM check_in_tags WHERE check_in_id = ?', checkInId);
  for (const tag of tags) {
    await db.runAsync('INSERT INTO check_in_tags (check_in_id, tag) VALUES (?, ?)', checkInId, tag);
  }
}

/** Tag frequency and mean mood between two days (inclusive), most used first. */
export async function listTagStats(fromDay: string, toDay: string): Promise<TagStat[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TagStatRow>(
    `SELECT t.tag AS tag, COUNT(*) AS count, AVG(c.score) AS average_score
     FROM check_in_tags t
     JOIN check_ins c ON c.id = t.check_in_id
     WHERE c.day BETWEEN ? AND ?
     GROUP BY t.tag
     ORDER BY count DESC, t.tag ASC`,
    fromDay,
    toDay,
  );
  return rows.map((row) => ({ tag: row.tag, count: row.count, averageScore: row.average_score }));
}
