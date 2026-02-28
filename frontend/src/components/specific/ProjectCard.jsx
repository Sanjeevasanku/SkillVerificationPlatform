import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

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

const ProjectCard = ({ project, onRefresh }) => {
    const navigate = useNavigate();
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!onRefresh || refreshing) return;
        setRefreshing(true);
        try {
            await onRefresh(project._id);
        } finally {
            setRefreshing(false);
        }
    };

    const getContributionColor = (percent) => {
        if (percent >= 70) return 'var(--success-color)';
        if (percent >= 30) return '#eab308';
        return 'var(--error-color)';
    };

    const hasSkills = project.skills && project.skills.length > 0;
    const testTaken = project.testScore !== undefined && project.testScore !== null;

    const consistencyScore = project.commitConsistencyScore || 0;
    const authenticityScore = project.projectAuthenticityScore || 0;

    const consistencyLabel = getScoreLabel(consistencyScore);
    const authenticityLabel = getScoreLabel(authenticityScore);
    const avgScore = (consistencyScore + authenticityScore) / 2;
    const overallLabel = getScoreLabel(avgScore);

    return (
        <Card className="project-card" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {refreshing && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div className="loader" style={{ width: '30px', height: '30px' }}></div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--brand-color)' }}>{project.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{
                        padding: '4px 12px',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: getContributionColor(project.contributionPercentage),
                    }}>
                        {project.contributionPercentage}% Contrib
                    </span>
                    {project.isFork && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Forked Repo</span>
                    )}
                </div>
            </div>

            <p style={{ marginBottom: '1.5rem', minHeight: '3em', color: 'var(--text-secondary)' }}>
                {project.description}
            </p>

            {/* Trust Metrics Section */}
            <div style={{
                marginBottom: '1.5rem',
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(var(--brand-rgb, 99,102,241), 0.05) 0%, rgba(34,197,94,0.04) 100%)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: '700' }}>
                        Trust Metrics
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '1rem', color: 'var(--text-tertiary)',
                                padding: '4px', display: 'flex', alignItems: 'center',
                                transition: 'transform 0.3s ease',
                                transform: refreshing ? 'rotate(360deg)' : 'none'
                            }}
                            title="Recalculate Scores"
                        >
                            🔄
                        </button>
                        <span style={{
                            fontSize: '0.7rem', fontWeight: '800', padding: '2px 10px',
                            borderRadius: '50px', background: overallLabel.color + '15', color: overallLabel.color
                        }}>
                            {overallLabel.text}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <ScoreRing
                        score={consistencyScore}
                        label="Consistency"
                        color="#818cf8"
                    />
                    <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
                    <ScoreRing
                        score={authenticityScore}
                        label="Authenticity"
                        color="#22c55e"
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', background: '#818cf815', color: '#818cf8', fontWeight: '700' }}>
                        C: {consistencyLabel.text}
                    </span>
                    <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', background: authenticityLabel.color + '15', color: authenticityLabel.color, fontWeight: '700' }}>
                        A: {authenticityLabel.text}
                    </span>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Verified Tech Stack</h4>
                {hasSkills ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        height: '140px',
                        padding: '10px 0',
                        gap: '8px',
                        background: 'rgba(0,0,0,0.02)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '1rem',
                        paddingTop: '30px'
                    }}>
                        {project.skills.map((skill, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                                height: '100%',
                                justifyContent: 'flex-end',
                                position: 'relative'
                            }}>
                                <div
                                    title={`${skill.name}: ${(skill.confidenceScore * 100).toFixed(0)}%`}
                                    style={{
                                        width: '100%',
                                        maxWidth: '35px',
                                        height: `${skill.confidenceScore * 100}%`,
                                        backgroundColor: 'var(--brand-color)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute',
                                        top: '-22px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        color: 'var(--brand-color)'
                                    }}>
                                        {(skill.confidenceScore * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <span style={{
                                    marginTop: '8px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%'
                                }}>
                                    {skill.name}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>No deep skills detected yet.</p>
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
                        textDecoration: 'none',
                        color: 'var(--brand-color)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    View on GitHub <span>↗</span>
                </a>
            </div>
        </Card>
    );
};

export default ProjectCard;
