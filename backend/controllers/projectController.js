const Project = require('../models/Project');
const { extractSkills } = require('../utils/advancedSkillExtractor');

// Create Project
exports.createProject = async (req, res) => {
    try {
        const { title, description, techStack, githubLink } = req.body;

        // Auto-extract skills & calculate readiness score
        const { extractedSkills, structuredSkills, readinessScore } = await extractSkills(githubLink);

        const project = await Project.create({
            student: req.user.id,
            title,
            description,
            techStack,
            githubLink,
            extractedSkills,
            structuredSkills,
            readinessScore
        });

        // Add project to user's projects array
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, { $push: { projects: project._id } });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Student Projects
exports.getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ student: req.user.id });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
