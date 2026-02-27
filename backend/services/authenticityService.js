/**
 * authenticityService.js
 * Calculates the project authenticity score based on various repository metrics.
 */

/**
 * Derives repository type dynamically
 * @param {object} repo - The repository data
 * @returns {string} - "fork", "organization", or "personal"
 */
function getRepoType(repo) {
    if (repo.isFork) return "fork";
    if (repo.repoOwnerType === "Organization") return "organization";
    return "personal";
}

/**
 * Calculates project authenticity score
 * @param {object} repository - The repository document
 * @returns {number} - Clamped authenticity score (0-1)
 */
const calculateProjectAuthenticity = (repository) => {
    const repoType = getRepoType(repository);

    // 1. Normalize Contribution
    const contributionScore = (repository.contributionPercentage || 0) / 100;

    // 2. Normalize Commit Count (Log Scaling)
    const commitScore = Math.min(
        Math.log((repository.totalCommitCount || 0) + 1) / Math.log(200),
        1
    );

    // 3. Average Skill Confidence
    const avgSkillConfidence = repository.skills && repository.skills.length > 0
        ? repository.skills.reduce((sum, s) => sum + s.confidenceScore, 0) / repository.skills.length
        : 0.2;

    // 4. Repo Quality Score
    const starsScore = Math.min((repository.stars || 0) / 50, 1);
    const forkScore = Math.min((repository.forks || 0) / 20, 1);
    const repoQualityScore = (starsScore + forkScore) / 2;

    // 5. Base Strength
    const baseStrength =
        (0.25 * contributionScore) +
        (0.20 * commitScore) +
        (0.20 * (repository.commitConsistencyScore || 0)) +
        (0.25 * avgSkillConfidence) +
        (0.10 * repoQualityScore);

    let finalScore = baseStrength;

    // Handle Organization Repos
    if (repoType === "organization") {
        const contributionAdjustment = Math.sqrt(contributionScore);
        finalScore = baseStrength * contributionAdjustment;
    }
    // Handle Forked Repos
    else if (repoType === "fork") {
        const forkAdjustment = 0.8;
        const contributionAdjustment = Math.sqrt(contributionScore);
        finalScore = baseStrength * forkAdjustment * contributionAdjustment;
    }
    // Handle Personal Repos
    else if (repoType === "personal") {
        finalScore = baseStrength;
    }

    // 6. Clamp Score and Round
    finalScore = Math.max(0, Math.min(finalScore, 1));
    return parseFloat(finalScore.toFixed(2));
};

module.exports = {
    calculateProjectAuthenticity
};
