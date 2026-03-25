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
    }, [roleId, apiBase]);

    if (loading) return <Layout><div className="p-xl">Loading...</div></Layout>;
    if (!data) return <Layout><div className="p-xl">Role not found.</div></Layout>;

    const { role, rankedStudents } = data;

    return (
        <Layout>
            <div className="p-xl">
                <Link to={dashboardPath} className="text-brand mb-md inline-block no-underline">← Back to Dashboard</Link>

                <div className="mb-2xl">
                    <h1 className="text-3xl mb-md">{role.title}</h1>
                    <p className="text-md text-secondary max-w-800 leading-relaxed">{role.description}</p>
                </div>

                <h2 className="mb-lg">Ranked Candidates</h2>

                <div className="flex flex-col gap-md">
                    {rankedStudents.length > 0 ? (
                        rankedStudents.map((student, index) => (
                            <div key={student.studentId} className="card flex flex-row justify-between items-center w-full">
                                <div className="flex-1">
                                    <div className="flex items-center gap-md mb-sm">
                                        <span className="rank-badge" style={{
                                            background: index === 0 ? 'rgba(245, 158, 11, 0.15)' : /* Gold-ish */
                                                index === 1 ? 'rgba(156, 163, 175, 0.15)' : /* Silver-ish */
                                                    index === 2 ? 'rgba(180, 83, 9, 0.1)' : /* Bronze-ish */
                                                        'var(--bg-primary)',
                                            color: index === 0 ? '#b45309' :
                                                index === 1 ? '#4b5563' :
                                                    index === 2 ? '#78350f' :
                                                        'var(--text-secondary)'
                                        }}>
                                            {index + 1}
                                        </span>
                                        <h3 className="m-0">{student.name}</h3>
                                        <span className="status-badge" style={{
                                            backgroundColor:
                                                student.label === 'Highly Ready' ? 'rgba(5, 118, 66, 0.08)' :
                                                    student.label === 'Moderately Ready' ? 'rgba(245, 158, 11, 0.08)' :
                                                        'rgba(204, 16, 22, 0.08)',
                                            color:
                                                student.label === 'Highly Ready' ? 'var(--success-color)' :
                                                    student.label === 'Moderately Ready' ? '#b45309' /* Darker warning for text */ :
                                                        'var(--error-color)',
                                            border: `1px solid ${student.label === 'Highly Ready' ? 'rgba(5, 118, 66, 0.2)' :
                                                student.label === 'Moderately Ready' ? 'rgba(245, 158, 11, 0.2)' :
                                                    'rgba(204, 16, 22, 0.2)'
                                                }`
                                        }}>
                                            {student.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-sm text-sm text-secondary">
                                        <div className="flex gap-lg">
                                            <div>
                                                <span className="font-bold text-primary">{(student.readinessScore * 100).toFixed(0)}%</span> Match
                                            </div>
                                        </div>

                                        {(() => {
                                            const matched = student.skillBreakdown?.filter(s => s.score >= 0.6).map(s => s.skill) || [];
                                            return matched.length > 0 && (
                                                <div className="flex flex-wrap gap-sm items-center">
                                                    <span className="text-success font-semibold min-w-100">✓ Existing:</span>
                                                    {matched.map(s => (
                                                        <span key={s} className="skill-match-tag">{s}</span>
                                                    ))}
                                                </div>
                                            );
                                        })()}

                                        {student.weakSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-sm items-center">
                                                <span className="text-warning font-semibold min-w-100">⚠ Weak in:</span>
                                                {student.weakSkills.map(s => (
                                                    <span key={s} className="skill-weak-tag">{s}</span>
                                                ))}
                                            </div>
                                        )}

                                        {student.missingSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-sm items-center">
                                                <span className="text-error font-semibold min-w-100">✕ Missing:</span>
                                                {student.missingSkills.map(s => (
                                                    <span key={s} className="skill-missing-tag">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-10px pr-md">
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

