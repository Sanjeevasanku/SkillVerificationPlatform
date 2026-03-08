import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { ConfirmDialog } from '../components/common/Dialog';
import Input from '../components/common/Input';

const BAND_FILTERS = ['all', 'amber', 'red'];

const bandColors = {
    green: { bg: 'rgba(5, 118, 66, 0.1)', color: '#05763e', border: '#05763e' },
    amber: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '#d97706' },
    red: { bg: 'rgba(204, 16, 22, 0.1)', color: '#cc1016', border: '#cc1016' }
};

const ReviewQueue = () => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeBand, setActiveBand] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    // Dialog state
    const [dialog, setDialog] = useState({
        isOpen: false, type: 'confirm', title: '', message: '',
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

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    // ─── Filter tab pill styles ───
    const filterPillStyle = (band) => ({
        padding: '0.45rem 1.1rem',
        border: 'none',
        cursor: 'pointer',
        fontWeight: activeBand === band ? '700' : '500',
        fontSize: '0.88rem',
        background: activeBand === band ? 'var(--brand-color)' : 'transparent',
        color: activeBand === band ? '#fff' : 'var(--text-secondary)',
        borderRadius: '50px',
        textTransform: 'capitalize',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
    });

    const dotStyle = (color) => ({
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        display: 'inline-block'
    });

    // ─── Score box in expanded area ───
    const scoreBoxStyle = {
        background: 'var(--bg-primary)',
        borderRadius: '10px',
        padding: '0.9rem 1rem',
        textAlign: 'center',
        minWidth: '120px',
        flex: '1'
    };

    const scoreValueStyle = {
        fontSize: '1.35rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '0.25rem'
    };

    const scoreLabelStyle = {
        fontSize: '0.72rem',
        color: 'var(--text-secondary)',
        fontWeight: '500'
    };

    return (
        <Layout>
            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem', fontWeight: '800' }}>Review Queue</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Review repositories flagged for manual verification. {repos.length} pending.
                    </p>
                </div>

                {/* Band filter pills */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button style={filterPillStyle('all')} onClick={() => setActiveBand('all')}>
                        All Pending
                    </button>
                    <button style={filterPillStyle('red')} onClick={() => setActiveBand('red')}>
                        <span style={dotStyle('#cc1016')} /> High 
                    </button>
                    <button style={filterPillStyle('amber')} onClick={() => setActiveBand('amber')}>
                        <span style={dotStyle('#d97706')} /> Medium 
                    </button>
                </div>

                {/* Cards */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="loader"></div></div>
                ) : repos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-secondary)' }}> No repositories pending review!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {repos.map(repo => {
                            const isExpanded = expandedId === repo._id;
                            const bc = bandColors[repo.riskBand] || bandColors.amber;
                            const scorePercent = ((repo.authorshipScore || 0) * 100).toFixed(0);

                            // Compute individual signal scores for display
                            const contributionScore = Math.min((repo.contributionPercentage || 0), 100);
                            const commitVolume = repo.commitCountByStudent || 0;
                            const totalCommits = repo.totalCommitCount || 0;
                            const commitVolumeScore = totalCommits > 0 ? Math.round((commitVolume / totalCommits) * 100) : 0;
                            const consistencyScore = Math.round((repo.commitConsistencyScore || 0) * 100);
                            const ownershipScore = repo.repoOwnerType === 'User' && !repo.isFork ? 100 : 0;
                            const maturityScore = Math.min(Math.round(((repo.activeWeeks || 0) / 8) * 100), 100);

                            return (
                                <div key={repo._id} style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '12px',
                                    borderLeft: `4px solid ${bc.border}`,
                                    border: `1px solid var(--border-color)`,
                                    borderLeftWidth: '4px',
                                    borderLeftColor: bc.border,
                                    overflow: 'hidden',
                                    transition: 'box-shadow 0.2s ease'
                                }}>
                                    {/* ─── Collapsed header ─── */}
                                    <div style={{
                                        padding: '1.1rem 1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        {/* Left: title + badge + student info */}
                                        <div style={{ flex: '1', minWidth: '200px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                                                    {repo.title}
                                                </span>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '2px 10px',
                                                    borderRadius: '50px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700',
                                                    backgroundColor: bc.bg,
                                                    color: bc.color,
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {repo.riskBand} — {scorePercent}%
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                {repo.student?.fullName || 'Unknown'} • {repo.student?.college || ''} • Batch {repo.student?.graduationYear || ''}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontStyle: 'italic' }}>
                                                {repo.verificationReason || 'Queued for manual review'}
                                            </div>
                                        </div>

                                        {/* Right: actions */}
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                                            <button
                                                onClick={() => toggleExpand(repo._id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '6px',
                                                    padding: '0.35rem 0.85rem',
                                                    fontSize: '0.82rem',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-primary)',
                                                    fontWeight: '500',
                                                    transition: 'background 0.15s'
                                                }}
                                            >
                                                {isExpanded ? 'Hide Details' : 'Details'}
                                            </button>
                                            <Button variant="primary"
                                                style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}
                                                onClick={() => handleApprove(repo._id)}>
                                                ✓ Approve
                                            </Button>
                                            <Button variant="ghost"
                                                style={{
                                                    padding: '0.35rem 0.9rem', fontSize: '0.82rem',
                                                    color: 'var(--error-color)', border: '1px solid var(--error-color)',
                                                    borderRadius: '6px'
                                                }}
                                                onClick={() => openRejectModal(repo._id)}>
                                                ✕ Reject
                                            </Button>
                                        </div>
                                    </div>

                                    {/* ─── Expanded details ─── */}
                                    {isExpanded && (
                                        <div style={{
                                            borderTop: '1px solid var(--border-color)',
                                            padding: '1.25rem',
                                            animation: 'fadeIn 0.2s ease'
                                        }}>
                                            {/* Score Breakdown */}
                                            <h4 style={{
                                                fontSize: '0.78rem',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.75rem'
                                            }}>
                                                Score Breakdown
                                            </h4>
                                            <div style={{
                                                display: 'flex',
                                                gap: '0.75rem',
                                                flexWrap: 'wrap',
                                                marginBottom: '1.25rem'
                                            }}>
                                                <div style={scoreBoxStyle}>
                                                    <div style={scoreValueStyle}>{contributionScore}%</div>
                                                    <div style={scoreLabelStyle}>Contribution Score</div>
                                                </div>
                                                <div style={scoreBoxStyle}>
                                                    <div style={scoreValueStyle}>{commitVolumeScore}%</div>
                                                    <div style={scoreLabelStyle}>Commit Volume Score</div>
                                                </div>
                                                <div style={scoreBoxStyle}>
                                                    <div style={scoreValueStyle}>{consistencyScore}%</div>
                                                    <div style={scoreLabelStyle}>Consistency Score</div>
                                                </div>
                                                <div style={scoreBoxStyle}>
                                                    <div style={scoreValueStyle}>{ownershipScore}%</div>
                                                    <div style={scoreLabelStyle}>Ownership Score</div>
                                                </div>
                                                <div style={scoreBoxStyle}>
                                                    <div style={scoreValueStyle}>{maturityScore}%</div>
                                                    <div style={scoreLabelStyle}>Maturity Score</div>
                                                </div>
                                            </div>

                                            {/* Stats row */}
                                            <div style={{
                                                display: 'flex',
                                                gap: '2rem',
                                                flexWrap: 'wrap',
                                                fontSize: '0.88rem',
                                                marginBottom: '1rem'
                                            }}>
                                                <div>
                                                    <strong>Contribution:</strong> {contributionScore}%
                                                </div>
                                                <div>
                                                    <strong>Commits (student):</strong> {commitVolume}
                                                </div>
                                                <div>
                                                    <strong>Commits (total):</strong> {totalCommits}
                                                </div>
                                                <div>
                                                    <strong>Language:</strong> {repo.primaryLanguage || '—'}
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                gap: '2rem',
                                                flexWrap: 'wrap',
                                                fontSize: '0.88rem',
                                                marginBottom: '1rem'
                                            }}>
                                                <div>
                                                    <strong>Stars:</strong> {repo.stars ?? 0} &nbsp; <strong>Forks:</strong> {repo.forks ?? 0}
                                                </div>
                                                <div>
                                                    <strong>Active weeks:</strong> {repo.activeWeeks ?? 0}
                                                </div>
                                            </div>

                                            {/* GitHub link */}
                                            {repo.githubLink && (
                                                <a href={repo.githubLink} target="_blank" rel="noreferrer"
                                                    style={{
                                                        color: 'var(--brand-color)',
                                                        fontSize: '0.88rem',
                                                        fontWeight: '600',
                                                        textDecoration: 'none'
                                                    }}>
                                                    View on GitHub ↗
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
