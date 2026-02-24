/**
 * confidenceCalculator.js
 * Calculates confidence score based on evidence types.
 */

const calculateConfidence = (evidenceObject) => {
    const {
        dependencyFound,
        importFound,
        usageFound,
        fileIndicatorFound
    } = evidenceObject;

    let score = 0;

    if (dependencyFound) score += 0.3;
    if (importFound) score += 0.3;
    if (usageFound) score += 0.3;
    if (fileIndicatorFound) score += 0.1;

    // Minimum sanity check: If only file indicator found, cap at 0.1
    // If usage found but no dependency, it's still good (+0.6)

    return Math.min(score, 1.0);
};

module.exports = { calculateConfidence };
