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

module.exports = {
    getSkillProfile
};
