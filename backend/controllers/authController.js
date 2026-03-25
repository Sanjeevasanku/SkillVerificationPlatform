const Student = require('../models/Student');
const HR = require('../models/HR');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const githubService = require('../services/githubService');
const { encrypt } = require('../utils/encryptToken');

// @desc    Redirect to GitHub OAuth
// @route   GET /api/auth/github
// @access  Public
// TODO: Store `state` in a session/cookie and validate it in the callback to prevent CSRF attacks.
exports.githubAuth = (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    const clientId = process.env.GITHUB_CLIENT_ID;
    const scope = 'user:email';

    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${state}&prompt=login`;

    res.redirect(githubUrl);
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
exports.githubCallback = async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).json({ message: 'No code provided from GitHub' });
    }

    try {
        // 1. Exchange code for access token
        const accessToken = await githubService.exchangeCodeForToken(code, state);

        // 2. Fetch user data from GitHub
        const githubData = await githubService.getUserData(accessToken);

        // 3. Check if student already exists
        let student = await Student.findOne({ githubId: githubData.githubId });

        if (student) {
            // Update last login
            student.lastLoginAt = Date.now();
            await student.save();

            // Issue JWT
            const payload = {
                user: {
                    id: student._id,
                    role: student.role
                }
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Redirect to login with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/login?token=${token}`);
        }

        // 4. Encrypt access token for registration
        const encryptedAccessToken = encrypt(accessToken);

        // Redirect to frontend registration page for new students
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/register?githubId=${githubData.githubId}&githubUsername=${githubData.githubUsername}&githubEmail=${githubData.githubEmail}&githubAvatar=${encodeURIComponent(githubData.githubAvatar)}&encryptedAccessToken=${encodeURIComponent(encryptedAccessToken)}`;

        res.redirect(redirectUrl);
    } catch (err) {
        console.error('Error in GitHub callback:', err.stack || err.message);
        res.status(500).json({ msg: err.message || 'GitHub Authentication failed' });
    }
};

// @desc    Authenticate student & get token (Manual Login)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let student = await Student.findOne({ email }).select('+password');

        if (!student) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await student.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Update last login
        student.lastLoginAt = Date.now();
        await student.save();

        const payload = {
            user: {
                id: student._id,
                role: student.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: student._id,
                        fullName: student.fullName,
                        email: student.email,
                        role: student.role
                    }
                });
            }
        );
    } catch (err) {
        console.error('Error in login:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.registerStudent = async (req, res) => {
    const {
        fullName,
        email,
        college,
        branch,
        graduationYear,
        githubId,
        githubUsername,
        githubEmail,
        githubAvatar,
        encryptedAccessToken
    } = req.body;

    try {
        // Check if student already exists by email
        let student = await Student.findOne({ email });
        if (student) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }

        // If githubId is provided, check if it already exists
        if (githubId) {
            student = await Student.findOne({ githubId });
            if (student) {
                return res.status(400).json({ message: 'Student with this GitHub ID already exists' });
            }
        }

        // Create new student
        const studentData = {
            fullName,
            email,
            college,
            branch,
            graduationYear,
        };

        if (req.body.password) {
            studentData.password = req.body.password;
        }

        if (githubId) {
            studentData.githubId = githubId;
            studentData.githubUsername = githubUsername;
            studentData.githubEmail = githubEmail;
            studentData.githubAvatar = githubAvatar;
            studentData.githubAccessToken = encryptedAccessToken;
        }

        student = new Student(studentData);
        await student.save();

        // Issue JWT
        const payload = {
            user: {
                id: student._id,
                role: student.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    token,
                    user: {
                        id: student._id,
                        fullName: student.fullName,
                        email: student.email,
                        role: student.role
                    }
                });
            }
        );
    } catch (err) {
        console.error('Error registering student:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current logged in user (Student or HR)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        let user;
        if (req.user.role === 'admin') {
            user = await Admin.findById(req.user.id);
        } else if (req.user.role === 'hr') {
            user = await HR.findById(req.user.id);
        } else {
            user = await Student.findById(req.user.id).select('-githubAccessToken');
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error in getMe:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate HR & get token
// @route   POST /api/auth/hr/login
// @access  Public
exports.hrLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        let hrUser = await HR.findOne({ email }).select('+password');

        if (!hrUser) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await hrUser.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: hrUser._id,
                role: hrUser.role // 'hr'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: hrUser._id,
                        fullName: hrUser.fullName,
                        email: hrUser.email,
                        role: hrUser.role
                    }
                });
            }
        );
    } catch (err) {
        console.error('Error in HR login:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate Admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        let adminUser = await Admin.findOne({ email }).select('+password');

        if (!adminUser) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await adminUser.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: adminUser._id,
                role: adminUser.role // 'admin'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: adminUser._id,
                        fullName: adminUser.fullName,
                        email: adminUser.email,
                        role: adminUser.role
                    }
                });
            }
        );
    } catch (err) {
        console.error('Error in Admin login:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a new admin
// @route   POST /api/auth/admin/register
// @access  Public
exports.adminRegister = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        let existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        const adminUser = new Admin({ fullName, email, password });
        await adminUser.save();

        const payload = {
            user: {
                id: adminUser._id,
                role: adminUser.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    token,
                    user: {
                        id: adminUser._id,
                        fullName: adminUser.fullName,
                        email: adminUser.email,
                        role: adminUser.role
                    }
                });
            }
        );
    } catch (err) {
        console.error('Error registering admin:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
