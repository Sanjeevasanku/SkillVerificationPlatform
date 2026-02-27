const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repositoryController');
const auth = require('../middleware/authMiddleware');

/**
 * @route   POST /api/repositories
 * @desc    Verify and submit a new repository
 * @access  Private
 */
router.post('/', auth, repositoryController.createRepository);

/**
 * @route   GET /api/repositories/my
 * @desc    Get student's verified repositories
 * @access  Private
 */
router.get('/my', auth, repositoryController.getMyRepositories);

/**
 * @route   PUT /api/repositories/:id/recalculate
 * @desc    Recalculate scores for a specific repository
 * @access  Private
 */
router.put('/:id/recalculate', auth, repositoryController.recalculateScores);

module.exports = router;
