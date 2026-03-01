import React from 'react';

const SkillBar = ({ name, confidence, level, testResult, onTestClick }) => {
    // Determine bar color based on level
    const getLevelColor = (lvl) => {
        switch (lvl) {
            case 'Advanced': return 'var(--success-color)';
            case 'Intermediate': return 'var(--brand-color)';
            case 'Beginner': return '#f59e0b'; // Amber/Warning
            default: return 'var(--text-tertiary)';
        }
    };

    const getScoreColor = (score, maxScore) => {
        const pct = (score / maxScore) * 100;
        if (pct >= 66) return 'var(--success-color)';
        if (pct >= 33) return '#eab308';
        return 'var(--error-color)';
    };

    return (
        <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{name}</span>
                    <span
                        style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: `${getLevelColor(level)}20`,
                            color: getLevelColor(level),
                            fontWeight: '600',
                            border: `1px solid ${getLevelColor(level)}40`,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {level}
                    </span>
                </div>

                {/* Test button or score badge */}
                {(testResult || onTestClick) && (
                    <div style={{ marginLeft: '0.75rem', flexShrink: 0 }}>
                        {testResult ? (
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '50px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#fff',
                                backgroundColor: getScoreColor(testResult.score, testResult.maxScore),
                                whiteSpace: 'nowrap'
                            }}>
                                ✓ {testResult.score}/{testResult.maxScore}
                            </span>
                        ) : (
                            <button
                                onClick={() => onTestClick && onTestClick(name)}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '50px',
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    color: 'var(--brand-color)',
                                    backgroundColor: 'rgba(10, 102, 194, 0.08)',
                                    border: '1px solid rgba(10, 102, 194, 0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'rgba(10, 102, 194, 0.15)';
                                    e.target.style.borderColor = 'rgba(10, 102, 194, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'rgba(10, 102, 194, 0.08)';
                                    e.target.style.borderColor = 'rgba(10, 102, 194, 0.2)';
                                }}
                            >
                                Test
                            </button>
                        )}
                    </div>
                )}
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
