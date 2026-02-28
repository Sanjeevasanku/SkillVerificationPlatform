const Role = require('../models/Role');
const Student = require('../models/Student');
const { generateStudentSkillProfile } = require('./studentSkillService');

/**
 * Calculate role readiness for all students against a specific role
 * @param {string} roleId The ID of the role to evaluate
 * @returns {Promise<Array>} Ranked list of students with breakdown
 */
async function calculateRoleReadiness(roleId) {
    // 1. Fetch Role
    const role = await Role.findById(roleId);
    if (!role) {
        throw new Error('Role not found');
    }

    if (!role.requiredSkills || role.requiredSkills.length === 0) {
        throw new Error('Role must have at least one required skill');
    }

    // 2. Fetch All Students
    const students = await Student.find({ role: 'student' }).lean();

    const rankedStudents = [];

    // 3. Compute Readiness Per Student
    for (const student of students) {
        // Fetch aggregated skill profile
        const profile = await generateStudentSkillProfile(student._id);
        const stSkills = profile.skills || []; // array of { name, confidence, etc }

        let totalWeight = 0;
        let matchScore = 0;
        let skillBreakdown = [];
        let missingSkills = [];
        let weakSkills = [];

        // Map for O(1) lookups
        const stSkillMap = {};
        stSkills.forEach(s => {
            stSkillMap[s.name.toLowerCase()] = s;
        });

        // 4. Loop Through Required Skills
        for (const reqSkill of role.requiredSkills) {
            const weight = reqSkill.weight || 1;
            totalWeight += weight;

            const skillNameLower = reqSkill.skillName.toLowerCase();
            const studentHasSkill = stSkillMap[skillNameLower];

            if (studentHasSkill) {
                // The formula uses 0.7 * confidence + 0.3 * authenticity. 
                // Since authenticity is removed, we just use confidence.
                const adjustedSkillScore = studentHasSkill.confidence;

                matchScore += (adjustedSkillScore * weight);

                if (adjustedSkillScore < 0.6) {
                    weakSkills.push(reqSkill.skillName);
                }

                skillBreakdown.push({
                    skill: reqSkill.skillName,
                    type: 'required',
                    score: adjustedSkillScore,
                    weight: weight
                });
            } else {
                missingSkills.push(reqSkill.skillName);
                skillBreakdown.push({
                    skill: reqSkill.skillName,
                    type: 'required',
                    score: 0,
                    weight: weight
                });
            }
        }

        // 5. Include Optional Skills
        if (role.optionalSkills && role.optionalSkills.length > 0) {
            for (const optSkill of role.optionalSkills) {
                const weight = optSkill.weight || 0.5;
                const skillNameLower = optSkill.skillName.toLowerCase();
                const studentHasSkill = stSkillMap[skillNameLower];

                if (studentHasSkill) {
                    const adjustedSkillScore = studentHasSkill.confidence;

                    // Match score increases, but total weight does not (bonus)
                    matchScore += (adjustedSkillScore * weight);

                    skillBreakdown.push({
                        skill: optSkill.skillName,
                        type: 'optional',
                        score: adjustedSkillScore,
                        weight: weight
                    });
                }
            }
        }

        // 6. Normalize Final Score
        // Don't divide by zero just in case
        let readinessScore = totalWeight > 0 ? (matchScore / totalWeight) : 0;

        // Clamp between 0 and 1
        readinessScore = Math.min(Math.max(readinessScore, 0), 1);

        // Round to 2 decimals
        readinessScore = Math.round(readinessScore * 100) / 100;

        // 7. Assign Label
        let label = "Not Ready";
        if (readinessScore >= 0.8) label = "Highly Ready";
        else if (readinessScore >= 0.6) label = "Moderately Ready";
        else if (readinessScore >= 0.4) label = "Slightly Ready";

        // 8. Push to array
        rankedStudents.push({
            studentId: student._id,
            name: student.fullName || student.githubUsername || 'Unknown',
            readinessScore: readinessScore,
            label: label,
            skillBreakdown: skillBreakdown,
            missingSkills: missingSkills,
            weakSkills: weakSkills,
            // Removed avgAuthenticity per implementation plan
        });
    }

    // Sort by readinessScore DESC
    rankedStudents.sort((a, b) => b.readinessScore - a.readinessScore);

    return rankedStudents;
}

module.exports = {
    calculateRoleReadiness
};
