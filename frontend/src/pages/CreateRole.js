import React, { useState } from 'react';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '../components/common/Dialog';

const CreateRole = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: [{ skillName: '', weight: 1 }],
        optionalSkills: [{ skillName: '', weight: 0.5 }]
    });
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '' });

    const showAlertDialog = (title, message) => setDialog({ isOpen: true, title, message });
    const closeDialog = () => setDialog({ ...dialog, isOpen: false });

    const { title, description, requiredSkills, optionalSkills } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSkillChange = (index, field, value, type) => {
        const updatedSkills = [...formData[type]];
        updatedSkills[index][field] = field === 'weight' ? parseFloat(value) || 0 : value;
        setFormData({ ...formData, [type]: updatedSkills });
    };

    const addSkill = (type) => {
        setFormData({
            ...formData,
            [type]: [...formData[type], { skillName: '', weight: type === 'requiredSkills' ? 1 : 0.5 }]
        });
    };

    const removeSkill = (index, type) => {
        const updatedSkills = [...formData[type]];
        updatedSkills.splice(index, 1);
        setFormData({ ...formData, [type]: updatedSkills });
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/hr/roles', formData);
            navigate('/hr/dashboard');
        } catch (err) {
            console.error('Error creating role:', err);
            showAlertDialog('Error', err.response?.data?.reason || 'Failed to create role');
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
                <h1 style={{ marginBottom: '2rem' }}>Create New Job Role</h1>
                <form onSubmit={onSubmit} style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <Input
                        label="Job Title"
                        type="text"
                        name="title"
                        value={title}
                        onChange={onChange}
                        required
                        placeholder="e.g. Senior Backend Engineer"
                    />

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={onChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                minHeight: '100px'
                            }}
                            placeholder="Describe the role and responsibilities..."
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Required Skills</h3>
                            <Button type="button" variant="secondary" onClick={() => addSkill('requiredSkills')}>+ Add Skill</Button>
                        </div>
                        {requiredSkills.map((skill, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ flex: 3 }}>
                                    <Input
                                        value={skill.skillName}
                                        onChange={(e) => onSkillChange(index, 'skillName', e.target.value, 'requiredSkills')}
                                        placeholder="Skill Name (e.g. Node.js)"
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={skill.weight}
                                        onChange={(e) => onSkillChange(index, 'weight', e.target.value, 'requiredSkills')}
                                        placeholder="Weight"
                                        required
                                    />
                                </div>
                                {requiredSkills.length > 1 && (
                                    <Button type="button" variant="secondary" onClick={() => removeSkill(index, 'requiredSkills')} style={{ alignSelf: 'center', marginBottom: '1.5rem' }}>✕</Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Optional Skills</h3>
                            <Button type="button" variant="secondary" onClick={() => addSkill('optionalSkills')}>+ Add Skill</Button>
                        </div>
                        {optionalSkills.map((skill, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ flex: 3 }}>
                                    <Input
                                        value={skill.skillName}
                                        onChange={(e) => onSkillChange(index, 'skillName', e.target.value, 'optionalSkills')}
                                        placeholder="Skill Name (e.g. Docker)"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={skill.weight}
                                        onChange={(e) => onSkillChange(index, 'weight', e.target.value, 'optionalSkills')}
                                        placeholder="Weight"
                                    />
                                </div>
                                {optionalSkills.length > 0 && (
                                    <Button type="button" variant="secondary" onClick={() => removeSkill(index, 'optionalSkills')} style={{ alignSelf: 'center', marginBottom: '1.5rem' }}>✕</Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button type="submit" variant="primary" style={{ flex: 1 }}>Create Role</Button>
                        <Button type="button" variant="secondary" onClick={() => navigate('/hr/dashboard')} style={{ flex: 1 }}>Cancel</Button>
                    </div>
                </form>

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

export default CreateRole;
