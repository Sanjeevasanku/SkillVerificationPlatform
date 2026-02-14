const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    techStack: {
        type: [String],
        default: [],
    },
    repoLink: {
        type: String,
    },
    liveLink: {
        type: String,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    extractedSkills: {
        type: [String],
        default: [],
    },
    readinessScore: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Project', ProjectSchema);
