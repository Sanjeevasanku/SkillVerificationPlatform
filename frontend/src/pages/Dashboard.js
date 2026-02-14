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
                        <button
                            onClick={() => navigate('/upload-project')}
                            className="btn-primary"
                            style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px' }}
                        >
                            🚀 Upload New Project
                        </button>
                        <button
                            onClick={() => navigate('/my-projects')}
                            className="btn-secondary"
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                background: 'transparent',
                                border: '1px solid var(--primary-color)',
                                color: 'var(--primary-color)'
                            }}
                        >
                            📂 View My Projects
                        </button>
                    </div>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default Dashboard;
