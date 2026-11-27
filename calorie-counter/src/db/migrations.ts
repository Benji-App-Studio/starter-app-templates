import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One entry per schema version, in order. Never edit a shipped migration:
 * append a new one (e.g. `ALTER TABLE food_logs ADD COLUMN ...`) instead.
 */
const migrations: string[] = [
  `CREATE TABLE food_logs (
    id INTEGER PRIMARY KEY NOT NULL,
    day TEXT NOT NULL,
    meal TEXT NOT NULL,
    name TEXT NOT NULL,
    servings REAL NOT NULL,
    calories INTEGER NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX food_logs_day ON food_logs (day);`,
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
