const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler } = require('../middleware/errorHandler');

const VALID_MOODS = ['Energized', 'Calm', 'Stressed', 'Overwhelmed', 'Focused', 'Anxious', 'Happy', 'Sad'];

/**
 * GET /api/moods
 * Returns all mood logs, most recent first.
 */
const getMoods = asyncHandler(async (req, res) => {
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const moods = db.prepare('SELECT * FROM mood_logs ORDER BY created_at DESC LIMIT ?').all(limit);

  res.json({ success: true, count: moods.length, data: moods });
});

/**
 * POST /api/moods
 * Creates a new mood log entry.
 */
const createMood = asyncHandler(async (req, res) => {
  const { mood, note } = req.body;
  const db = getDb();

  const id = uuidv4();
  const stmt = db.prepare(
    'INSERT INTO mood_logs (id, mood, note) VALUES (?, ?, ?)'
  );
  stmt.run(id, mood, note || '');

  const created = db.prepare('SELECT * FROM mood_logs WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: created });
});

/**
 * DELETE /api/moods/:id
 * Deletes a single mood log by ID.
 */
const deleteMood = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM mood_logs WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: { message: 'Mood log not found' } });
  }

  db.prepare('DELETE FROM mood_logs WHERE id = ?').run(id);
  res.json({ success: true, message: 'Mood log deleted.' });
});

module.exports = { getMoods, createMood, deleteMood, VALID_MOODS };
