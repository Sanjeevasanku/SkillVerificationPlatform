/**
 * authorshipService.js
 * Computes a composite authorship score (0–1) from verification + consistency data,
 * then maps it to a risk band (green / amber / red) via config thresholds.
 */
const config = require('../config/authorshipConfig');

/**
 * Compute authorship score and risk band.
 *
 * @param {object} verificationResult - From verificationService
 * @param {object} consistencyResult - From consistencyService
 * @returns {{ score: number, riskBand: 'green'|'amber'|'red' }}
 */
function computeAuthorshipScore(verificationResult, consistencyResult) {
    const { weights, thresholds } = config;

    // Rule 2: Non-individual repos (Forks, Organization repos) auto-verify (Green) for now.
    // Assuming verificationService passes repoOwnerType (or we can pass isFork/isPersonal)
    const { repoOwnerType, isFork, sizeKB = 0 } = verificationResult;

    if (isFork || repoOwnerType === 'Organization') {
        return { score: 1.0, riskBand: 'green' };
    }

    // --- Signal 1: Contribution (0–1) ---
    const contributionSignal = Math.min((verificationResult.contributionPercentage || 0) / 100, 1);

    // --- Signal 2: Commit Consistency (0–1, already computed) ---
    const consistencySignal = consistencyResult.consistencyScore || 0;

    // --- Signal 3: Commits vs Codebase Size ---
    // Rule 1: Flag repos with low commits relative to project size (KB).
    const studentCommits = verificationResult.commitCountByStudent || 0;

    let commitDepthSignal = 1.0;

    // Very small repos (< 10KB) are often just 1-2 files or a readme, 1 commit is fine.
    // For larger repos, we expect more commits.
    if (sizeKB > 50) {
        // e.g., A 500KB codebase should probably have more than 2 commits.
        // Let's define an expected commits ratio: roughly 1 commit per 50KB of code.
        const expectedCommits = Math.max(1, Math.floor(sizeKB / 50));
        // Calculate ratio
        const ratio = studentCommits / expectedCommits;

        // Cap signal at 1.0. If they have much less than expected, risk goes up (score goes down).
        commitDepthSignal = Math.min(ratio, 1.0);
    } else {
        // For tiny repos, if they have at least 1 commit, they are fine.
        commitDepthSignal = studentCommits > 0 ? 1.0 : 0.0;
    }

    // --- Signal 4: Repo Maturity (active weeks capped at 8) ---
    const activeWeeks = consistencyResult.activeWeeks || 0;
    const maturitySignal = Math.min(activeWeeks / 8, 1);

    // --- Weighted sum ---
    let score =
        (weights.contribution * contributionSignal) +
        (weights.consistency * consistencySignal) +
        (weights.commitDepth * commitDepthSignal) +
        (weights.repoMaturity * maturitySignal);

    // Clamp to [0, 1]
    score = Math.max(0, Math.min(score, 1));
    score = parseFloat(score.toFixed(3));

    // --- Map to risk band ---
    let riskBand;
    if (score >= thresholds.green) {
        riskBand = 'green';
    } else if (score >= thresholds.amber) {
        riskBand = 'amber';
    } else {
        riskBand = 'red';
    }

    return { score, riskBand };
}

module.exports = { computeAuthorshipScore };
