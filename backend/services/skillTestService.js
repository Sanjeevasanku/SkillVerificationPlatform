const Skill = require('../models/Skill');

/**
 * Checks if a student is eligible to take/retake a skill test.
 * @param {string} studentId - The ID of the student.
 * @param {string} skillName - The name of the skill.
 * @throws {Error} If the student is not eligible to retake the test.
 */
async function checkSkillTestEligibility(studentId, skillName) {
    // Read eligibility from the Skill doc directly
    const skillDoc = await Skill.findOne({ student: studentId, name: skillName });

    if (!skillDoc) {
        throw new Error('Skill not found');
    }

    // No previous test taken for this skill
    if (!skillDoc.testTakenAt) {
        return true;
    }

    // If previous test exists, check the cooldown
    if (Date.now() < new Date(skillDoc.testNextEligibleDate)) {
        throw new Error(
            `You can retake this test after ${skillDoc.testNextEligibleDate.toDateString()}`
        );
    }

    return true; // Eligible
}

module.exports = {
    checkSkillTestEligibility
};
