const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler } = require('../middleware/errorHandler');

const SESSION_TYPES = [
  'Career Counselling',
  'Mind Wellness Therapy',
  'Resume Review',
  'Interview Prep',
  'Stress Management',
];

/**
 * GET /api/bookings
 * Returns bookings. Optionally filter by email query param.
 */
const getBookings = asyncHandler(async (req, res) => {
  const db = getDb();
  const { email } = req.query;

  let bookings;
  if (email) {
    bookings = db
      .prepare('SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC')
      .all(email.toLowerCase());
  } else {
    bookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100').all();
  }

  res.json({ success: true, count: bookings.length, data: bookings });
});

/**
 * POST /api/bookings
 * Creates a new booking.
 */
const createBooking = asyncHandler(async (req, res) => {
  const { name, email, type, date } = req.body;
  const db = getDb();

  const id = uuidv4();
  const stmt = db.prepare(
    'INSERT INTO bookings (id, name, email, type, date) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(id, name.trim(), email.toLowerCase().trim(), type, date);

  const created = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: created });
});

/**
 * DELETE /api/bookings/:id
 * Cancels a booking by ID.
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM bookings WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: { message: 'Booking not found' } });
  }

  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(id);
  res.json({ success: true, message: 'Booking cancelled.' });
});

module.exports = { getBookings, createBooking, cancelBooking, SESSION_TYPES };
