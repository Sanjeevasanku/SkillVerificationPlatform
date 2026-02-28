import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { AlertDialog } from '../components/common/Dialog';

const RoleDetails = () => {
    const { roleId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '' });

    const showAlertDialog = (title, message) => setDialog({ isOpen: true, title, message });
    const closeDialog = () => setDialog({ ...dialog, isOpen: false });

    useEffect(() => {
        const fetchRoleDetails = async () => {
            try {
                const res = await api.get(`/hr/roles/${roleId}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching role details:', err);
                setLoading(false);
            }
        };

        fetchRoleDetails();
    }, [roleId]);

    if (loading) return <Layout><div style={{ padding: '2rem' }}>Loading...</div></Layout>;
    if (!data) return <Layout><div style={{ padding: '2rem' }}>Role not found.</div></Layout>;

    const { role, rankedStudents } = data;

    return (
        <Layout>
            <div style={{ padding: '2rem' }}>
                <Link to="/hr/dashboard" style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'inline-block' }}>← Back to Dashboard</Link>

                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{role.title}</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: '1.6' }}>{role.description}</p>
                </div>

                <h2 style={{ marginBottom: '1.5rem' }}>Ranked Candidates</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {rankedStudents.length > 0 ? (
                        rankedStudents.map((student, index) => (
                            <div key={student.studentId} style={{
                                background: 'var(--bg-secondary)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '0.5rem' }}>
                                        <span style={{
                                            background: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--bg-primary)',
                                            color: index < 3 ? 'black' : 'var(--text-primary)',
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                        }}>
                                            {index + 1}
                                        </span>
                                        <h3 style={{ margin: 0 }}>{student.name}</h3>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            backgroundColor:
                                                student.label === 'Highly Ready' ? 'rgba(0, 255, 0, 0.1)' :
                                                    student.label === 'Moderately Ready' ? 'rgba(255, 165, 0, 0.1)' :
                                                        'rgba(255, 0, 0, 0.1)',
                                            color:
                                                student.label === 'Highly Ready' ? '#00ff00' :
                                                    student.label === 'Moderately Ready' ? '#ffa500' :
                                                        '#ff0000',
                                            border: `1px solid ${student.label === 'Highly Ready' ? '#00ff0033' :
                                                student.label === 'Moderately Ready' ? '#ffa50033' :
                                                    '#ff000033'
                                                }`
                                        }}>
                                            {student.label}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <div>
                                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{(student.readinessScore * 100).toFixed(0)}%</span> Match
                                        </div>
                                        {student.weakSkills.length > 0 && (
                                            <div>
                                                <span style={{ color: 'var(--warning-color)' }}>⚠ {student.weakSkills.length} Weak Skills</span>
                                            </div>
                                        )}
                                        {student.missingSkills.length > 0 && (
                                            <div>
                                                <span style={{ color: 'var(--error-color)' }}>✕ {student.missingSkills.length} Missing</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Link to={`/hr/students/${student.studentId}`}>
                                        <Button variant="secondary">Profile</Button>
                                    </Link>
                                    <Button variant="primary" onClick={() => showAlertDialog('Hire Candidate', 'Contact request sent to ' + student.name)}>Hire</Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No candidates found matching this role criteria.</p>
                    )}
                </div>

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

export default RoleDetails;
