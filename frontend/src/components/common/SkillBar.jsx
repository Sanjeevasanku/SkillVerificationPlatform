import React from 'react';

const SkillBar = ({ name, repoConfidence, qaScore, finalSkillScore, validationStatus, level, testResult, onTestClick, confidence }) => {
    // Determine bar color based on level
    const getLevelColor = (lvl) => {
        switch (lvl) {
            case 'Advanced': return 'var(--success-color)';
            case 'Intermediate': return 'var(--brand-color)';
            case 'Beginner': return '#f59e0b'; // Amber/Warning
            default: return 'var(--text-tertiary)';
        }
    };

    // Use either the new structure or the fallback backward-compatible structure
    const displayConfidence = finalSkillScore !== undefined ? finalSkillScore : (confidence || 0);
    const hasTest = qaScore !== null && qaScore !== undefined;
    const testPercentage = hasTest ? Math.round(qaScore * 100) : null;

    const getScoreColor = (scorePercent) => {
        if (scorePercent >= 66) return 'var(--success-color)';
        if (scorePercent >= 33) return '#eab308';
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
                    {validationStatus === 'expired' && (
                        <span style={{
                            fontSize: '0.65rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--error-color)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            fontWeight: 'bold'
                        }}>
                            EXPIRED
                        </span>
                    )}
                </div>

                {/* Test button or score badge */}
                {(testResult || onTestClick) && (
                    <div style={{ marginLeft: '0.75rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {testResult && (
                            <span style={{
                                padding: '3px 10px',
                                borderRadius: '50px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#fff',
                                backgroundColor: getScoreColor(testPercentage),
                                whiteSpace: 'nowrap',
                                opacity: validationStatus === 'expired' ? 0.6 : 1
                            }}>
                                ✓ {testResult.score}/{testResult.maxScore}
                            </span>
                        )}

                        {(!testResult || validationStatus === 'expired') && onTestClick && (
                            <button
                                onClick={() => onTestClick(name)}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '50px',
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    color: validationStatus === 'expired' ? 'var(--error-color)' : 'var(--brand-color)',
                                    backgroundColor: validationStatus === 'expired' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(10, 102, 194, 0.08)',
                                    border: `1px solid ${validationStatus === 'expired' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(10, 102, 194, 0.2)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = validationStatus === 'expired' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(10, 102, 194, 0.15)';
                                    e.target.style.borderColor = validationStatus === 'expired' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(10, 102, 194, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = validationStatus === 'expired' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(10, 102, 194, 0.08)';
                                    e.target.style.borderColor = validationStatus === 'expired' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(10, 102, 194, 0.2)';
                                }}
                            >
                                {validationStatus === 'expired' ? 'Retake' : 'Test'}
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
                        width: `${displayConfidence * 100}%`,
                        backgroundColor: getLevelColor(level),
                        borderRadius: '4px',
                        transition: 'width 1s ease-out'
                    }}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {repoConfidence !== undefined && `Repo: ${Math.round(repoConfidence * 100)}%`}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {Math.round(displayConfidence * 100)}% Overall
                </span>
            </div>
        </div>
    );
};

export default SkillBar;
