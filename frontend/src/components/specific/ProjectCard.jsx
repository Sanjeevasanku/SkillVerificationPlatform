import React from 'react';
import Card from '../common/Card';

const ScoreRing = ({ score, label, color }) => {
    const pct = Math.round((score || 0) * 100);
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (pct / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="30" cy="30" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
                    <circle
                        cx="30" cy="30" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <span style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.7rem', fontWeight: '800', color
                }}>
                    {pct}%
                </span>
            </div>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                {label}
            </span>
        </div>
    );
};

const getScoreLabel = (score) => {
    if (score >= 0.75) return { text: 'Excellent', color: '#22c55e' };
    if (score >= 0.50) return { text: 'Good', color: '#eab308' };
    if (score >= 0.25) return { text: 'Fair', color: '#f97316' };
    return { text: 'Low', color: '#ef4444' };
};

const ProjectCard = ({ project }) => {
    const getContributionColor = (percent) => {
        if (percent >= 70) return '#22c55e';
        if (percent >= 30) return '#eab308';
        return '#ef4444';
    };

    const consistencyLabel = getScoreLabel(project.commitConsistencyScore || 0);
    const authenticityLabel = getScoreLabel(project.projectAuthenticityScore || 0);
    const avgScore = ((project.commitConsistencyScore || 0) + (project.projectAuthenticityScore || 0)) / 2;
    const overallLabel = getScoreLabel(avgScore);

    return (
        <Card className="project-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--brand-color)', flex: 1, marginRight: '12px' }}>{project.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
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

            {/* Description */}
            <p style={{ marginBottom: '1.25rem', flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {project.description}
            </p>

            {/* Trust Metrics */}
            <div style={{
                marginBottom: '1.25rem',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, rgba(var(--brand-rgb, 99,102,241),0.04) 0%, rgba(34,197,94,0.03) 100%)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', fontWeight: '700' }}>
                        Trust Metrics
                    </h4>
                    <span style={{
                        fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px',
                        borderRadius: '50px', background: overallLabel.color + '18', color: overallLabel.color
                    }}>
                        {overallLabel.text}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    {/* Consistency Ring */}
                    <div title="Measures how consistently you committed over time. Rewards long-term steady work.">
                        <ScoreRing
                            score={project.commitConsistencyScore}
                            label="Consistency"
                            color="#818cf8"
                        />
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '50px', background: 'var(--border-color)' }} />

                    {/* Authenticity Ring */}
                    <div title="Reflects genuine effort: your contribution %, commit volume, consistency, and skills.">
                        <ScoreRing
                            score={project.projectAuthenticityScore}
                            label="Authenticity"
                            color="#22c55e"
                        />
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '50px', background: 'var(--border-color)' }} />

                    {/* Meta Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {project.activeWeeks > 0 && (
                            <span>🗓 <strong>{project.activeWeeks}w</strong> active</span>
                        )}
                        {project.totalCommitCount > 0 && (
                            <span>📝 <strong>{project.totalCommitCount}</strong> commits</span>
                        )}
                        {project.stars > 0 && (
                            <span>⭐ <strong>{project.stars}</strong> stars</span>
                        )}
                    </div>
                </div>

                {/* Inline score labels */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: '#818cf820', color: '#818cf8', fontWeight: '600' }}>
                        Consistency: {consistencyLabel.text}
                    </span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: authenticityLabel.color + '20', color: authenticityLabel.color, fontWeight: '600' }}>
                        Authenticity: {authenticityLabel.text}
                    </span>
                </div>
            </div>

            {/* Tech Stack */}
            <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.75rem', letterSpacing: '0.07em', fontWeight: '700' }}>
                    Verified Tech Stack
                </h4>
                {project.skills && project.skills.length > 0 ? (
                    <div style={{
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
                        height: '120px', padding: '8px 0', gap: '6px',
                        background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)', paddingTop: '28px'
                    }}>
                        {project.skills.map((skill, i) => {
                            const barColor = `hsl(${(i * 47 + 210) % 360}, 70%, 60%)`;
                            return (
                                <div key={i} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative'
                                }}>
                                    <div
                                        title={`${skill.name}: ${(skill.confidenceScore * 100).toFixed(0)}%`}
                                        style={{
                                            width: '100%', maxWidth: '32px',
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

            {/* Footer */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {project.primaryLanguage && `🔵 ${project.primaryLanguage}`}
                </span>
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
