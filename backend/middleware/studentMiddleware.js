/**
 * Middleware to restrict access to Student and Admin roles
 */
const studentMiddleware = (req, res, next) => {
    if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
        return res.status(403).json({
            message: 'Access Denied',
            reason: 'This action is restricted to students only'
        });
    }
    next();
};

module.exports = studentMiddleware;
