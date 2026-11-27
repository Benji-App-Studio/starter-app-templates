import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One entry per schema version, in order. Never edit a shipped migration:
 * append a new one (e.g. `ALTER TABLE mixes ADD COLUMN ...`) instead.
 */
const migrations: string[] = [
  `CREATE TABLE mixes (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    sounds TEXT NOT NULL,
    timer_minutes INTEGER,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE sessions (
    id INTEGER PRIMARY KEY NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL,
    timer_minutes INTEGER,
    sounds TEXT NOT NULL,
    rating TEXT
  );
  CREATE INDEX sessions_started_at ON sessions (started_at);`,
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
