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
        password2: '',
        college: '',
        branch: '',
        graduationYear: new Date().getFullYear(),
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
        graduationYear
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
        window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/github`;
    };

    return (
        <AuthLayout title="Create Account">
            {!isGithubSync ? (
                <div className="mb-lg">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleGithubLogin}
                        className="w-full flex items-center justify-center gap-10px"
                    >
                        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" style={{ width: '20px' }} />
                        Verify with GitHub
                    </Button>
                    <div className="text-center my-md text-secondary text-xs">
                        GitHub verification is required for students
                    </div>
                </div>
            ) : (
                <div className="github-verified-box">
                    <span className="github-verified-check">✓</span>
                    <span className="github-verified-text">
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

                {/* Student-specific fields (always shown since registration is student-only) */}
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
                        <div className="grid-2-cols">
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



                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={!isGithubSync}
                >
                    {isGithubSync ? 'Complete Registration' : 'Register'}
                </Button>
            </form>

            <p className="mt-lg text-center text-sm">
                Already on SkillVerify? <Link to="/login" className="font-semibold">Sign in</Link>
            </p>
        </AuthLayout>
    );
};

export default Register;
