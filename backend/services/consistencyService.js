/**
 * Calculation logic for Commit Consistency
 * Measures how regularly a student commits over time.
 */

/**
 * Calculates a consistency score from a list of commit dates.
 * @param {Date[]} commitDates - Array of Date objects
 * @returns {Object} { consistencyScore, activeWeeks, firstCommitDate, lastCommitDate }
 */
exports.calculateCommitConsistency = (commitDates) => {
    if (!commitDates || commitDates.length < 2) {
        return {
            consistencyScore: 0,
            activeWeeks: 0,
            firstCommitDate: commitDates && commitDates.length > 0 ? commitDates[0] : null,
            lastCommitDate: commitDates && commitDates.length > 0 ? commitDates[commitDates.length - 1] : null
        };
    }

    // Sort dates ascending
    const sortedDates = [...commitDates].sort((a, b) => a - b);
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    // Total duration in days
    const totalDurationMs = lastDate - firstDate;
    const totalDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)) + 1;

    // Group commits by week (year-week string)
    const weeksSet = new Set();
    sortedDates.forEach(date => {
        const d = new Date(date);
        // Get start of week
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        weeksSet.add(d.toISOString().split('T')[0]);
    });

    const activeWeeks = weeksSet.size;
    const totalWeeksInPeriod = Math.ceil(totalDays / 7);

    // Spread factor: percentage of weeks with activity vs total duration in weeks
    let spreadFactor = activeWeeks / totalWeeksInPeriod;
    if (spreadFactor > 1) spreadFactor = 1;

    // Intensity bonus: volume of commits (capped at 50 commits for max bonus)
    const intensityBonus = Math.min(sortedDates.length / 50, 1) * 0.2;

    // Duration factor: more weight for projects that lasted longer (capped at 12 weeks)
    const durationFactor = Math.min(totalWeeksInPeriod / 12, 1) * 0.3;

    // Final Score: (Spread * 0.5) + (Intensity * 0.2) + (Duration * 0.3)
    let finalScore = (spreadFactor * 0.5) + intensityBonus + durationFactor;

    // Normalize to 0-1
    finalScore = Math.max(0, Math.min(1, finalScore));

    return {
        consistencyScore: Math.round(finalScore * 100) / 100,
        activeWeeks,
        firstCommitDate: firstDate,
        lastCommitDate: lastDate
    };
};
