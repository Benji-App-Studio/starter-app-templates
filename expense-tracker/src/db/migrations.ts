import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One entry per schema version, in order. Never edit a shipped migration:
 * append a new one (e.g. `ALTER TABLE expenses ADD COLUMN ...`) instead.
 */
const migrations: string[] = [
  `CREATE TABLE expenses (
    id INTEGER PRIMARY KEY NOT NULL,
    amount_cents INTEGER NOT NULL,
    category_id TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    spent_at INTEGER NOT NULL
  );
  CREATE INDEX expenses_spent_at ON expenses (spent_at);
  CREATE TABLE budgets (
    category_id TEXT PRIMARY KEY NOT NULL,
    limit_cents INTEGER NOT NULL
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
