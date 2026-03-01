import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import SkillProfile from '../components/specific/SkillProfile';
import ProjectCard from '../components/specific/ProjectCard';

const StudentProfileView = () => {
    const { studentId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const res = await api.get(`/students/${studentId}`);
                setProfileData(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching student profile:', err);
                setError(err.response?.data?.msg || 'Failed to load student profile');
                setLoading(false);
            }
        };

        fetchStudentProfile();
    }, [studentId]);

    if (loading) {
        return (
            <Layout>
                <div className="flex-center" style={{ height: '50vh' }}>
                    <div className="loader"></div>
                </div>
            </Layout>
        );
    }

    if (error || !profileData) {
        return (
            <Layout>
                <div className="flex-center" style={{ height: '50vh', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ color: 'var(--error-color)' }}>Error</h2>
                    <p>{error || 'Profile not found'}</p>
                    <Link to="/hr/dashboard">
                        <button className="btn btn-secondary">Back to Dashboard</button>
                    </Link>
                </div>
            </Layout>
        );
    }

    const { student, skills, categorySummary, overallStats, projects } = profileData;

    return (
        <Layout>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
                <Link to="/hr/dashboard" style={{ color: 'var(--brand-color)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
                    ← Back to Dashboard
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>{student.fullName}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            {student.college} • {student.branch} • Batch of {student.graduationYear}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <Card title="Quick Stats">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '2rem', color: 'var(--brand-color)', margin: 0 }}>
                                    {overallStats?.projectCount || 0}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Projects</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0 }}>
                                    {skills.length}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Verified Skills</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Contact Info">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <p><strong>Email:</strong> {student.email}</p>
                            <p><strong>GitHub:</strong> <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-color)' }}>@{student.githubUsername}</a></p>
                        </div>
                    </Card>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Verified Skill Profile</h2>
                    <SkillProfile
                        skills={skills}
                        categorySummary={categorySummary}
                        loading={false}
                    />
                </div>

                {projects && projects.length > 0 && (
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Verified Projects</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {projects.map(project => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default StudentProfileView;
