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
                <div className="flex-center min-h-50vh">
                    <div className="loader"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-1000 mx-auto">
                <h1 className="mb-lg">Dashboard</h1>

                <Card
                    title={`Welcome back, ${user.fullName || user.githubUsername || 'Student'}`}
                    className="mb-xl"
                >
                    <p className="mb-lg text-lg">
                        Empowering your career with verified expertise.
                    </p>

                    <div className="flex gap-md flex-wrap">
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

                <div className="mb-xl">
                    <SkillProfile
                        skills={skillData.skills}
                        categorySummary={skillData.categorySummary}
                        loading={loadingSkills}
                        onTestClick={(skillName) => navigate(`/skill-test/${encodeURIComponent(skillName)}`)}
                    />
                </div>

                <div className="dashboard-grid">
                    <Card title="Quick Stats">
                        <div className="stats-grid">
                            <div>
                                <h3 className="text-3xl text-brand m-0">
                                    {skillData.overallStats?.projectCount || 0}
                                </h3>
                                <p>Projects</p>
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

