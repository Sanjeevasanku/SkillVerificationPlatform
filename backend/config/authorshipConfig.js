/**
 * Authorship scoring configuration.
 * Tune thresholds and weights here without changing application code.
 */
module.exports = {
    // Score thresholds for risk band assignment
    thresholds: {
        green: 0.70,   // score >= 0.70 → auto-verify
        amber: 0.40,   // 0.40 <= score < 0.70 → manual review
        // score < 0.40 → red (manual review in Phase A, auto-reject later)
    },

    // Weights for the composite authorship score (must sum to 1.0)
    weights: {
        contribution: 0.10,  // Student contribution percentage
        consistency: 0.70,   // Commit spread & duration (Primary Driver)
        commitDepth: 0.15,   // Size-adjusted commit volume
        repoMaturity: 0.05,  // Active weeks of development
    },

    // Phase A: false = red goes to review queue
    // Phase C: true  = red is auto-rejected
    strictRejectMode: false
};
