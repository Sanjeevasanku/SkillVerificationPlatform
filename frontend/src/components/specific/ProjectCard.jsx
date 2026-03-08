import React, { useState } from 'react';
import Card from '../common/Card';

const ProjectCard = ({ project }) => {
    const [expanded, setExpanded] = useState(false);

    const getContributionColor = (percent) => {
        if (percent >= 70) return 'var(--success-color)';
        if (percent >= 30) return '#eab308';
        return 'var(--error-color)';
    };

    const getVerificationBadge = () => {
        const status = project.verificationStatus;
        const styles = {
            verified: { bg: 'rgba(5,118,66,0.1)', color: 'var(--success-color)', label: '✓ Verified' },
            pending_review: { bg: 'rgba(245,158,11,0.1)', color: 'var(--warning-color)', label: '⏳ Under Review' },
            rejected: { bg: 'rgba(204,16,22,0.1)', color: 'var(--error-color)', label: '✗ Rejected' },
        };
        const s = styles[status] || styles.verified;
        return (
            <span title={status === 'rejected' ? project.verificationReason : ''}
                style={{
                    padding: '3px 10px', borderRadius: '50px', fontSize: '0.72rem',
                    fontWeight: '700', backgroundColor: s.bg, color: s.color, whiteSpace: 'nowrap'
                }}>
                {s.label}
            </span>
        );
    };

    const hasSkills = project.skills && project.skills.length > 0;

    // Compute displayable stats
    const consistencyScore = project.commitConsistencyScore != null
        ? Math.round(project.commitConsistencyScore * 100) : null;
    const authorshipPercent = project.authorshipScore != null
        ? Math.round(project.authorshipScore * 100) : null;

    const statItem = (label, value) => (
        <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '0.35rem 0',
            fontSize: '0.84rem'
        }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontWeight: '600' }}>{value}</span>
        </div>
    );

    return (
        <Card className="project-card" style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            height: expanded ? 'auto' : '500px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--brand-color)' }}>{project.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {getVerificationBadge()}
                    <span style={{
                        padding: '3px 10px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: '700',
                        color: '#fff', backgroundColor: getContributionColor(project.contributionPercentage), whiteSpace: 'nowrap'
                    }}>
                        {project.contributionPercentage}% Contrib
                    </span>
                    {project.isFork && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Forked Repo</span>
                    )}
                    {project.repoOwnerType === 'Organization' && (
                        <span style={{ fontSize: '0.68rem', color: '#a78bfa' }}>Org Repo</span>
                    )}
                </div>
            </div>

            <p style={{ marginBottom: '1.5rem', minHeight: '3em', color: 'var(--text-secondary)' }}>
                {project.description}
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Verified Tech Stack</h4>
                {hasSkills ? (
                    <div style={{
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
                        height: '140px', padding: '8px 0', gap: '8px',
                        background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)', paddingTop: '28px'
                    }}>
                        {project.skills.map((skill, i) => {
                            const barColor = 'var(--brand-color)';
                            return (
                                <div key={i} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative'
                                }}>
                                    <div
                                        title={`${skill.name}: ${(skill.confidenceScore * 100).toFixed(0)}%`}
                                        style={{
                                            width: '100%', maxWidth: '28px',
                                            height: `${skill.confidenceScore * 100}%`,
                                            backgroundColor: barColor,
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                            cursor: 'pointer', position: 'relative'
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute', top: '-20px', left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '0.6rem', fontWeight: '700', color: barColor
                                        }}>
                                            {(skill.confidenceScore * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <span style={{
                                        marginTop: '6px', fontSize: '0.62rem', fontWeight: '600',
                                        color: 'var(--text-secondary)', textAlign: 'center',
                                        whiteSpace: 'nowrap', overflow: 'hidden',
                                        textOverflow: 'ellipsis', width: '100%'
                                    }}>
                                        {skill.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        ⏳ Skill analysis running in background…
                    </p>
                )}
            </div>

            {/* ─── Expandable details section ─── */}
            {expanded && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <h4 style={{
                        fontSize: '0.72rem', textTransform: 'uppercase',
                        color: 'var(--text-secondary)', letterSpacing: '0.05em',
                        marginBottom: '0.5rem', fontWeight: '700'
                    }}>
                        Repository Details
                    </h4>
                    {statItem('Commits (student)', project.commitCountByStudent ?? '—')}
                    {statItem('Commits (total)', project.totalCommitCount ?? '—')}
                    {statItem('Contribution', `${project.contributionPercentage ?? 0}%`)}
                    {authorshipPercent != null && statItem('Authorship Score', `${authorshipPercent}%`)}
                    {consistencyScore != null && statItem('Consistency Score', `${consistencyScore}%`)}
                    {statItem('Stars', project.stars ?? 0)}
                    {statItem('Forks', project.forks ?? 0)}
                    {statItem('Active Weeks', project.activeWeeks ?? '—')}
                    {statItem('Primary Language', project.primaryLanguage || '—')}
                    {project.riskBand && statItem('Risk Band', (
                        <span style={{
                            padding: '1px 8px', borderRadius: '50px', fontSize: '0.72rem',
                            fontWeight: '700', textTransform: 'capitalize',
                            backgroundColor: project.riskBand === 'green' ? 'rgba(5,118,66,0.1)' :
                                project.riskBand === 'amber' ? 'rgba(245,158,11,0.1)' : 'rgba(204,16,22,0.1)',
                            color: project.riskBand === 'green' ? '#05763e' :
                                project.riskBand === 'amber' ? '#d97706' : '#cc1016'
                        }}>
                            {project.riskBand}
                        </span>
                    ))}
                </div>
            )}

            <div style={{
                marginTop: 'auto',
                paddingTop: '1rem', borderTop: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                {/* Down arrow toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        color: 'var(--text-secondary)', fontSize: '0.82rem',
                        fontWeight: '500', padding: '0.2rem 0',
                        transition: 'color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                    <span style={{
                        display: 'inline-block',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        fontSize: '0.9rem'
                    }}>
                        ▼
                    </span>
                    {expanded ? 'Less' : 'More'}
                </button>

                <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        textDecoration: 'none', color: 'var(--brand-color)',
                        fontSize: '0.88rem', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                >
                    View on GitHub <span>↗</span>
                </a>
            </div>
        </Card>
    );
};

export default ProjectCard;
