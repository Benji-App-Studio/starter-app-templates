import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One entry per schema version, in order. Never edit a shipped migration:
 * append a new one (e.g. `ALTER TABLE habits ADD COLUMN ...`) instead.
 */
const migrations: string[] = [
  `CREATE TABLE habits (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    days TEXT NOT NULL,
    reminder_time TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE completions (
    id INTEGER PRIMARY KEY NOT NULL,
    habit_id INTEGER NOT NULL REFERENCES habits(id),
    day TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE (habit_id, day)
  );
  CREATE INDEX completions_day ON completions (day);`,
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
