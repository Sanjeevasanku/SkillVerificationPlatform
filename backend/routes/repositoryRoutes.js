const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repositoryController');
const testController = require('../controllers/testController');
const auth = require('../middleware/authMiddleware');

/**
 * @route   POST /api/repositories
 * @desc    Verify and submit a new repository
 * @access  Private
 */
router.post('/', auth, repositoryController.createRepository);

router.get('/my', auth, repositoryController.getMyRepositories);

/**
 * @route   POST /api/repositories/:id/test/start
 * @desc    Start skill test — generates round 1 questions
 * @access  Private
 */
router.post('/:id/test/start', auth, testController.startTest);

/**
 * @route   POST /api/repositories/:id/test/evaluate
 * @desc    Evaluate round 1 answers, decide if round 2 needed
 * @access  Private
 */
router.post('/:id/test/evaluate', auth, testController.evaluateRound1);

/**
 * @route   POST /api/repositories/:id/test/final
 * @desc    Evaluate round 2 answers and store final score
 * @access  Private
 */
router.post('/:id/test/final', auth, testController.evaluateFinal);

module.exports = router;
