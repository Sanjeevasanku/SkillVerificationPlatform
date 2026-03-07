/**
 * Middleware to restrict access to Admin role only
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access Denied',
            reason: 'You must be an admin to perform this action'
        });
    }
    next();
};

module.exports = adminMiddleware;
