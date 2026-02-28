const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },

    description: {
        type: String,
        required: true,
        minlength: 10
    },

    githubLink: {
        type: String,
        required: true
    },

    repoId: {
        type: Number,
        required: true
    },

    repoName: String,
    repoOwner: String,
    repoOwnerId: Number,

    repoOwnerType: {
        type: String,
        enum: ["User", "Organization"]
    },

    isFork: Boolean,
    isArchived: Boolean,

    primaryLanguage: String,
    stars: Number,
    forks: Number,

    totalCommitCount: Number,
    commitCountByStudent: Number,
    contributionPercentage: Number,

    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],

    testScore: {
        type: Number,
        min: 0,
        max: 6
    },

    testTimeTaken: {
        type: Number // seconds
    },

    verificationStatus: {
        type: String,
        enum: ["verified", "rejected"]
    },

    verificationReason: String
}, {
    timestamps: true
});

// Added compound unique index for { student, repoId }
repositorySchema.index(
    { student: 1, repoId: 1 },
    { unique: true }
);

module.exports = mongoose.model('Repository', repositorySchema);
