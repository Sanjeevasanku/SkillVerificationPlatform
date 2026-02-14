import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyProjects = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects/my');
                setProjects(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) return <div style={styles.loading}>Loading projects...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <h1 style={styles.header}>📂 My Projects</h1>
                <button onClick={() => navigate('/upload-project')} style={styles.addButton}>
                    + New Project
                </button>
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    Back to Dashboard
                </button>
            </div>

            <div style={styles.grid}>
                {projects.map(project => (
                    <div key={project._id} style={styles.card} className="glass-card">
                        <div style={styles.cardHeader}>
                            <h2 style={styles.title}>{project.title}</h2>
                            <span style={{
                                ...styles.scoreBadge,
                                background: getScoreColor(project.readinessScore)
                            }}>
                                Score: {project.readinessScore}/100
                            </span>
                        </div>

                        <p style={styles.description}>{project.description}</p>

                        <div style={styles.section}>
                            <h4 style={styles.sectionTitle}>🛠 Content Stack</h4>
                            <div style={styles.tagContainer}>
                                {project.techStack.map((tech, i) => (
                                    <span key={i} style={styles.tag}>{tech}</span>
                                ))}
                            </div>
                        </div>

                        {project.extractedSkills && project.extractedSkills.length > 0 && (
                            <div style={styles.section}>
                                <h4 style={styles.sectionTitle}>✅ Verified Skills (from GitHub)</h4>
                                <div style={styles.tagContainer}>
                                    {project.extractedSkills.map((skill, i) => (
                                        <span key={i} style={styles.verifiedTag}>{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={styles.cardFooter}>
                            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                View on GitHub ↗
                            </a>
                            {project.liveLink && (
                                <a href={project.liveLink} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                    Live Demo ↗
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {projects.length === 0 && (
                <div style={styles.emptyState}>
                    <p>No projects yet. Upload one to see your skills verified!</p>
                </div>
            )}
        </div>
    );
};

// Helper for score color
const getScoreColor = (score) => {
    if (score >= 80) return 'rgba(34, 197, 94, 0.2)'; // Green
    if (score >= 50) return 'rgba(234, 179, 8, 0.2)'; // Yellow
    return 'rgba(239, 68, 68, 0.2)'; // Red
};

const styles = {
    container: {
        minHeight: '100vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
    },
    loading: {
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        fontSize: '1.2rem',
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        maxWidth: '1200px',
        margin: '0 auto 2rem',
    },
    header: {
        fontSize: '2.5rem',
        background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0,
    },
    addButton: {
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
    },
    backButton: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#94a3b8',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginLeft: '10px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '1.5rem',
        margin: 0,
        color: '#e2e8f0',
    },
    scoreBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    description: {
        color: '#94a3b8',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        marginBottom: '1.5rem',
        flex: 1,
    },
    section: {
        marginBottom: '1rem',
    },
    sectionTitle: {
        fontSize: '0.9rem',
        color: '#cbd5e1',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    tagContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    tag: {
        background: 'rgba(59, 130, 246, 0.1)',
        color: '#60a5fa',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.85rem',
    },
    verifiedTag: {
        background: 'rgba(34, 197, 94, 0.1)',
        color: '#4ade80',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.85rem',
        border: '1px solid rgba(34, 197, 94, 0.2)',
    },
    cardFooter: {
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: '1rem',
    },
    link: {
        color: '#a78bfa',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        color: '#94a3b8',
        fontSize: '1.1rem',
    }
};

export default MyProjects;
