import React from 'react';
import Card from '../common/Card';
import SkillBar from '../common/SkillBar';

const SkillProfile = ({ skills, categorySummary, loading, onTestClick }) => {
    if (loading) {
        return (
            <Card title="Skill Profile">
                <div className="flex-center" style={{ padding: '2rem' }}>
                    <div className="loader"></div>
                </div>
            </Card>
        );
    }

    if (!skills || skills.length === 0) {
        return (
            <Card title="Skill Profile">
                <p style={{ fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                    No verified skills detected yet. Upload projects and get them verified to build your profile.
                </p>
            </Card>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            <Card title="Verified Skills">
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {skills.map((skill, index) => (
                        <SkillBar
                            key={index}
                            name={skill.name}
                            confidence={skill.confidence}
                            level={skill.level}
                            testResult={skill.testResult}
                            onTestClick={onTestClick}
                        />
                    ))}
                </div>
            </Card>

            <Card title="Expertise by Category">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {categorySummary.map((cat, index) => (
                        <div key={index} style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '600' }}>{cat.category}</span>
                                <span style={{ color: 'var(--brand-color)', fontWeight: '700' }}>
                                    {Math.round(cat.score * 100)}%
                                </span>
                            </div>
                            <div style={{
                                height: '4px',
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                borderRadius: '2px'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${cat.score * 100}%`,
                                    backgroundColor: 'var(--brand-color)',
                                    borderRadius: '2px'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default SkillProfile;
