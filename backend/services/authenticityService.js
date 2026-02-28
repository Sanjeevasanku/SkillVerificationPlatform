/**
 * Calculation logic for Project Authenticity
 * Measures how likely the project is authentic vs a copy/fork with no changes.
 */

/**
 * Calculates an authenticity score for a repository.
 * @param {Object} repoMetadata - Metadata from GitHub
 * @param {number} contributionPercentage - Percentage of commits by the student
 * @returns {number} Score between 0 and 1
 */
exports.calculateAuthenticityScore = (repoMetadata, contributionPercentage) => {
    let score = 0.5; // Base score

    // 1. Contribution Weight (0.4)
    // High contribution is the best indicator of authenticity
    score += (contributionPercentage / 100) * 0.4;

    // 2. Fork Penalty
    // Forked repos are fine as long as they have significant student contributions
    if (repoMetadata.isFork) {
        score -= 0.15;
    }

    // 3. Repository Age & Stars (Proxy for effort/recognition)
    if (repoMetadata.stars > 10) score += 0.05;
    if (repoMetadata.forks > 5) score += 0.05;

    // 4. Activity Check
    // If the repo is archived, we might be slightly more cautious
    if (repoMetadata.isArchived) {
        score -= 0.05;
    }

    // Normalize
    return Math.max(0, Math.min(1, Math.round(score * 100) / 100));
};
