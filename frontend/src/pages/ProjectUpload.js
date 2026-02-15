import React, { useState, useContext } from 'react';
import api from '../lib/api';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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
            console.error(err);
            alert(err.response?.data?.message || 'Error uploading project');
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1>🚀 Upload Project</h1>
                    <p>Showcase your work to the world</p>
                </div>

                <Card>
                    <form onSubmit={onSubmit}>
                        <Input
                            label="Project Title"
                            type="text"
                            name="title"
                            value={title}
                            onChange={onChange}
                            required
                            placeholder="e.g., AI Image Generator"
                        />

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={description}
                                onChange={onChange}
                                required
                                placeholder="Describe what your project does..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    minHeight: '120px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)'
                                }}
                            ></textarea>
                        </div>

                        <Input
                            label="Tech Stack (comma separated)"
                            type="text"
                            name="techStack"
                            value={techStack}
                            onChange={onChange}
                            placeholder="React, Node.js, MongoDB, TensorFlow"
                            required
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input
                                label="GitHub Repository"
                                type="url"
                                name="githubLink"
                                value={githubLink}
                                onChange={onChange}
                                required
                                placeholder="https://github.com/user/repo"
                            />
                            <Input
                                label="Live Demo (Optional)"
                                type="url"
                                name="liveLink"
                                value={liveLink}
                                onChange={onChange}
                                placeholder="https://my-demo.com"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/dashboard')}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" style={{ flex: 2 }}>
                                Submit Project
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </Layout>
    );
};

export default ProjectUpload;
