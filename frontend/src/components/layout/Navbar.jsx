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

    return (
        <nav style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '0.75rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-color)', textDecoration: 'none' }}>
                    SkillVerify
                </Link>

                {user ? (
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link
                                to="/dashboard"
                                style={{
                                    color: isActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    borderBottom: isActive('/dashboard') ? '2px solid var(--text-primary)' : 'none',
                                    paddingBottom: '4px',
                                    textDecoration: 'none'
                                }}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/my-projects"
                                style={{
                                    color: isActive('/my-projects') ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    borderBottom: isActive('/my-projects') ? '2px solid var(--text-primary)' : 'none',
                                    paddingBottom: '4px',
                                    textDecoration: 'none'
                                }}
                            >
                                My Projects
                            </Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.fullName}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.role}</span>
                            </div>
                            <Button variant="ghost" size="small" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
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
