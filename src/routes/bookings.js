const { Router } = require('express');
const { body } = require('express-validator');
const { getBookings, createBooking, cancelBooking, SESSION_TYPES } = require('../controllers/bookingsController');
const { validate } = require('../middleware/validate');

const router = Router();

// Minimum date: today
const today = () => new Date().toISOString().split('T')[0];

/** GET /api/bookings — Retrieve bookings (optional ?email= filter) */
router.get('/', getBookings);

/** POST /api/bookings — Create a new session booking */
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required.')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('type')
      .trim()
      .notEmpty().withMessage('Session type is required.')
      .isIn(SESSION_TYPES).withMessage(`Session type must be one of: ${SESSION_TYPES.join(', ')}.`),
    body('date')
      .notEmpty().withMessage('Date is required.')
      .isDate().withMessage('Date must be a valid date (YYYY-MM-DD).')
      .custom((value) => {
        if (value < today()) throw new Error('Booking date cannot be in the past.');
        return true;
      }),
  ],
  validate,
  createBooking
);

/** DELETE /api/bookings/:id — Cancel a booking */
router.delete('/:id', cancelBooking);

module.exports = router;
