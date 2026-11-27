import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One entry per schema version, in order. Never edit a shipped migration:
 * append a new one (e.g. `ALTER TABLE drinks ADD COLUMN ...`) instead.
 */
const migrations: string[] = [
  `CREATE TABLE drinks (
    id INTEGER PRIMARY KEY NOT NULL,
    day TEXT NOT NULL,
    amount_ml INTEGER NOT NULL,
    logged_at INTEGER NOT NULL
  );
  CREATE INDEX drinks_day ON drinks (day);
  CREATE TABLE day_goals (
    day TEXT PRIMARY KEY NOT NULL,
    goal_ml INTEGER NOT NULL
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
