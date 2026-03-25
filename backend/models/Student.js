const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },

    college: {
        type: String,
        required: true,
        trim: true
    },

    branch: {
        type: String,
        required: true,
        trim: true
    },

    graduationYear: {
        type: Number,
        required: true
    },

    role: {
        type: String,
        enum: ["student"],
        default: "student"
    },

    password: {
        type: String,
        minlength: 6,
        select: false // Don't return password by default
    },

    githubId: {
        type: String,
        unique: true,
        index: true,
        sparse: true // Allow nulls for non-github accounts
    },

    githubUsername: {
        type: String
    },

    githubEmail: {
        type: String
    },

    githubAvatar: {
        type: String
    },

    githubAccessToken: {
        type: String
    },

    isGithubVerified: {
        type: Boolean,
        default: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

}, {
    timestamps: true
});

// Encrypt password before saving
StudentSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
StudentSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);
