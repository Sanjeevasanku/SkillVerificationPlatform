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
 * @route   POST api/auth/hr/login
 * @desc    Authenticate HR & get token
 * @access  Public
 */
router.post('/hr/login', authController.hrLogin);

/**
 * @route   POST api/auth/register
 * @desc    Register a new student
 * @access  Public
 */
router.post('/register', authController.registerStudent);

/**
 * @route   POST api/auth/admin/login
 * @desc    Authenticate Admin & get token
 * @access  Public
 */
router.post('/admin/login', authController.adminLogin);

/**
 * @route   POST api/auth/admin/register
 * @desc    Register a new admin
 * @access  Public
 */
router.post('/admin/register', authController.adminRegister);

/**
 * @route   GET api/auth/me
 * @desc    Get current user (Student, HR, or Admin)
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
