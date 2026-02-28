const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: String,

    requiredSkills: [
        {
            skillName: {
                type: String,
                required: true
            },
            weight: {
                type: Number,
                default: 1
            }
        }
    ],

    optionalSkills: [
        {
            skillName: String,
            weight: {
                type: Number,
                default: 0.5
            }
        }
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HR",
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);
