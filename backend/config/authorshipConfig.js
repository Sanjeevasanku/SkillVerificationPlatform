/**
 * Authorship scoring configuration.
 * Tune thresholds and weights here without changing application code.
 */
module.exports = {
    // Score thresholds for risk band assignment
    thresholds: {
        green: 0.75,   // score >= 0.75 → auto-verify
        amber: 0.45,   // 0.45 <= score < 0.75 → manual review
        // score < 0.45 → red (manual review in Phase A, auto-reject later)
    },

    // Weights for the composite authorship score (must sum to 1.0)
    weights: {
        contribution: 0.35,  // Student contribution percentage
        consistency: 0.30,  // Commit spread & duration
        commitDepth: 0.20,  // Student commit count depth (log-scaled)
        repoMaturity: 0.15,  // Active weeks of development
    },

    // Phase A: false = red goes to review queue
    // Phase C: true  = red is auto-rejected
    strictRejectMode: false
};
