const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: String,
    description: String,
    techStack: [String],
    githubLink: {
        type: String,
        required: true // Assuming it's mandatory based on "student WILL provide"
    },
    verified: {
        type: Boolean,
        default: false
    },
    extractedSkills: [String],
    structuredSkills: {
        languages: [String],
        frontend: [String],
        backend: [String],
        database: [String],
        devops: [String],
        testing: [String],
        ml: [String],
        tools: [String]
    },
    readinessScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
