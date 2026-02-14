const Project = require("../models/Project");

const { extractSkills } = require('../utils/githubScanner');

// Create Project
exports.createProject = async (req, res) => {
    try {
        const { title, description, techStack, githubLink } = req.body;

        // Auto-extract skills & calculate readiness score
        const { extractedSkills, readinessScore } = await extractSkills(githubLink);

        const project = await Project.create({
            student: req.user.id,
            title,
            description,
            techStack,
            githubLink,
            extractedSkills,
            readinessScore
        });

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
