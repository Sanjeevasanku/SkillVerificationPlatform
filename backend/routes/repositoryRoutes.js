const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repositoryController');
const auth = require('../middleware/authMiddleware');
const studentMiddleware = require('../middleware/studentMiddleware');

/**
 * @route   POST /api/repositories
 * @desc    Verify and submit a new repository
 * @access  Private (Student only)
 */
router.post('/', [auth, studentMiddleware], repositoryController.createRepository);

router.get('/my', auth, repositoryController.getMyRepositories);

<<<<<<< Updated upstream
=======
/**
 * @route   POST /api/repositories/:id/test/start
 * @desc    Start skill test — generates round 1 questions
 * @access  Private (Student only)
 */
router.post('/:id/test/start', [auth, studentMiddleware], testController.startTest);

/**
 * @route   POST /api/repositories/:id/test/evaluate
 * @desc    Evaluate round 1 answers, decide if round 2 needed
 * @access  Private (Student only)
 */
router.post('/:id/test/evaluate', [auth, studentMiddleware], testController.evaluateRound1);

/**
 * @route   POST /api/repositories/:id/test/final
 * @desc    Evaluate round 2 answers and store final score
 * @access  Private (Student only)
 */
router.post('/:id/test/final', [auth, studentMiddleware], testController.evaluateFinal);

>>>>>>> Stashed changes
module.exports = router;

