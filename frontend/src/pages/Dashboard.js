import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SkillProfile from '../components/specific/SkillProfile';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [skillData, setSkillData] = React.useState({ skills: [], categorySummary: [] });
    const [loadingSkills, setLoadingSkills] = React.useState(true);

    React.useEffect(() => {
        const fetchSkillProfile = async () => {
            try {
                const res = await api.get('/students/skill-profile');
                setSkillData(res.data);
            } catch (err) {
                console.error('Error fetching skill profile:', err);
            } finally {
                setLoadingSkills(false);
            }
        };

        if (user) {
            fetchSkillProfile();
        }
    }, [user]);

    if (!user) {
        return (
            <Layout>
                <div className="flex-center" style={{ height: '50vh' }}>
                    <div className="loader"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>

                <Card
                    title={`Welcome back, ${user.fullName || user.githubUsername || 'Student'}`}
                    style={{ marginBottom: '2rem' }}
                >
                    <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                        Empowering your career with verified expertise.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/upload-project')}
                        >
                            Upload New Project
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/my-projects')}
                        >
                            View My Projects
                        </Button>
                    </div>
                </Card>

                <div style={{ marginBottom: '2rem' }}>
                    <SkillProfile
                        skills={skillData.skills}
                        categorySummary={skillData.categorySummary}
                        loading={loadingSkills}
                    />
                </div>

                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <Card title="Quick Stats">
                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '2rem', color: 'var(--brand-color)', margin: 0 }}>
                                    {skillData.skills.length}
                                </h3>
                                <p>Detected Skills</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '2rem', color: 'var(--success-color)', margin: 0 }}>
                                    {skillData.categorySummary.length}
                                </h3>
                                <p>Categories</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Identity">
                        <p><strong>Email:</strong> {user.email || user.githubEmail}</p>
                        <p><strong>Institution:</strong> {user.college || 'N/A'}</p>
                        <p><strong>Batch:</strong> {user.graduationYear || 'N/A'}</p>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;

