const Repository = require('../models/Repository');

/**
 * Generates a dynamic skill profile for a student by aggregating verified repository data.
 * @param {string} studentId - The ID of the student.
 * @returns {Promise<Object>} The aggregated skill profile.
 */
async function generateStudentSkillProfile(studentId) {
    // STEP 1 – Fetch Verified Repositories (skills are populated from Skill collection)
    const repos = await Repository.find({
        student: studentId,
        verificationStatus: 'verified'
    }).select('title description githubLink isFork repoOwnerType skills contributionPercentage verificationStatus verificationReason commitCountByStudent totalCommitCount activeWeeks primaryLanguage stars forks authorshipScore commitConsistencyScore riskBand').populate('skills').lean();

    if (!repos || repos.length === 0) {
        return {
            skills: [],
            categorySummary: []
        };
    }

    // STEP 2 – Merge Skills Across Repositories
    const aggregation = {};
    // Also collect the full skill doc for each name so we can read test scores
    const skillDocsByName = {};

    repos.forEach(repo => {
        const contribution = (repo.contributionPercentage !== undefined && repo.contributionPercentage !== null)
            ? repo.contributionPercentage / 100
            : 1.0;

        repo.skills.forEach(skill => {
            if (!aggregation[skill.name]) {
                aggregation[skill.name] = {
                    category: skill.category,
                    weightedScores: [],
                    totalWeight: 0
                };
            }

            const weightedScore = skill.confidenceScore * contribution;
            aggregation[skill.name].weightedScores.push(weightedScore);
            aggregation[skill.name].totalWeight += contribution;

            // Keep the most recent skill doc (by updatedAt) for test score data
            if (!skillDocsByName[skill.name] ||
                new Date(skill.updatedAt) > new Date(skillDocsByName[skill.name].updatedAt)) {
                skillDocsByName[skill.name] = skill;
            }
        });
    });

    // STEP 3 & 4 & 5 – Compute Final Confidence, Assign Level, and Build Array
    const skillList = [];

    for (const [skillName, data] of Object.entries(aggregation)) {
        let finalConfidence = 0;
        if (data.totalWeight > 0) {
            finalConfidence = data.weightedScores.reduce((a, b) => a + b, 0) / data.totalWeight;
        } else if (data.weightedScores.length > 0) {
            // Simple average if totalWeight is 0 (should rarely happen if contribution is > 0)
            finalConfidence = data.weightedScores.reduce((a, b) => a + b, 0) / data.weightedScores.length;
        }

        finalConfidence = Math.round(finalConfidence * 100) / 100;

        // Skip skills < 0.4
        if (finalConfidence < 0.4) continue;

        let level = '';
        if (finalConfidence >= 0.8) {
            level = 'Advanced';
        } else if (finalConfidence >= 0.6) {
            level = 'Intermediate';
        } else {
            level = 'Beginner';
        }

        // Read test result from the Skill doc (already populated from DB)
        const skillDoc = skillDocsByName[skillName];
        const hasTested = skillDoc && skillDoc.testTakenAt;

        let qaScore = hasTested ? skillDoc.testPercentage : null;
        let finalSkillScore = finalConfidence;
        let validationStatus = 'not-tested';

        if (hasTested) {
            // finalSkillScore = 0.6 * repoConfidence + 0.4 * qaScore
            finalSkillScore = (0.6 * finalConfidence) + (0.4 * qaScore);
            finalSkillScore = Math.round(finalSkillScore * 100) / 100;

            if (Date.now() > new Date(skillDoc.testNextEligibleDate)) {
                validationStatus = 'expired';
            } else {
                validationStatus = 'validated';
            }
        }

        skillList.push({
            name: skillName,
            category: data.category,
            repoConfidence: finalConfidence,
            qaScore: qaScore,
            finalSkillScore: finalSkillScore,
            validationStatus: validationStatus,
            lastTested: hasTested ? skillDoc.testTakenAt : null,
            // Backward compatibility
            confidence: finalSkillScore,
            testResult: hasTested ? {
                score: skillDoc.testScore,
                maxScore: skillDoc.testMaxScore,
                timeTaken: skillDoc.testTimeTaken,
                takenAt: skillDoc.testTakenAt
            } : null
        });
    }

    // Sort by confidence descending
    skillList.sort((a, b) => b.confidence - a.confidence);

    // STEP 6 – Generate Category Summary
    const categoryMap = {};
    skillList.forEach(skill => {
        if (!categoryMap[skill.category]) {
            categoryMap[skill.category] = {
                totalConfidence: 0,
                count: 0
            };
        }
        categoryMap[skill.category].totalConfidence += skill.confidence;
        categoryMap[skill.category].count += 1;
    });

    const categorySummary = Object.entries(categoryMap).map(([category, data]) => ({
        category: category,
        score: Math.round((data.totalConfidence / data.count) * 100) / 100
    }));

    const overallStats = {
        projectCount: repos.length
    };

    return {
        skills: skillList,
        categorySummary: categorySummary,
        overallStats,
        projects: repos
    };
}

module.exports = {
    generateStudentSkillProfile
};
