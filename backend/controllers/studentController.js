const Student = require('../models/Student');
const Repository = require('../models/Repository');
const { generateStudentSkillProfile } = require('../services/studentSkillService');

/**
 * Controller to handle student skill profile requests
 */
const getSkillProfile = async (req, res) => {
    try {
        const studentId = req.user.id;

        if (!studentId) {
            return res.status(400).json({ msg: 'Student ID not found in token' });
        }

        const profile = await generateStudentSkillProfile(studentId);

        res.json(profile);
    } catch (err) {
        console.error('Error in getSkillProfile:', err.message);
        res.status(500).send('Server Error');
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
            return res.status(404).json({ msg: 'Student not found' });
        }

        const skillProfile = await generateStudentSkillProfile(student._id);

        // Fetch student's verified projects
        const projects = await Repository.find({
            student: student._id,
            verificationStatus: 'verified'
        }).populate('skills');

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
            projects,
            ...skillProfile
        });
    } catch (err) {
        console.error('Error in getStudentProfileById:', err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getSkillProfile,
    getStudentProfileById
};
