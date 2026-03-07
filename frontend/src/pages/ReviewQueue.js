import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { AlertDialog, ConfirmDialog } from '../components/common/Dialog';
import Input from '../components/common/Input';

const BAND_FILTERS = ['all', 'amber', 'red'];

const bandBadgeStyle = (band) => {
    const colors = {
        green: { bg: 'rgba(5, 118, 66, 0.1)', color: 'var(--success-color)' },
        amber: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' },
        red: { bg: 'rgba(204, 16, 22, 0.1)', color: 'var(--error-color)' }
    };
    const c = colors[band] || colors.amber;
    return {
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '50px',
        fontSize: '0.78rem',
        fontWeight: '700',
        backgroundColor: c.bg,
        color: c.color,
        textTransform: 'uppercase'
    };
};

const ReviewQueue = () => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeBand, setActiveBand] = useState('all');

    // Dialog state
    const [dialog, setDialog] = useState({
        isOpen: false, type: 'alert', title: '', message: '',
        onConfirm: () => { }, confirmText: 'OK', variant: 'primary'
    });
    const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

    // Reject notes state
    const [rejectNotes, setRejectNotes] = useState('');
    const [rejectTarget, setRejectTarget] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const fetchQueue = async (band) => {
        setLoading(true);
        try {
            const url = band === 'all'
                ? '/admin/repositories/review-queue'
                : `/admin/repositories/review-queue?band=${band}`;
            const res = await api.get(url);
            setRepos(res.data);
        } catch (err) {
            console.error('Error fetching review queue:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue(activeBand);
    }, [activeBand]);

    const handleApprove = (repoId) => {
        setDialog({
            isOpen: true, type: 'confirm',
            title: 'Approve Repository',
            message: 'Are you sure you want to approve this repository? It will be marked as verified.',
            onConfirm: async () => {
                try {
                    await api.post(`/admin/repositories/${repoId}/approve`, { notes: 'Approved after manual review' });
                    setRepos(repos.filter(r => r._id !== repoId));
                    closeDialog();
                } catch (err) {
                    console.error('Error approving:', err);
                }
            },
            confirmText: 'Approve', variant: 'primary'
        });
    };

    const openRejectModal = (repoId) => {
        setRejectTarget(repoId);
        setRejectNotes('');
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!rejectNotes.trim()) return;
        try {
            await api.post(`/admin/repositories/${rejectTarget}/reject`, { notes: rejectNotes });
            setRepos(repos.filter(r => r._id !== rejectTarget));
            setShowRejectModal(false);
            setRejectTarget(null);
        } catch (err) {
            console.error('Error rejecting:', err);
        }
    };

    const tabStyle = (band) => ({
        padding: '0.5rem 1.25rem',
        border: 'none',
        cursor: 'pointer',
        fontWeight: activeBand === band ? '700' : '500',
        fontSize: '0.9rem',
        background: activeBand === band ? 'var(--bg-secondary)' : 'transparent',
        color: activeBand === band ? 'var(--brand-color)' : 'var(--text-secondary)',
        borderBottom: activeBand === band ? '2px solid var(--brand-color)' : '2px solid transparent',
        borderRadius: '8px 8px 0 0',
        textTransform: 'capitalize',
        transition: 'all 0.2s ease'
    });

    const thStyle = {
        textAlign: 'left', padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        color: 'var(--text-secondary)', fontSize: '0.8rem',
        fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'
    };

    const tdStyle = {
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.9rem'
    };

    return (
        <Layout>
            <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Review Queue</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Repositories flagged for manual review based on authorship scoring.
                    </p>
                </div>

                {/* Band filter tabs */}
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                    {BAND_FILTERS.map(b => (
                        <button key={b} style={tabStyle(b)} onClick={() => setActiveBand(b)}>
                            {b === 'all' ? `All (${repos.length})` : b}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="loader"></div></div>
                ) : repos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>🎉 No repositories pending review!</p>
                    </div>
                ) : (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Student</th>
                                    <th style={thStyle}>Repository</th>
                                    <th style={thStyle}>Score</th>
                                    <th style={thStyle}>Band</th>
                                    <th style={thStyle}>Contribution</th>
                                    <th style={thStyle}>Reason</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repos.map(repo => (
                                    <tr key={repo._id}
                                        style={{ transition: 'background 0.15s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={tdStyle}>
                                            <strong>{repo.student?.fullName || 'Unknown'}</strong>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {repo.student?.email}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <a href={repo.githubLink} target="_blank" rel="noreferrer"
                                                style={{ color: 'var(--brand-color)', fontWeight: '600' }}>
                                                {repo.title}
                                            </a>
                                        </td>
                                        <td style={tdStyle}>
                                            <strong>{(repo.authorshipScore * 100).toFixed(0)}%</strong>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={bandBadgeStyle(repo.riskBand)}>{repo.riskBand}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            {repo.contributionPercentage}%
                                        </td>
                                        <td style={{ ...tdStyle, maxWidth: '200px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {repo.verificationReason}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <Button variant="primary"
                                                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                                                    onClick={() => handleApprove(repo._id)}>
                                                    Approve
                                                </Button>
                                                <Button variant="ghost"
                                                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--error-color)' }}
                                                    onClick={() => openRejectModal(repo._id)}>
                                                    Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Approve dialog */}
                {dialog.type === 'confirm' && (
                    <ConfirmDialog
                        isOpen={dialog.isOpen}
                        title={dialog.title}
                        message={dialog.message}
                        onConfirm={dialog.onConfirm}
                        onCancel={closeDialog}
                        confirmText={dialog.confirmText}
                        variant={dialog.variant}
                    />
                )}

                {/* Reject modal with notes */}
                {showRejectModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            background: 'var(--bg-secondary)', borderRadius: '12px',
                            padding: '2rem', maxWidth: '480px', width: '90%'
                        }}>
                            <h3 style={{ marginBottom: '1rem' }}>Reject Repository</h3>
                            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Please provide a reason for rejection. This will be visible to the student.
                            </p>
                            <textarea
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="Reason for rejection (required)..."
                                rows={4}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)', fontSize: '0.9rem',
                                    marginBottom: '1rem', resize: 'vertical'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                                <Button variant="primary"
                                    style={{ backgroundColor: 'var(--error-color)' }}
                                    onClick={handleReject}
                                    disabled={!rejectNotes.trim()}>
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ReviewQueue;
