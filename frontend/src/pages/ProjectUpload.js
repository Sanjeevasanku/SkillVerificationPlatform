import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { AlertDialog } from '../components/common/Dialog';

const ProjectUpload = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        githubLink: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '' });

    const showAlertDialog = (title, message) => setDialog({ isOpen: true, title, message });
    const closeDialog = () => setDialog({ ...dialog, isOpen: false });

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
            showAlertDialog('Verification Error', err.response?.data?.reason || err.response?.data?.message || 'Error verifying repository');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-700 mx-auto">
                <div className="text-center mb-xl">
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

                        <div className="mb-md">
                            <label className="block mb-xs text-sm font-semibold text-secondary">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={description}
                                onChange={onChange}
                                required
                                placeholder="A brief description of the technical work implemented..."
                                className="form-textarea"
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

                        <div className="flex gap-md mt-lg">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Analyzing Repository...' : 'Verify & Submit'}
                            </Button>
                        </div>
                    </form>
                </Card>

                <AlertDialog
                    isOpen={dialog.isOpen}
                    title={dialog.title}
                    message={dialog.message}
                    onConfirm={closeDialog}
                />
            </div>
        </Layout>
    );
};

export default ProjectUpload;
