const mongoose = require('mongoose');

/**
 * Skill model — one document per (student, skill name) pair.
 * Repositories reference skills from this collection via ObjectId array.
 */
const skillSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        required: true
    },

    confidenceScore: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },

    evidence: [String],

    // Skill test score fields (moved from Student.skillTestScores)
    testScore: { type: Number },
    testMaxScore: { type: Number },
    testPercentage: { type: Number },
    testTimeTaken: { type: Number },
    testAttempt: { type: Number, default: 0 },
    testTakenAt: { type: Date },
    testNextEligibleDate: { type: Date }
}, {
    timestamps: true
});

// Compound unique index — (student, name) is the primary key
skillSchema.index({ student: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Skill', skillSchema);
