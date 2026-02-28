const Student = require('../models/Student');
const Repository = require('../models/Repository');
require('../models/Skill'); // Ensure Skill model is loaded for population
const { generateStudentSkillProfile } = require('./studentSkillService');

/**
 * Search students by a specific skill
 * @param {string} skillName The name of the skill to search for (case-insensitive)
 * @returns {Promise<Array>} Ranked list of students possessing the skill
 */
async function searchStudentsBySkill(skillName) {
    if (!skillName || typeof skillName !== 'string') {
        throw new Error('Invalid skill name provided for search');
    }

    const searchSkillLower = skillName.trim().toLowerCase();

    // Fetch All Students
    const students = await Student.find({ role: 'student' }).lean();

    const matchingStudents = [];

    // Evaluate each student
    for (const student of students) {
        try {
            // Fetch aggregated skill profile
            const profile = await generateStudentSkillProfile(student._id);
            const stSkills = profile.skills || [];

            // Check if student has the queried skill
            const matchingSkill = stSkills.find(s => s.name.toLowerCase() === searchSkillLower);

            if (matchingSkill) {
                matchingStudents.push({
                    studentId: student._id,
                    name: student.fullName || student.githubUsername || 'Unknown',
                    email: student.email,
                    college: student.college,
                    branch: student.branch,
                    graduationYear: student.graduationYear,
                    githubUsername: student.githubUsername,
                    skill: {
                        name: matchingSkill.name,
                        confidence: matchingSkill.confidence, // e.g., 0.85
                        level: matchingSkill.level // e.g., 'Advanced'
                    },
                    totalVerifiedSkills: stSkills.length,
                    projectCount: profile.overallStats?.projectCount || 0
                });
            }
        } catch (err) {
            console.error(`Error processing profile for student ${student._id} during search:`, err.message);
            // Continue with other students even if one fails
        }
    }

    // Sort by confidence DESC
    matchingStudents.sort((a, b) => b.skill.confidence - a.skill.confidence);

    return matchingStudents;
}

module.exports = {
    searchStudentsBySkill
};
