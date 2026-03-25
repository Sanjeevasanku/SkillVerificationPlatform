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
            // Filter out optional skills with empty names
            const payload = {
                ...formData,
                optionalSkills: formData.optionalSkills.filter(s => s.skillName.trim() !== '')
            };
            await api.post('/hr/roles', payload);
            navigate('/hr/dashboard');
        } catch (err) {
            console.error('Error creating role:', err);
            showAlertDialog('Error', err.response?.data?.reason || err.response?.data?.message || 'Failed to create role');
        }
    };

    return (
        <Layout>
            <div className="max-w-800 mx-auto px-md my-xl">
                <h1 className="mb-xl">Create New Job Role</h1>
                <form onSubmit={onSubmit} className="bg-secondary p-xl rounded-lg border-solid border-color">
                    <Input
                        label="Job Title"
                        type="text"
                        name="title"
                        value={title}
                        onChange={onChange}
                        required
                        placeholder="e.g. Senior Backend Engineer"
                    />

                    <div className="mb-lg">
                        <label className="block mb-xs font-bold">Description</label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={onChange}
                            className="form-textarea bg-primary"
                            placeholder="Describe the role and responsibilities..."
                        />
                    </div>

                    <div className="mb-xl">
                        <div className="flex justify-between items-center mb-md">
                            <h3 className="m-0">Required Skills</h3>
                            <Button type="button" variant="secondary" onClick={() => addSkill('requiredSkills')}>+ Add Skill</Button>
                        </div>
                        {requiredSkills.map((skill, index) => (
                            <div key={index} className="flex gap-sm mb-sm">
                                <div className="flex-3">
                                    <Input
                                        value={skill.skillName}
                                        onChange={(e) => onSkillChange(index, 'skillName', e.target.value, 'requiredSkills')}
                                        placeholder="Skill Name (e.g. Node.js)"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
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
                                    <Button type="button" variant="secondary" onClick={() => removeSkill(index, 'requiredSkills')} className="self-center mb-lg">✕</Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mb-xl">
                        <div className="flex justify-between items-center mb-md">
                            <h3 className="m-0">Optional Skills</h3>
                            <Button type="button" variant="secondary" onClick={() => addSkill('optionalSkills')}>+ Add Skill</Button>
                        </div>
                        {optionalSkills.map((skill, index) => (
                            <div key={index} className="flex gap-sm mb-sm">
                                <div className="flex-3">
                                    <Input
                                        value={skill.skillName}
                                        onChange={(e) => onSkillChange(index, 'skillName', e.target.value, 'optionalSkills')}
                                        placeholder="Skill Name (e.g. Docker)"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={skill.weight}
                                        onChange={(e) => onSkillChange(index, 'weight', e.target.value, 'optionalSkills')}
                                        placeholder="Weight"
                                    />
                                </div>
                                {optionalSkills.length > 0 && (
                                    <Button type="button" variant="secondary" onClick={() => removeSkill(index, 'optionalSkills')} className="self-center mb-lg">✕</Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-sm">
                        <Button type="submit" variant="primary" className="flex-1">Create Role</Button>
                        <Button type="button" variant="secondary" onClick={() => navigate('/hr/dashboard')} className="flex-1">Cancel</Button>
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
