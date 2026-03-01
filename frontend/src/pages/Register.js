import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Register = () => {
    const { register, isAuthenticated, error, clearErrors } = useContext(AuthContext);
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        college: '',
        branch: '',
        graduationYear: new Date().getFullYear(),
        role: 'student',
        githubId: '',
        githubUsername: '',
        githubEmail: '',
        githubAvatar: '',
        encryptedAccessToken: ''
    });

    const [isGithubSync, setIsGithubSync] = useState(false);

    const {
        fullName,
        email,
        password,
        college,
        branch,
        graduationYear,
        role
    } = formData;

    useEffect(() => {
        const ghId = searchParams.get('githubId');
        if (ghId && !isGithubSync) {
            setFormData(prev => ({
                ...prev,
                githubId: ghId,
                githubUsername: searchParams.get('githubUsername'),
                githubEmail: searchParams.get('githubEmail'),
                githubAvatar: decodeURIComponent(searchParams.get('githubAvatar')),
                encryptedAccessToken: decodeURIComponent(searchParams.get('encryptedAccessToken')),
                fullName: searchParams.get('githubUsername'), // Default to username
                email: searchParams.get('githubEmail'),
            }));
            setIsGithubSync(true);
        }

        if (isAuthenticated) {
            navigate('/dashboard');
        }
        if (error) {
            const timer = setTimeout(() => {
                clearErrors();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, navigate, error, searchParams, isGithubSync, clearErrors]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        register(formData);
    };

    const handleGithubLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/github';
    };

    return (
        <AuthLayout title="Create Account">
            {!isGithubSync ? (
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleGithubLogin}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" style={{ width: '20px' }} />
                        Verify with GitHub
                    </Button>
                    <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        GitHub verification is required for students
                    </div>
                </div>
            ) : (
                <div style={{
                    background: 'rgba(40, 167, 69, 0.1)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(40, 167, 69, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ color: '#28a745' }}>✓</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        GitHub Verified: <strong>{formData.githubUsername}</strong>
                    </span>
                </div>
            )}

            <form onSubmit={onSubmit}>
                <Input
                    label="Full Name"
                    type="text"
                    name="fullName"
                    value={fullName}
                    onChange={onChange}
                    required
                    placeholder="e.g. John Doe"
                />
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="Enter your email"
                />

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="Create a password"
                    minLength="6"
                />

                {(isGithubSync || role === 'student') && (
                    <>
                        <Input
                            label="College / University"
                            type="text"
                            name="college"
                            value={college}
                            onChange={onChange}
                            required
                            placeholder="Enter your college name"
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input
                                label="Branch"
                                type="text"
                                name="branch"
                                value={branch}
                                onChange={onChange}
                                required
                                placeholder="e.g. CSE"
                            />
                            <Input
                                label="Graduation Year"
                                type="number"
                                name="graduationYear"
                                value={graduationYear}
                                onChange={onChange}
                                required
                                placeholder="e.g. 2026"
                            />
                        </div>
                    </>
                )}


                {error && (
                    <div style={{
                        color: 'var(--error-color)',
                        fontSize: '0.9rem',
                        marginBottom: '1rem',
                        background: 'rgba(204, 16, 22, 0.1)',
                        padding: '0.5rem',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    style={{ width: '100%' }}
                    disabled={!isGithubSync && role === 'student'}
                >
                    {isGithubSync ? 'Complete Registration' : 'Register'}
                </Button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                Already on SkillVerify? <Link to="/login" style={{ fontWeight: '600' }}>Sign in</Link>
            </p>
        </AuthLayout>
    );
};

export default Register;
