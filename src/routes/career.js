const { Router } = require('express');
const { body } = require('express-validator');
const { submitAssessment } = require('../controllers/careerController');
const { validate } = require('../middleware/validate');

const router = Router();

const VALID_CATEGORIES = ['tech', 'creative', 'people', 'business'];

/** POST /api/career-assessment — Submit quiz answers */
router.post(
  '/',
  [
    body('answers')
      .isArray({ min: 1, max: 20 }).withMessage('Answers must be an array of 1–20 items.'),
    body('answers.*')
      .isIn(VALID_CATEGORIES)
      .withMessage(`Each answer must be one of: ${VALID_CATEGORIES.join(', ')}.`),
  ],
  validate,
  submitAssessment
);

module.exports = router;
