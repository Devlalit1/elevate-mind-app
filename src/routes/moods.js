const { Router } = require('express');
const { body } = require('express-validator');
const { getMoods, createMood, deleteMood, VALID_MOODS } = require('../controllers/moodsController');
const { validate } = require('../middleware/validate');

const router = Router();

/** GET /api/moods — Retrieve all mood logs */
router.get('/', getMoods);

/** POST /api/moods — Log a new mood */
router.post(
  '/',
  [
    body('mood')
      .trim()
      .notEmpty().withMessage('Mood is required.')
      .isIn(VALID_MOODS).withMessage(`Mood must be one of: ${VALID_MOODS.join(', ')}.`),
    body('note')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Note must be 1000 characters or fewer.'),
  ],
  validate,
  createMood
);

/** DELETE /api/moods/:id — Delete a mood log */
router.delete('/:id', deleteMood);

module.exports = router;
