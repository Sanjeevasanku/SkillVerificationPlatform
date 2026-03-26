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
                className="project-card-badge"
                style={{ backgroundColor: s.bg, color: s.color }}>
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
        <div className="project-card-stat-item">
            <span className="text-secondary">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );

    return (
        <Card className={`project-card flex flex-col relative overflow-hidden ${expanded ? 'project-card-h-expanded' : 'project-card-h-collapsed'}`}>
            <div className="project-card-title-section">
                <h3 className="m-0 text-xl text-brand">{project.title}</h3>
                <div className="project-card-badges-col">
                    {getVerificationBadge()}
                    <span
                        className="project-card-badge text-white"
                        style={{ backgroundColor: getContributionColor(project.contributionPercentage) }}
                    >
                        {project.contributionPercentage}% Contrib
                    </span>
                    {project.isFork && (
                        <span className="text-xs text-tertiary">Forked Repo</span>
                    )}
                    {project.repoOwnerType === 'Organization' && (
                        <span className="text-xs" style={{ color: '#a78bfa' }}>Org Repo</span>
                    )}
                </div>
            </div>

            <p className="project-card-desc">
                {project.description}
            </p>

            <div className="mb-lg">
                <div className="flex justify-between items-center mb-sm">
                    <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: 0, letterSpacing: '0.05em' }}>Verified Tech Stack</h4>
                    {project.riskBand === 'red' && (
                        <span className="text-error text-xs font-bold flex items-center gap-xs">
                            ⚠️ Low Reliability
                        </span>
                    )}
                </div>
                {hasSkills ? (
                    <div className={`project-card-skills-container ${project.riskBand === 'red' ? 'opacity-70' : ''}`}>
                        {project.skills.map((skill, i) => {
                            let barColor = 'var(--brand-color)';
                            if (project.riskBand === 'red') barColor = 'var(--error-color)';
                            else if (project.riskBand === 'amber') barColor = '#eab308';

                            return (
                                <div key={i} className="project-card-skill-col">
                                    <div
                                        title={`${skill.name}: ${(skill.confidenceScore * 100).toFixed(0)}% ${project.riskBand !== 'green' ? '(Inconsistency detected in metrics)' : ''}`}
                                        className="project-card-skill-bar"
                                        style={{
                                            height: `${skill.confidenceScore * 100}%`,
                                            backgroundColor: barColor
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
                                    <span className="project-card-skill-label">
                                        {skill.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-tertiary italic">
                        ⏳ Skill analysis running in background…
                    </p>
                )}
                {project.riskBand !== 'green' && (
                    <p className="text-xs mt-sm italic" style={{ color: project.riskBand === 'red' ? 'var(--error-color)' : '#d97706' }}>
                        * Inconsistencies detected in authorship or commit patterns.
                    </p>
                )}
            </div>

            {/* ─── Expandable details section ─── */}
            {expanded && (
                <div className="project-card-expanded-content">
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
                        <span className="project-card-badge" style={{
                            textTransform: 'capitalize',
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

            <div className="project-card-footer">
                {/* Down arrow toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="project-card-toggle-btn"
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
                    className="text-brand no-underline font-semibold flex items-center gap-xs text-sm"
                >
                    View on GitHub <span>↗</span>
                </a>
            </div>
        </Card>
    );
};

export default ProjectCard;
