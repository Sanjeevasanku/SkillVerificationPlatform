import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import ProjectCard from '../components/specific/ProjectCard';
import useFetch from '../hooks/useFetch';

const MyProjects = () => {
    const navigate = useNavigate();
    const { data: projects, loading, error } = useFetch('/repositories/my');

    if (loading) {
        return (
            <Layout>
                <div className="flex-center flex-col min-h-50vh gap-md">
                    <div className="loader"></div>
                    <p>Loading your projects...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex-center flex-col min-h-50vh">
                    <h3 className="text-error">Error Loading Projects</h3>
                    <p>{error.message || 'Something went wrong. Please try again.'}</p>
                    <Button variant="secondary" onClick={() => window.location.reload()} className="mt-md">Retry</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex justify-between items-center mb-xl">
                <h1>My Projects</h1>
                <Button onClick={() => navigate('/upload-project')}>
                    + New Project
                </Button>
            </div>

            <div className="projects-grid items-start">
                {projects && projects.length > 0 ? (
                    projects.map(project => (
                        <ProjectCard
                            key={project._id}
                            project={project}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-2xl text-secondary">
                        <h3>No projects yet.</h3>
                        <p className="mb-lg">Upload a project to see your skills verified!</p>
                        <Button variant="primary" onClick={() => navigate('/upload-project')}>Upload First Project</Button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyProjects;

