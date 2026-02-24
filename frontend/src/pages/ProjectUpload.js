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
        githubLink: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { title, description, githubLink } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/repositories', formData);
            // Redirection is now immediate after verification
            navigate('/my-projects');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.reason || err.response?.data?.message || 'Error verifying repository');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1>Verify Repository</h1>
                    <p>Submit your GitHub repository for verification</p>
                </div>

                <Card>
                    <form onSubmit={onSubmit}>
                        <Input
                            label="Project / Repository Title"
                            type="text"
                            name="title"
                            value={title}
                            onChange={onChange}
                            required
                            placeholder="e.g., My Portfolio Website"
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
                                placeholder="A brief description of the technical work implemented..."
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
                            label="GitHub Repository Link"
                            type="url"
                            name="githubLink"
                            value={githubLink}
                            onChange={onChange}
                            required
                            placeholder="https://github.com/yourusername/reponame"
                        />

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/dashboard')}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                style={{ flex: 2 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Analyzing Repository...' : 'Verify & Submit'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </Layout>
    );
};

export default ProjectUpload;
