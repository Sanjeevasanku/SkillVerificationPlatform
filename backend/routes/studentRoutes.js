const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getSkillProfile, getStudentProfileById } = require('../controllers/studentController');
const hrMiddleware = require('../middleware/hrMiddleware');

// @route   GET api/students/skill-profile
// @desc    Get aggregated skill profile of the logged-in student
// @access  Protected
router.get('/skill-profile', auth, getSkillProfile);

// @route   GET api/students/:id
// @desc    Get student profile by ID
// @access  Private (HR/Admin)
router.get('/:id', [auth, hrMiddleware], getStudentProfileById);

module.exports = router;
