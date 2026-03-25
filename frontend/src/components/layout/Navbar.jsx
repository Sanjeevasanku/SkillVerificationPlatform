import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Button from '../common/Button';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const getHomeLink = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'hr') return '/hr/dashboard';
        return '/dashboard';
    };

    return (
        <nav className="app-navbar">
            <div className="container flex justify-between items-center">
                <Link to={getHomeLink()} className="text-xl font-bold text-brand no-underline">
                    SkillVerify
                </Link>

                {user ? (
                    <div className="flex gap-lg items-center">
                        <div className="flex gap-md">
                            {user.role === 'admin' ? (
                                <>
                                    <Link
                                        to="/admin/dashboard"
                                        className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                                    >
                                        Admin Panel
                                    </Link>
                                    <Link
                                        to="/admin/review-queue"
                                        className={`nav-link ${isActive('/admin/review-queue') ? 'active' : ''}`}
                                    >
                                        Review Queue
                                    </Link>
                                </>
                            ) : user.role === 'hr' ? (
                                <Link
                                    to="/hr/dashboard"
                                    className={`nav-link ${isActive('/hr/dashboard') ? 'active' : ''}`}
                                >
                                    HR Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/my-projects"
                                        className={`nav-link ${isActive('/my-projects') ? 'active' : ''}`}
                                    >
                                        My Projects
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-md nav-user-section">
                            <div className="flex flex-col items-end pr-sm">
                                <span className="text-sm font-semibold">{user.fullName || user.githubUsername || 'User'}</span>
                                <span className="text-xs text-brand uppercase" style={{ letterSpacing: '0.05em' }}>{user.role}</span>
                            </div>
                            <Button variant="secondary" size="small" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-md">
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary">Register</Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
