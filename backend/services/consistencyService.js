/**
 * consistencyService.js
 * Calculates the commit consistency score based on commit history.
 */

/**
 * Calculates commit consistency score
 * @param {Array<Date>} commitDates - Array of commit dates
 * @returns {object} Consistency results
 */
const calculateCommitConsistency = (commitDates) => {
    if (!commitDates || commitDates.length === 0) {
        return {
            consistencyScore: 0,
            firstCommitDate: null,
            lastCommitDate: null,
            activeWeeks: 0
        };
    }

    // 1. Sort commit dates ascending
    const sortedDates = [...commitDates].sort((a, b) => a - b);
    const firstCommitDate = sortedDates[0];
    const lastCommitDate = sortedDates[sortedDates.length - 1];

    // 2. Calculate Duration
    const durationMs = lastCommitDate - firstCommitDate;
    const durationDays = durationMs / (1000 * 60 * 60 * 24);

    let earlyPenalty = false;
    if (durationDays < 3) {
        earlyPenalty = true;
    }

    // 3. Group commits by week
    const weekMap = new Map();
    sortedDates.forEach(date => {
        const weekIndex = Math.floor((date - firstCommitDate) / (7 * 24 * 60 * 60 * 1000));
        weekMap.set(weekIndex, (weekMap.get(weekIndex) || 0) + 1);
    });

    // 4. Compute active weeks
    const activeWeeks = weekMap.size;

    // 5. Spread Factor (Reward 4+ active weeks, regardless of how long the gap between them was)
    const spreadFactor = Math.min(activeWeeks / 4, 1.0);

    // 6. Duration Score (Reward projects spanning >= 30 days instead of 60 to be fairer)
    const durationScore = Math.min(durationDays / 30, 1.0);

    // 7. Final Consistency Score
    // Weight spread heavily, but if it spans over a month, give a small bonus
    let consistencyScore = (0.8 * spreadFactor) + (0.2 * durationScore);

    // If all commits were dumped in under 3 days, cap the score and penalize
    if (earlyPenalty) {
        consistencyScore = Math.min(consistencyScore, 0.4);
    }

    // Clamp between 0-1
    consistencyScore = Math.max(0, Math.min(consistencyScore, 1));

    return {
        consistencyScore: parseFloat(consistencyScore.toFixed(2)),
        firstCommitDate,
        lastCommitDate,
        activeWeeks
    };
};

module.exports = {
    calculateCommitConsistency
};
