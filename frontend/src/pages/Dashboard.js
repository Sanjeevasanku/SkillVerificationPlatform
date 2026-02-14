import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Skill Verification Platform</h1>
                {user && <button onClick={onLogout}>Logout</button>}
            </header>

            {user ? (
                <div className="card">
                    <h2>Welcome back, <span style={{ color: 'var(--primary-color)' }}>{user.name}</span></h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                        Role: <strong>{user.role.toUpperCase()}</strong>
                    </p>
                    <div style={{ marginTop: '20px' }}>
                        {/* Placeholder for future widgets */}
                        <p>Your dashboard is ready. Upload a project to get started.</p>
                    </div>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default Dashboard;
