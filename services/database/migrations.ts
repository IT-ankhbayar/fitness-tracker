// Database migration management

import * as SQLite from 'expo-sqlite';
import { MIGRATIONS, SCHEMA_VERSION } from './schema';

/**
 * Get current schema version from settings table
 */
export async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getAllAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      ['schema_version']
    );

    if (result.length > 0) {
      return parseInt(result[0].value, 10);
    }
    return 0; // Fresh database
  } catch (error) {
    console.log('No schema version found, assuming fresh database');
    return 0;
  }
}

/**
 * Update schema version in settings table
 */
export async function updateSchemaVersion(
  db: SQLite.SQLiteDatabase,
  version: number
): Promise<void> {
  const now = Date.now();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
    ['schema_version', version.toString(), now]
  );
}

/**
 * Run all pending migrations
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  console.log(`Current database version: ${currentVersion}`);
  console.log(`Target schema version: ${SCHEMA_VERSION}`);

  if (currentVersion >= SCHEMA_VERSION) {
    console.log('Database is up to date');
    return;
  }

  // Get migrations that need to be applied
  const pendingMigrations = MIGRATIONS.filter(
    (migration) => migration.version > currentVersion && migration.version <= SCHEMA_VERSION
  ).sort((a, b) => a.version - b.version);

  if (pendingMigrations.length === 0) {
    console.log('No migrations to run');
    await updateSchemaVersion(db, SCHEMA_VERSION);
    return;
  }

  console.log(`Running ${pendingMigrations.length} migration(s)...`);

  // Run each migration in a transaction
  for (const migration of pendingMigrations) {
    console.log(`Applying migration ${migration.version}...`);

    try {
      // Run all migration statements
      for (const statement of migration.up) {
        await db.execAsync(statement);
      }

      // Update version after successful migration
      await updateSchemaVersion(db, migration.version);
      console.log(`Migration ${migration.version} completed successfully`);
    } catch (error) {
      console.error(`Migration ${migration.version} failed:`, error);
      throw new Error(`Failed to apply migration ${migration.version}: ${error}`);
    }
  }

  console.log('All migrations completed successfully');
}

/**
 * Rollback to a specific version (for development/testing)
 */
export async function rollbackToVersion(
  db: SQLite.SQLiteDatabase,
  targetVersion: number
): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  if (targetVersion >= currentVersion) {
    console.log('Target version is greater than or equal to current version');
    return;
  }

  // Get migrations to rollback (in reverse order)
  const rollbackMigrations = MIGRATIONS.filter(
    (migration) => migration.version > targetVersion && migration.version <= currentVersion
  ).sort((a, b) => b.version - a.version); // Descending order

  console.log(`Rolling back ${rollbackMigrations.length} migration(s)...`);

  for (const migration of rollbackMigrations) {
    if (!migration.down) {
      throw new Error(`Migration ${migration.version} does not support rollback`);
    }

    console.log(`Rolling back migration ${migration.version}...`);

    try {
      for (const statement of migration.down) {
        await db.execAsync(statement);
      }

      await updateSchemaVersion(db, migration.version - 1);
      console.log(`Rollback of migration ${migration.version} completed`);
    } catch (error) {
      console.error(`Rollback of migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  console.log('Rollback completed successfully');
}
