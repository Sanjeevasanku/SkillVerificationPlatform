import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import SkillProfile from '../components/specific/SkillProfile';
import ProjectCard from '../components/specific/ProjectCard';

const StudentProfileView = () => {
    const { studentId } = useParams();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin/');
    const backLink = isAdmin ? '/admin/dashboard' : '/hr/dashboard';
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
                <div className="flex-center min-h-50vh">
                    <div className="loader"></div>
                </div>
            </Layout>
        );
    }

    if (error || !profileData) {
        return (
            <Layout>
                <div className="flex-center flex-col gap-md min-h-50vh">
                    <h2 className="text-error">Error</h2>
                    <p>{error || 'Profile not found'}</p>
                    <Link to={backLink}>
                        <button className="btn btn-secondary">Back to Dashboard</button>
                    </Link>
                </div>
            </Layout>
        );
    }

    const { student, skills, categorySummary, overallStats, projects } = profileData;

    return (
        <Layout>
            <div className="max-w-1000 mx-auto p-md">
                <Link to={backLink} className="text-brand no-underline inline-block mb-lg">
                    ← Back to Dashboard
                </Link>

                <div className="flex justify-between items-start mb-xl flex-wrap gap-lg">
                    <div>
                        <h1 className="mb-sm">{student.fullName}</h1>
                        <p className="text-secondary text-md">
                            {student.college} • {student.branch} • Batch of {student.graduationYear}
                        </p>
                    </div>
                </div>

                <div className="dashboard-grid mb-2xl">
                    <Card title="Quick Stats">
                        <div className="grid-2-cols text-center">
                            <div>
                                <h3 className="stat-card-number text-brand">
                                    {overallStats?.projectCount || 0}
                                </h3>
                                <p className="stat-card-label">Projects</p>
                            </div>
                            <div>
                                <h3 className="stat-card-number text-success">
                                    {skills.length}
                                </h3>
                                <p className="stat-card-label">Verified Skills</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Contact Info">
                        <div className="flex flex-col gap-sm">
                            <p><strong>Email:</strong> {student.email}</p>
                            {student.githubUsername ? (
                                <p><strong>GitHub:</strong> <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noopener noreferrer" className="text-brand">@{student.githubUsername}</a></p>
                            ) : (
                                <p><strong>GitHub:</strong> <span className="text-secondary">Not linked</span></p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="mb-2xl">
                    <h2 className="mb-lg">Verified Skill Profile</h2>
                    <SkillProfile
                        skills={skills}
                        categorySummary={categorySummary}
                        loading={false}
                    />
                </div>

                {projects && projects.length > 0 && (
                    <div className="mb-2xl">
                        <h2 className="mb-lg">Verified Projects</h2>
                        <div className="projects-grid items-start">
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
