const Student = require('../models/Student');

/**
 * Checks if a student is eligible to take/retake a skill test.
 * @param {string} studentId - The ID of the student.
 * @param {string} skillName - The name of the skill.
 * @throws {Error} If the student is not eligible to retake the test.
 */
async function checkSkillTestEligibility(studentId, skillName) {
    const student = await Student.findById(studentId);
    if (!student) {
        throw new Error('Student not found');
    }

    // Find latest test for that skill
    const lastTest = (student.skillTestScores || [])
        .filter(t => t.skillName === skillName)
        .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))[0];

    if (!lastTest) {
        return true; // No previous test, and startTest will handle initial claimed skill check
    }

    // If previous test exists:
    if (Date.now() < new Date(lastTest.nextEligibleDate)) {
        throw new Error(
            `You can retake this test after ${lastTest.nextEligibleDate.toDateString()}`
        );
    }

    return true; // Eligible
}

module.exports = {
    checkSkillTestEligibility
};
