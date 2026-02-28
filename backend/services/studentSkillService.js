const Repository = require('../models/Repository');

/**
 * Generates a dynamic skill profile for a student by aggregating verified repository data.
 * @param {string} studentId - The ID of the student.
 * @returns {Promise<Object>} The aggregated skill profile.
 */
async function generateStudentSkillProfile(studentId) {
    // STEP 1 – Fetch Verified Repositories
    const repos = await Repository.find({
        student: studentId,
        verificationStatus: 'verified'
    }).select('skills contributionPercentage commitConsistencyScore projectAuthenticityScore').lean();

    if (!repos || repos.length === 0) {
        return {
            skills: [],
            categorySummary: []
        };
    }

    // STEP 2 – Merge Skills Across Repositories
    const aggregation = {};

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

        skillList.push({
            name: skillName,
            category: data.category,
            confidence: finalConfidence,
            level: level
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

    // STEP 7 – Calculate Overall Aggregate Stats
    const verifiedRepos = repos.filter(r => r.commitConsistencyScore !== undefined);
    const projectCount = verifiedRepos.length;

    const totalConsistency = verifiedRepos.reduce((sum, r) => sum + (r.commitConsistencyScore || 0), 0);
    const totalAuthenticity = verifiedRepos.reduce((sum, r) => sum + (r.projectAuthenticityScore || 0), 0);

    const overallStats = {
        averageConsistency: projectCount > 0 ? Math.round((totalConsistency / projectCount) * 100) / 100 : 0,
        averageAuthenticity: projectCount > 0 ? Math.round((totalAuthenticity / projectCount) * 100) / 100 : 0,
        projectCount
    };

    return {
        skills: skillList,
        categorySummary: categorySummary,
        overallStats
    };
}

module.exports = {
    generateStudentSkillProfile
};
