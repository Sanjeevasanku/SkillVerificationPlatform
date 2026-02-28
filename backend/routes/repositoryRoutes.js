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

router.get('/my', auth, repositoryController.getMyRepositories);

module.exports = router;

