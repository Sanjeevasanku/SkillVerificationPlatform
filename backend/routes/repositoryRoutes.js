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

router.get('/my', [auth, studentMiddleware], repositoryController.getMyRepositories);


module.exports = router;

