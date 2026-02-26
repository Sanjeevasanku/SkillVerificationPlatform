import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const ProjectCard = ({ project }) => {
    const getContributionColor = (percent) => {
        if (percent >= 70) return 'var(--success-color)';
        if (percent >= 30) return '#eab308'; // Yellow/Gold
        return 'var(--error-color)';
    };

    return (
        <Card className="project-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

            <p style={{ marginBottom: '1.5rem', flex: 1, color: 'var(--text-secondary)' }}>
                {project.description}
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Verified Tech Stack</h4>
                {project.skills && project.skills.length > 0 ? (
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

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
