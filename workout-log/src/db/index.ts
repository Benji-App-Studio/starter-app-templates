import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migrate } from './migrations';

const DATABASE_NAME = 'app.db';

let database: Promise<SQLiteDatabase> | undefined;

/** The app database, opened and migrated on first use. */
export function getDatabase(): Promise<SQLiteDatabase> {
  database ??= openDatabaseAsync(DATABASE_NAME).then(async (db) => {
    await db.execAsync('PRAGMA journal_mode = WAL');
    await db.execAsync('PRAGMA foreign_keys = ON');
    await migrate(db);
    return db;
  });
  return database;
}
