import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

import { AlertDialog } from '../components/common/Dialog';


const RoleDetails = () => {
    const { roleId } = useParams();
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const apiBase = isAdminRoute ? '/admin' : '/hr';
    const dashboardPath = isAdminRoute ? '/admin/dashboard' : '/hr/dashboard';
    const studentBasePath = isAdminRoute ? '/admin/students' : '/hr/students';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '' });

    const showAlertDialog = (title, message) => setDialog({ isOpen: true, title, message });
    const closeDialog = () => setDialog({ ...dialog, isOpen: false });

    useEffect(() => {
        const fetchRoleDetails = async () => {
            try {
                const res = await api.get(`${apiBase}/roles/${roleId}`);
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
                <Link to={dashboardPath} style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'inline-block' }}>← Back to Dashboard</Link>

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

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div>
                                                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{(student.readinessScore * 100).toFixed(0)}%</span> Match
                                            </div>
                                        </div>

                                        {(() => {
                                            const matched = student.skillBreakdown?.filter(s => s.score >= 0.6).map(s => s.skill) || [];
                                            return matched.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--success-color)', fontWeight: '600', minWidth: '100px' }}>✓ Existing:</span>
                                                    {matched.map(s => (
                                                        <span key={s} style={{
                                                            padding: '2px 8px', border: '1px solid var(--success-color)',
                                                            borderRadius: '4px', fontSize: '0.75rem', color: 'var(--success-color)',
                                                            backgroundColor: 'rgba(5, 118, 66, 0.05)'
                                                        }}>{s}</span>
                                                    ))}
                                                </div>
                                            );
                                        })()}

                                        {student.weakSkills.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--warning-color)', fontWeight: '600', minWidth: '100px' }}>⚠ Weak in:</span>
                                                {student.weakSkills.map(s => (
                                                    <span key={s} style={{
                                                        padding: '2px 8px', border: '1px solid var(--warning-color)',
                                                        borderRadius: '4px', fontSize: '0.75rem', color: 'var(--warning-color)',
                                                        backgroundColor: 'rgba(245, 158, 11, 0.05)'
                                                    }}>{s}</span>
                                                ))}
                                            </div>
                                        )}

                                        {student.missingSkills.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--error-color)', fontWeight: '600', minWidth: '100px' }}>✕ Missing:</span>
                                                {student.missingSkills.map(s => (
                                                    <span key={s} style={{
                                                        padding: '2px 8px', border: '1px solid var(--error-color)',
                                                        borderRadius: '4px', fontSize: '0.75rem', color: 'var(--error-color)',
                                                        backgroundColor: 'rgba(239, 68, 68, 0.05)'
                                                    }}>{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Link to={`${studentBasePath}/${student.studentId}`}>
                                        <Button variant="secondary">Profile</Button>
                                    </Link>
                                    {/* <Button variant="primary" onClick={() => showAlertDialog('Hire Candidate', 'Contact request sent to ' + student.name)}>Hire</Button> */}
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

