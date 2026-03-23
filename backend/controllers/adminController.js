const Student = require('../models/Student');
const HR = require('../models/HR');
const Role = require('../models/Role');
const Repository = require('../models/Repository');
const { calculateRoleReadiness } = require('../services/roleReadinessService');

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

// ==================== ROLE MANAGEMENT ENDPOINTS ====================

/**
 * @desc    Get role details with ranked students
 * @route   GET /api/admin/roles/:id
 * @access  Private (Admin)
 */
exports.getRoleWithReadiness = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

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

/**
 * @desc    Delete a role
 * @route   DELETE /api/admin/roles/:id
 * @access  Private (Admin)
 */
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

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

// ==================== REVIEW QUEUE ENDPOINTS ====================

/**
 * @desc    Get repositories pending review
 * @route   GET /api/admin/repositories/review-queue?band=amber|red
 * @access  Private (Admin)
 */
exports.getReviewQueue = async (req, res) => {
    try {
        const filter = { verificationStatus: 'pending_review' };

        if (req.query.band && ['amber', 'red'].includes(req.query.band)) {
            filter.riskBand = req.query.band;
        }

        const repos = await Repository.find(filter)
            .populate('student', 'fullName email college graduationYear githubUsername')
            .sort({ createdAt: -1 });

        res.json(repos);
    } catch (err) {
        console.error('Error fetching review queue:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Get detailed review info for a single repository
 * @route   GET /api/admin/repositories/:id/review-details
 * @access  Private (Admin)
 */
exports.getReviewDetails = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id)
            .populate('student', 'fullName email college graduationYear githubUsername githubAvatar')
            .populate('skills');

        if (!repo) {
            return res.status(404).json({ message: 'Repository not found' });
        }

        res.json(repo);
    } catch (err) {
        console.error('Error fetching review details:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Approve a repository
 * @route   POST /api/admin/repositories/:id/approve
 * @access  Private (Admin)
 */
exports.approveRepository = async (req, res) => {
    try {
        const repo = await Repository.findById(req.params.id);
        if (!repo) {
            return res.status(404).json({ message: 'Repository not found' });
        }

        repo.verificationStatus = 'verified';
        repo.verificationReason = 'Manually approved by admin';
        repo.reviewedBy = req.user.id;
        repo.reviewedAt = new Date();
        repo.reviewNotes = req.body.notes || '';

        await repo.save();

        res.json({ message: 'Repository approved', repository: repo });
    } catch (err) {
        console.error('Error approving repository:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};

/**
 * @desc    Reject a repository
 * @route   POST /api/admin/repositories/:id/reject
 * @access  Private (Admin)
 */
exports.rejectRepository = async (req, res) => {
    try {
        if (!req.body.notes) {
            return res.status(400).json({ message: 'Rejection notes are required' });
        }

        const repo = await Repository.findById(req.params.id);
        if (!repo) {
            return res.status(404).json({ message: 'Repository not found' });
        }

        repo.verificationStatus = 'rejected';
        repo.verificationReason = 'Rejected by admin: ' + req.body.notes;
        repo.reviewedBy = req.user.id;
        repo.reviewedAt = new Date();
        repo.reviewNotes = req.body.notes;

        await repo.save();

        res.json({ message: 'Repository rejected', repository: repo });
    } catch (err) {
        console.error('Error rejecting repository:', err.message);
        res.status(500).json({ message: 'Server error', reason: err.message });
    }
};
