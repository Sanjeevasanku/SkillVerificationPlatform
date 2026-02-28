import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import ProjectCard from '../components/specific/ProjectCard';
import useFetch from '../hooks/useFetch';
import api from '../lib/api';

const MyProjects = () => {
    const navigate = useNavigate();
    const { data: projects, loading, error, setData } = useFetch('/repositories/my');

    const handleRefreshScores = async (projectId) => {
        try {
            const res = await api.put(`/repositories/${projectId}/recalculate`);
            const updatedProject = res.data;

            // Update the local state with the new scores
            setData(prevProjects => prevProjects.map(proj =>
                proj._id === projectId ? { ...proj, ...updatedProject } : proj
            ));
        } catch (err) {
            console.error('Error refreshing scores:', err);
            alert('Failed to refresh scores. Please try again.');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex-center" style={{ height: '50vh', flexDirection: 'column', gap: '1rem' }}>
                    <div className="loader"></div>
                    <p>Loading your projects...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex-center" style={{ height: '50vh', flexDirection: 'column' }}>
                    <h3 style={{ color: 'var(--error-color)' }}>Error Loading Projects</h3>
                    <p>{error.message || 'Something went wrong. Please try again.'}</p>
                    <Button variant="secondary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Retry</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Projects</h1>
                <Button onClick={() => navigate('/upload-project')}>
                    + New Project
                </Button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {projects && projects.length > 0 ? (
                    projects.map(project => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                            onRefresh={handleRefreshScores}
                        />
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                        <h3>No projects yet.</h3>
                        <p style={{ marginBottom: '1.5rem' }}>Upload a project to see your skills verified!</p>
                        <Button variant="primary" onClick={() => navigate('/upload-project')}>Upload First Project</Button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyProjects;

