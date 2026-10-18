const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure the data directory exists
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'elevatemind.db');

let db;

/**
 * Initializes the SQLite database and creates tables if they don't exist.
 * @returns {Database} The database instance.
 */
function initializeDatabase() {
  if (db) return db;

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrency and performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS mood_logs (
      id         TEXT PRIMARY KEY,
      mood       TEXT NOT NULL,
      note       TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      type       TEXT NOT NULL,
      date       TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_mood_logs_created_at  ON mood_logs (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bookings_email        ON bookings  (email);
  `);

  logger.info(`Database initialized at: ${DB_PATH}`);
  return db;
}

/**
 * Returns the active database instance (initializes if needed).
 * @returns {Database}
 */
function getDb() {
  return db || initializeDatabase();
}

/**
 * Gracefully closes the database connection.
 */
function closeDatabase() {
  if (db && db.open) {
    db.close();
    logger.info('Database connection closed.');
  }
}

module.exports = { initializeDatabase, getDb, closeDatabase };
