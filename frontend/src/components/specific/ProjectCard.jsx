import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const ProjectCard = ({ project }) => {
    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--success-color)';
        if (score >= 50) return '#eab308'; // Yellow/Gold
        return 'var(--error-color)';
    };

    return (
        <Card className="project-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--brand-color)' }}>{project.title}</h3>
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: getScoreColor(project.readinessScore),
                }}>
                    {project.readinessScore}/100
                </span>
            </div>

            <p style={{ marginBottom: '1.5rem', flex: 1, color: 'var(--text-secondary)' }}>
                {project.description}
            </p>

            <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Stack</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {project.techStack.map((tech, i) => (
                        <span key={i} style={{
                            background: '#eef3f8',
                            color: 'var(--text-secondary)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                        }}>
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {project.extractedSkills && project.extractedSkills.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Verified Skills</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {project.extractedSkills.map((skill, i) => (
                            <span key={i} style={{
                                background: 'rgba(5, 118, 66, 0.1)',
                                color: 'var(--success-color)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                border: '1px solid rgba(5, 118, 66, 0.2)'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub ↗
                </a>
                {project.liveLink && (
                    <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Live Demo ↗
                    </a>
                )}
            </div>
        </Card>
    );
};

export default ProjectCard;
