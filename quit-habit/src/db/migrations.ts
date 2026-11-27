import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One entry per schema version, in order. Never edit a shipped migration:
 * append a new one (e.g. `ALTER TABLE attempts ADD COLUMN ...`) instead.
 */
const migrations: string[] = [
  `CREATE TABLE attempts (
    id INTEGER PRIMARY KEY NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    units_per_day REAL NOT NULL,
    cost_per_day REAL NOT NULL,
    note TEXT
  );`,
  `CREATE TABLE cravings (
    id INTEGER PRIMARY KEY NOT NULL,
    attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    trigger TEXT,
    breathing_seconds INTEGER NOT NULL
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
