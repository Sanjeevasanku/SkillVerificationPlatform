const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getSkillProfile } = require('../controllers/studentController');

// @route   GET api/students/skill-profile
// @desc    Get aggregated skill profile of the logged-in student
// @access  Protected
router.get('/skill-profile', auth, getSkillProfile);

module.exports = router;
