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
        repoLink: '',
        liveLink: ''
    });

    const { title, description, techStack, repoLink, liveLink } = formData;

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
            alert('Error uploading project');
        }
    };

    return (
        <div className="auth-form-container" style={{ maxWidth: '600px' }}>
            <h1>Upload Project</h1>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Project Title</label>
                    <input type="text" name="title" value={title} onChange={onChange} required />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={onChange}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '12px',
                            background: 'rgba(15, 23, 42, 0.5)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            minHeight: '100px'
                        }}
                    ></textarea>
                </div>
                <div>
                    <label>Tech Stack (comma separated)</label>
                    <input type="text" name="techStack" value={techStack} onChange={onChange} placeholder="React, Node, MongoDB" required />
                </div>
                <div>
                    <label>Repository Link</label>
                    <input type="url" name="repoLink" value={repoLink} onChange={onChange} />
                </div>
                <div>
                    <label>Live Demo Link</label>
                    <input type="url" name="liveLink" value={liveLink} onChange={onChange} />
                </div>
                <button type="submit">Submit Project</button>
            </form>
            <button
                onClick={() => navigate('/dashboard')}
                style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
            >
                Cancel
            </button>
        </div>
    );
};

export default ProjectUpload;
