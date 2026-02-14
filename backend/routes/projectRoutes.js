const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Project = require('../models/Project');

// @route   POST api/projects
// @desc    Create a new project
// @access  Private (Student only)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, techStack, repoLink, liveLink } = req.body;

        // Optional: Check if user is student
        if (req.user.role !== 'student') {
            return res.status(403).json({ msg: 'Only students can submit projects' });
        }

        const newProject = new Project({
            studentId: req.user.id,
            title,
            description,
            techStack: Array.isArray(techStack) ? techStack : techStack.split(',').map(s => s.trim()),
            repoLink,
            liveLink,
        });

        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/projects
// @desc    Get all projects (for testing/HR) or My Projects (for student)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // If student, return only their projects
        if (req.user.role === 'student') {
            const projects = await Project.find({ studentId: req.user.id }).sort({ createdAt: -1 });
            return res.json(projects);
        }

        // If Admin/HR, return all
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
