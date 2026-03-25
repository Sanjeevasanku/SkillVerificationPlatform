import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
    const { login, loginWithToken, isAuthenticated, user, error, clearErrors } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        selectedRole: 'student' // Default to student
    });

    const { email, password, selectedRole } = formData;

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            loginWithToken(token);
        }

        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'hr') {
                navigate('/hr/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
        if (error) {
            const timer = setTimeout(() => {
                clearErrors();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, user, navigate, error, searchParams, loginWithToken, clearErrors]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        login({ email, password, role: selectedRole });
    };

    const handleGithubLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/github`;
    };

    return (
        <AuthLayout title="Sign In">
            <div className="mb-lg">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGithubLogin}
                    className="w-full flex items-center justify-center gap-10px"
                >
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" style={{ width: '20px' }} />
                    Continue with GitHub
                </Button>
            </div>

            <div className="flex gap-10px mb-lg">
                <Button
                    type="button"
                    variant={selectedRole === 'student' ? 'primary' : 'secondary'}
                    onClick={() => setFormData(prev => ({ ...prev, selectedRole: 'student' }))}
                    className="flex-1"
                >
                    Student
                </Button>
                <Button
                    type="button"
                    variant={selectedRole === 'hr' ? 'primary' : 'secondary'}
                    onClick={() => setFormData(prev => ({ ...prev, selectedRole: 'hr' }))}
                    className="flex-1"
                >
                    HR
                </Button>
                <Button
                    type="button"
                    variant={selectedRole === 'admin' ? 'primary' : 'secondary'}
                    onClick={() => setFormData(prev => ({ ...prev, selectedRole: 'admin' }))}
                    className="flex-1"
                >
                    Admin
                </Button>
            </div>

            <div className="divider-container">
                <span className="divider-text">or sign in with credentials</span>
                <div className="divider-line"></div>
            </div>

            <form onSubmit={onSubmit}>
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
                    placeholder="Enter your password"
                />

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <Button type="submit" variant="primary" className="w-full">
                    Sign In
                </Button>
            </form>

            <p className="mt-lg text-center text-sm">
                New to SkillVerify? <Link to="/register" className="font-semibold">Join now</Link>
            </p>
        </AuthLayout>
    );
};

export default Login;
