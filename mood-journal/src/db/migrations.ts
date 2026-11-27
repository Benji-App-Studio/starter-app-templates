import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One entry per schema version, in order. Never edit a shipped migration:
 * append a new one (e.g. `ALTER TABLE check_ins ADD COLUMN ...`) instead.
 */
const migrations: string[] = [
  `CREATE TABLE check_ins (
    id INTEGER PRIMARY KEY NOT NULL,
    day TEXT NOT NULL UNIQUE,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    note TEXT NOT NULL DEFAULT '',
    note_kind TEXT NOT NULL DEFAULT 'free',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE check_in_tags (
    check_in_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (check_in_id, tag)
  );`,
];

/** Bring the database up to the latest schema version. Safe to run on every launch. */
export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (let version = currentVersion; version < migrations.length; version += 1) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migrations[version]);
      await txn.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
