import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

/**
 * ProtectedRoute component to handle Authentication and RBAC on the frontend.
 * 
 * @param {Array} allowedRoles - List of roles permitted to access this route (e.g., ['student', 'hr'])
 * @param {React.Component} children - The component to render if authorized
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    // Show nothing while checking authentication status
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'var(--bg-primary)'
            }}>
                <div className="loader"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check for Role-Based Access Control (RBAC)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized users to their respective home dashboards
        const fallbackPath = user.role === 'admin' ? '/admin/dashboard' : user.role === 'hr' ? '/hr/dashboard' : '/dashboard';
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
