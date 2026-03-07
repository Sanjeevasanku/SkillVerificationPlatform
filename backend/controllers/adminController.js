const Student = require('../models/Student');
const HR = require('../models/HR');
const Role = require('../models/Role');

/**
 * @desc    Get all students
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .select('-githubAccessToken')
            .sort({ createdAt: -1 });

        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Get all HR users
 * @route   GET /api/admin/hrs
 * @access  Private (Admin)
 */
exports.getAllHRs = async (req, res) => {
    try {
        const hrs = await HR.find().sort({ createdAt: -1 });

        res.json(hrs);
    } catch (err) {
        console.error('Error fetching HRs:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Get all roles
 * @route   GET /api/admin/roles
 * @access  Private (Admin)
 */
exports.getAllRoles = async (req, res) => {
    try {
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
 * @desc    Delete a student
 * @route   DELETE /api/admin/students/:id
 * @access  Private (Admin)
 */
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await student.deleteOne();
        res.json({ message: 'Student removed' });
    } catch (err) {
        console.error('Error deleting student:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Delete an HR user
 * @route   DELETE /api/admin/hrs/:id
 * @access  Private (Admin)
 */
exports.deleteHR = async (req, res) => {
    try {
        const hr = await HR.findById(req.params.id);
        if (!hr) {
            return res.status(404).json({ message: 'HR user not found' });
        }

        await hr.deleteOne();
        res.json({ message: 'HR user removed' });
    } catch (err) {
        console.error('Error deleting HR:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};
