const { generateStudentSkillProfile } = require('../services/studentSkillService');
const Student = require('../models/Student');

/**
 * Controller to handle student skill profile requests
 */
const getSkillProfile = async (req, res) => {
    try {
        const studentId = req.user.id;

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID not found in token' });
        }

        const profile = await generateStudentSkillProfile(studentId);

        res.json(profile);
    } catch (err) {
        console.error('Error in getSkillProfile:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get student profile by ID
 * @route   GET /api/students/:id
 * @access  Private (HR/Admin)
 */
const getStudentProfileById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-githubAccessToken');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const skillProfile = await generateStudentSkillProfile(student._id);

        res.json({
            student: {
                id: student._id,
                fullName: student.fullName,
                email: student.email,
                college: student.college,
                branch: student.branch,
                graduationYear: student.graduationYear,
                githubUsername: student.githubUsername
            },
            ...skillProfile
        });
    } catch (err) {
        console.error('Error in getStudentProfileById:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSkillProfile,
    getStudentProfileById
};
