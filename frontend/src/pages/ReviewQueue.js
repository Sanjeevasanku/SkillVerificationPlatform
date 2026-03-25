import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { ConfirmDialog } from '../components/common/Dialog';

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

    return (
        <Layout>
            <div className="p-xl max-w-1100 mx-auto">
                {/* Header */}
                <div className="mb-lg">
                    <h1 className="text-3xl font-bold mb-xs">Review Queue</h1>
                    <p className="text-secondary text-md">
                        Review repositories flagged for manual verification. {repos.length} pending.
                    </p>
                </div>

                {/* Band filter pills */}
                <div className="flex gap-sm mb-lg">
                    <button className={`filter-pill ${activeBand === 'all' ? 'active' : ''}`} onClick={() => setActiveBand('all')}>
                        All Pending
                    </button>
                    <button className={`filter-pill ${activeBand === 'red' ? 'active' : ''}`} onClick={() => setActiveBand('red')}>
                        <span className="filter-pill-dot" style={{ background: '#cc1016' }} /> High 
                    </button>
                    <button className={`filter-pill ${activeBand === 'amber' ? 'active' : ''}`} onClick={() => setActiveBand('amber')}>
                        <span className="filter-pill-dot" style={{ background: '#d97706' }} /> Medium 
                    </button>
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="text-center p-xl"><div className="loader"></div></div>
                ) : repos.length === 0 ? (
                    <div className="text-center p-xl bg-secondary rounded-md">
                        <p className="text-secondary"> No repositories pending review!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-md">
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
                                <div key={repo._id} className="bg-secondary rounded-lg border-color overflow-hidden" style={{
                                    borderStyle: 'solid',
                                    borderWidth: '1px',
                                    borderLeftWidth: '4px',
                                    borderLeftColor: bc.border,
                                    transition: 'box-shadow 0.2s ease'
                                }}>
                                    {/* ─── Collapsed header ─── */}
                                    <div className="flex items-center justify-between gap-md flex-wrap py-md px-lg">
                                        {/* Left: title + badge + student info */}
                                        <div style={{ flex: '1', minWidth: '200px' }}>
                                            <div className="flex items-center gap-sm mb-xs flex-wrap">
                                                <span className="text-lg font-bold">
                                                    {repo.title}
                                                </span>
                                                <span className="project-card-badge" style={{
                                                    backgroundColor: bc.bg,
                                                    color: bc.color,
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {repo.riskBand} — {scorePercent}%
                                                </span>
                                            </div>
                                            <div className="text-sm text-secondary">
                                                {repo.student?.fullName || 'Unknown'} • {repo.student?.college || ''} • Batch {repo.student?.graduationYear || ''}
                                            </div>
                                            <div className="text-xs text-secondary mt-xs italic">
                                                {repo.verificationReason || 'Queued for manual review'}
                                            </div>
                                        </div>

                                        {/* Right: actions */}
                                        <div className="flex gap-sm items-center flex-shrink-0">
                                            <button
                                                onClick={() => toggleExpand(repo._id)}
                                                className="btn-ghost text-sm font-semibold rounded-md border-solid border-color transition-colors"
                                                style={{ padding: '0.35rem 0.85rem' }}
                                            >
                                                {isExpanded ? 'Hide Details' : 'Details'}
                                            </button>
                                            <Button variant="primary"
                                                style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}
                                                onClick={() => handleApprove(repo._id)}>
                                                ✓ Approve
                                            </Button>
                                            <Button variant="ghost"
                                                className="text-error border-solid"
                                                style={{
                                                    padding: '0.35rem 0.9rem', fontSize: '0.82rem',
                                                    borderColor: 'var(--error-color)',
                                                    borderRadius: '6px'
                                                }}
                                                onClick={() => openRejectModal(repo._id)}>
                                                ✕ Reject
                                            </Button>
                                        </div>
                                    </div>

                                    {/* ─── Expanded details ─── */}
                                    {isExpanded && (
                                        <div className="p-xl border-t border-color" style={{
                                            animation: 'fadeIn 0.2s ease',
                                            borderTopStyle: 'solid',
                                            borderTopWidth: '1px'
                                        }}>
                                            {/* Score Breakdown */}
                                            <h4 className="text-xs uppercase font-bold text-secondary tracking-wider mb-sm">
                                                Score Breakdown
                                            </h4>
                                            <div className="flex gap-md flex-wrap mb-xl">
                                                <div className="review-score-box">
                                                    <div className="review-score-value">{contributionScore}%</div>
                                                    <div className="review-score-label">Contribution Score</div>
                                                </div>
                                                <div className="review-score-box">
                                                    <div className="review-score-value">{commitVolumeScore}%</div>
                                                    <div className="review-score-label">Commit Volume Score</div>
                                                </div>
                                                <div className="review-score-box">
                                                    <div className="review-score-value">{consistencyScore}%</div>
                                                    <div className="review-score-label">Consistency Score</div>
                                                </div>
                                                <div className="review-score-box">
                                                    <div className="review-score-value">{ownershipScore}%</div>
                                                    <div className="review-score-label">Ownership Score</div>
                                                </div>
                                                <div className="review-score-box">
                                                    <div className="review-score-value">{maturityScore}%</div>
                                                    <div className="review-score-label">Maturity Score</div>
                                                </div>
                                            </div>

                                            {/* Stats row */}
                                            <div className="flex gap-xl flex-wrap text-sm mb-lg">
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
                                            <div className="flex gap-xl flex-wrap text-sm mb-lg">
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
                                                    className="text-brand text-sm font-semibold no-underline">
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
                    <div className="flex-center" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 1000
                    }}>
                        <div className="bg-secondary rounded-lg p-xl w-full" style={{ maxWidth: '480px' }}>
                            <h3 className="mb-lg">Reject Repository</h3>
                            <p className="text-secondary text-sm mb-lg">
                                Please provide a reason for rejection. This will be visible to the student.
                            </p>
                            <textarea
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="Reason for rejection (required)..."
                                rows={4}
                                className="w-full p-md rounded-md border-solid border-color bg-primary text-primary text-sm mb-lg"
                                style={{ resize: 'vertical' }}
                            />
                            <div className="flex gap-sm justify-end">
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
