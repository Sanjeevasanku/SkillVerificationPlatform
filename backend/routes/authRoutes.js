const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET api/auth/github
 * @desc    Redirect to GitHub OAuth
 * @access  Public
 */
router.get('/github', authController.githubAuth);

/**
 * @route   GET api/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback', authController.githubCallback);

/**
 * @route   POST api/auth/login
 * @desc    Authenticate student & get token (Manual Login)
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST api/auth/register
 * @desc    Register a new student
 * @access  Public
 */
router.post('/register', authController.registerStudent);

/**
 * @route   GET api/auth/me
 * @desc    Get current student
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
