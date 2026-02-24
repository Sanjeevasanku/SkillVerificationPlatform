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
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Verified Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {project.skills && project.skills.length > 0 ? (
                        project.skills.map((skill, i) => (
                            <div key={i} style={{
                                background: 'rgba(5, 118, 66, 0.05)',
                                border: '1px solid rgba(5, 118, 66, 0.15)',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{skill.name}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{(skill.confidenceScore * 100).toFixed(0)}%</span>
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                    {skill.evidence.join(', ')}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No deep skills detected yet.</p>
                    )}
                </div>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--success-color)', fontSize: '0.9rem' }}>●</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Verified</span>
                </div>
                <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        textDecoration: 'none',
                        color: 'var(--brand-color)',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}
                >
                    View on GitHub ↗
                </a>
            </div>
        </Card>
    );
};

export default ProjectCard;
