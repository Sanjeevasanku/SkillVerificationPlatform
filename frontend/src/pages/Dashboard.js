import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) {
        return (
            <Layout>
                <div className="flex-center" style={{ height: '50vh' }}>
                    <p>Loading user data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>

                <Card title={`Welcome back, ${user.name}`}>
                    <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                        Role: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.role.toUpperCase()}</span>
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={() => navigate('/upload-project')}
                        >
                            🚀 Upload New Project
                        </Button>
                        <Button
                            variant="secondary"
                            size="large"
                            onClick={() => navigate('/my-projects')}
                        >
                            📂 View My Projects
                        </Button>
                    </div>
                </Card>

                <div style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <Card title="Quick Stats">
                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '2rem', color: 'var(--brand-color)', margin: 0 }}>0</h3>
                                <p>Projects</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0 }}>0</h3>
                                <p>Verified</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Recent Activity">
                        <p style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>No recent activity.</p>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;

