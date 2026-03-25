import React from 'react';
import Card from '../common/Card';
import SkillBar from '../common/SkillBar';

const SkillProfile = ({ skills, categorySummary, loading, onTestClick }) => {
    if (loading) {
        return (
            <Card title="Skill Profile">
                <div className="flex-center p-xl">
                    <div className="loader"></div>
                </div>
            </Card>
        );
    }

    if (!skills || skills.length === 0) {
        return (
            <Card title="Skill Profile">
                <p className="italic text-center p-md">
                    No verified skills detected yet. Upload projects and get them verified to build your profile.
                </p>
            </Card>
        );
    }

    return (
        <div className="dashboard-grid">
            <Card title="Verified Skills" className="flex flex-col h-auto max-h-420 overflow-hidden">
                <div className="custom-scrollbar flex-1 overflow-y-auto pr-md">
                    {skills.map((skill, index) => (
                        <SkillBar
                            key={index}
                            {...skill}
                            onTestClick={onTestClick}
                        />
                    ))}
                </div>
            </Card>

            <Card title="Expertise by Category" className="flex flex-col h-auto max-h-420 overflow-hidden">
                <div className="custom-scrollbar flex-1 overflow-y-auto pr-md flex flex-col gap-md">
                    {categorySummary.map((cat, index) => (
                        <div key={index} className="skill-category-card">
                            <div className="flex justify-between mb-xs">
                                <span className="font-semibold text-sm">{cat.category}</span>
                                <span className="text-brand font-bold">
                                    {Math.round(cat.score * 100)}%
                                </span>
                            </div>
                            <div className="skill-category-progress">
                                <div className="skill-category-progress-bar" style={{ width: `${cat.score * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default SkillProfile;
