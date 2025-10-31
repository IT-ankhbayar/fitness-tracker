// Database service - Handles SQLite initialization and operations

import * as SQLite from 'expo-sqlite';
import {
  CREATE_TABLES,
  CREATE_INDEXES,
  DEFAULT_SETTINGS_DATA,
  DROP_ALL_TABLES,
} from './schema';
import { runMigrations } from './migrations';

const DATABASE_NAME = 'pulselift.db';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized: boolean = false;

  /**
   * Initialize database connection and create tables
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.log('Database already initialized');
      return;
    }

    try {
      console.log('Initializing database...');

      // Open database connection
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');

      // Create all tables
      await this.createTables();

      // Create indexes
      await this.createIndexes();

      // Run any pending migrations
      await runMigrations(this.db);

      // Insert default settings if needed
      await this.insertDefaultSettings();

      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error(`Database initialization failed: ${error}`);
    }
  }

  /**
   * Get database instance
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create all tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('Creating tables...');

    for (const createTableSQL of CREATE_TABLES) {
      await this.db.execAsync(createTableSQL);
    }

    console.log('Tables created successfully');
  }

  /**
   * Create indexes for performance
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('Creating indexes...');

    for (const indexSQL of CREATE_INDEXES) {
      await this.db.execAsync(indexSQL);
    }

    console.log('Indexes created successfully');
  }

  /**
   * Insert default settings if they don't exist
   */
  private async insertDefaultSettings(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();

    for (const setting of DEFAULT_SETTINGS_DATA) {
      // Check if setting exists
      const existing = await this.db.getAllAsync<{ key: string }>(
        'SELECT key FROM settings WHERE key = ?',
        [setting.key]
      );

      if (existing.length === 0) {
        // Insert default setting
        await this.db.runAsync(
          'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
          [setting.key, setting.value, now]
        );
      }
    }

    console.log('Default settings initialized');
  }

  /**
   * Execute a raw SQL query (for SELECT queries)
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      return await this.db.getAllAsync<T>(sql, params);
    } catch (error) {
      console.error('Query failed:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute a raw SQL statement (for INSERT, UPDATE, DELETE)
   */
  async execute(sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      return await this.db.runAsync(sql, params);
    } catch (error) {
      console.error('Execute failed:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute multiple statements (for migrations, batch operations)
   */
  async executeBatch(sql: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.execAsync(sql);
    } catch (error) {
      console.error('Batch execute failed:', error);
      throw error;
    }
  }

  /**
   * Run a transaction
   */
  async transaction<T>(
    callback: (db: SQLite.SQLiteDatabase) => Promise<T>
  ): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.execAsync('BEGIN TRANSACTION;');
      const result = await callback(this.db);
      await this.db.execAsync('COMMIT;');
      return result;
    } catch (error) {
      await this.db.execAsync('ROLLBACK;');
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
      console.log('Database connection closed');
    }
  }

  /**
   * Reset database (for development/testing only)
   * WARNING: This will delete all data!
   */
  async reset(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.warn('Resetting database - all data will be lost!');

    // Drop all tables
    for (const dropSQL of DROP_ALL_TABLES) {
      await this.db.execAsync(dropSQL);
    }

    // Recreate tables
    await this.createTables();
    await this.createIndexes();
    await this.insertDefaultSettings();

    console.log('Database reset complete');
  }

  /**
   * Get database statistics (for debugging)
   */
  async getStats(): Promise<{
    exerciseCount: number;
    workoutCount: number;
    setCount: number;
    prCount: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [exercises] = await this.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises'
    );
    const [workouts] = await this.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM workouts'
    );
    const [sets] = await this.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM sets'
    );
    const [prs] = await this.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM personal_records'
    );

    return {
      exerciseCount: exercises.count,
      workoutCount: workouts.count,
      setCount: sets.count,
      prCount: prs.count,
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Export types
export type { DatabaseService };
