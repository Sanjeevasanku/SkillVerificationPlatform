import React from 'react';

const SkillBar = ({ name, confidence, level }) => {
    // Determine bar color based on level
    const getLevelColor = (lvl) => {
        switch (lvl) {
            case 'Advanced': return 'var(--success-color)';
            case 'Intermediate': return 'var(--brand-color)';
            case 'Beginner': return '#f59e0b'; // Amber/Warning
            default: return 'var(--text-tertiary)';
        }
    };

    return (
        <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{name}</span>
                <span
                    style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: `${getLevelColor(level)}20`,
                        color: getLevelColor(level),
                        fontWeight: '600',
                        border: `1px solid ${getLevelColor(level)}40`
                    }}
                >
                    {level}
                </span>
            </div>
            <div style={{
                height: '8px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div
                    style={{
                        height: '100%',
                        width: `${confidence * 100}%`,
                        backgroundColor: getLevelColor(level),
                        borderRadius: '4px',
                        transition: 'width 1s ease-out'
                    }}
                />
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {Math.round(confidence * 100)}% Confidence
                </span>
            </div>
        </div>
    );
};

export default SkillBar;
