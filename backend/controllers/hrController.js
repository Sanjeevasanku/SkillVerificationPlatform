const Role = require('../models/Role');
const { calculateRoleReadiness } = require('../services/roleReadinessService');

/**
 * @desc    Create a new role
 * @route   POST /api/hr/roles
 * @access  Private (HR/Admin)
 */
exports.createRole = async (req, res) => {
    try {
        const { title, description, requiredSkills, optionalSkills } = req.body;

        if (!title || !requiredSkills || requiredSkills.length === 0) {
            return res.status(400).json({
                message: 'Validation Error',
                reason: 'Title and at least one required skill are mandatory'
            });
        }

        const newRole = new Role({
            title,
            description,
            requiredSkills,
            optionalSkills: optionalSkills || [],
            createdBy: req.user.id
        });

        await newRole.save();

        res.status(201).json({
            message: 'Role created successfully',
            role: newRole
        });
    } catch (err) {
        console.error('Error creating role:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Get all roles created by UI or specific HR user
 * @route   GET /api/hr/roles
 * @access  Private (HR/Admin)
 */
exports.getAllRoles = async (req, res) => {
    try {
        // Find all roles
        const roles = await Role.find()
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.json(roles);
    } catch (err) {
        console.error('Error fetching roles:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Get role details with ranked students
 * @route   GET /api/hr/roles/:id
 * @access  Private (HR/Admin)
 */
exports.getRoleWithReadiness = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Calculate rankings
        const rankedStudents = await calculateRoleReadiness(role._id);

        res.json({
            role: {
                id: role._id,
                title: role.title,
                description: role.description,
                requiredSkills: role.requiredSkills,
                optionalSkills: role.optionalSkills,
                createdAt: role.createdAt
            },
            rankedStudents
        });
    } catch (err) {
        console.error('Error fetching role readiness:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};
<<<<<<< Updated upstream

/**
 * @desc    Delete a role
 * @route   DELETE /api/hr/roles/:id
 * @access  Private (HR/Admin)
 */
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Optional: Ensure only the creator or an admin can delete
        // if (role.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        //     return res.status(401).json({ message: 'User not authorized to delete this role' });
        // }

        await role.deleteOne();

        res.json({ message: 'Role removed' });
    } catch (err) {
        console.error('Error deleting role:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Search students by a specific skill
 * @route   GET /api/hr/search/students?skill=XYZ
 * @access  Private (HR/Admin)
 */
exports.searchStudents = async (req, res) => {
    try {
        const { skill } = req.query;

        if (!skill) {
            return res.status(400).json({ message: 'Skill query parameter is required' });
        }

        const { searchStudentsBySkill } = require('../services/hrSearchService');
        const students = await searchStudentsBySkill(skill);

        res.json(students);
    } catch (err) {
        console.error('Error searching students:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};
=======
>>>>>>> Stashed changes
