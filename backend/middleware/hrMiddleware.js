/**
 * Middleware to restrict access to HR and Admin roles
 */
const hrMiddleware = (req, res, next) => {
    if (!req.user || (req.user.role !== 'hr' && req.user.role !== 'admin')) {
        return res.status(403).json({
            message: 'Access Denied',
            reason: 'You must be an HR representative to perform this action'
        });
    }
    next();
};

module.exports = hrMiddleware;
