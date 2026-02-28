import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    const getContributionColor = (percent) => {
        if (percent >= 70) return 'var(--success-color)';
        if (percent >= 30) return '#eab308';
        return 'var(--error-color)';
    };

    const hasSkills = project.skills && project.skills.length > 0;
    const testTaken = project.testScore !== undefined && project.testScore !== null;

    return (
        <Card className="project-card" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--brand-color)' }}>{project.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
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

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {testTaken ? (
                    <span style={{
                        padding: '4px 14px',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: '#fff',
                        backgroundColor: project.testScore >= 4 ? 'var(--success-color)' : project.testScore >= 2 ? '#eab308' : 'var(--error-color)',
                    }}>
                        Test: {project.testScore}/{project.testScore <= 4 ? 4 : 6}
                    </span>
                ) : hasSkills ? (
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate(`/skill-test/${project._id}`)}
                    >
                        🧪 Take Skill Test
                    </Button>
                ) : (
                    <span></span>
                )}

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
