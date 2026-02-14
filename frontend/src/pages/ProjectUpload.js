import React, { useState, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProjectUpload = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        techStack: '',
        githubLink: '',
        liveLink: ''
    });

    const { title, description, techStack, githubLink, liveLink } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/projects', {
                ...formData,
                techStack: techStack.split(',').map(skill => skill.trim())
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err.response.data);
            alert(err.response.data.message || 'Error uploading project');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.glassCard} className="glass-card">
                <h1 style={styles.header}>🚀 Upload Project</h1>
                <p style={styles.subHeader}>Showcase your work to the world</p>

                <form onSubmit={onSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Project Title</label>
                        <input
                            type="text"
                            name="title"
                            value={title}
                            onChange={onChange}
                            required
                            style={styles.input}
                            placeholder="e.g., AI Image Generator"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={onChange}
                            required
                            style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                            placeholder="Describe what your project does..."
                        ></textarea>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tech Stack <span style={{ fontSize: '0.8em', opacity: 0.7 }}>(comma separated)</span></label>
                        <input
                            type="text"
                            name="techStack"
                            value={techStack}
                            onChange={onChange}
                            placeholder="React, Node.js, MongoDB, TensorFlow"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>GitHub Repository</label>
                            <input
                                type="url"
                                name="githubLink"
                                value={githubLink}
                                onChange={onChange}
                                required
                                style={styles.input}
                                placeholder="https://github.com/username/repo"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Live Demo <span style={{ fontSize: '0.8em', opacity: 0.7 }}>(Optional)</span></label>
                            <input
                                type="url"
                                name="liveLink"
                                value={liveLink}
                                onChange={onChange}
                                style={styles.input}
                                placeholder="https://my-project-demo.com"
                            />
                        </div>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            style={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button type="submit" style={styles.submitButton}>
                            Submit Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    },
    glassCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '3rem',
        width: '100%',
        maxWidth: '700px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'fadeIn 0.5s ease-out',
    },
    header: {
        color: '#fff',
        marginBottom: '0.5rem',
        fontSize: '2.5rem',
        textAlign: 'center',
        background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subHeader: {
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: '2rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
    },
    row: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    label: {
        color: '#e2e8f0',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    input: {
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        outline: 'none',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    submitButton: {
        flex: 2,
        padding: '12px',
        borderRadius: '10px',
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        color: 'white',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    cancelButton: {
        flex: 1,
        padding: '12px',
        borderRadius: '10px',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#94a3b8',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
    }
};

export default ProjectUpload;
