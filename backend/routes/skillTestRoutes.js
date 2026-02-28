const express = require('express');
const router = express.Router();
const skillTestController = require('../controllers/skillTestController');
const auth = require('../middleware/authMiddleware');
const studentMiddleware = require('../middleware/studentMiddleware');

/**
 * @route   POST /api/skills/test/start
 * @desc    Start skill test — generates round 1 questions for a single skill
 * @access  Private (Student only)
 */
router.post('/test/start', [auth, studentMiddleware], skillTestController.startTest);

/**
 * @route   POST /api/skills/test/evaluate
 * @desc    Evaluate round 1 answers, decide if round 2 needed
 * @access  Private (Student only)
 */
router.post('/test/evaluate', [auth, studentMiddleware], skillTestController.evaluateRound1);

/**
 * @route   POST /api/skills/test/final
 * @desc    Evaluate round 2 answers and store final score
 * @access  Private (Student only)
 */
router.post('/test/final', [auth, studentMiddleware], skillTestController.evaluateFinal);

module.exports = router;
