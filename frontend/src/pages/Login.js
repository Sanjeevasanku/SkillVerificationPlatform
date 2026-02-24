import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
    const { login, loginWithToken, isAuthenticated, error, clearErrors } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            loginWithToken(token);
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
    }, [isAuthenticated, navigate, error, searchParams, loginWithToken, clearErrors]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        login({ email, password });
    };

    const handleGithubLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/github';
    };

    return (
        <AuthLayout title="Sign In">
            <div style={{ marginBottom: '1.5rem' }}>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGithubLogin}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" style={{ width: '20px' }} />
                    Continue with GitHub
                </Button>
            </div>

            <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', position: 'relative' }}>
                <span style={{ background: 'var(--bg-primary)', padding: '0 10px', position: 'relative', zIndex: 1 }}>or sign in with email</span>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px solid var(--border-color)', zIndex: 0 }}></div>
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

                <Button type="submit" variant="primary" style={{ width: '100%' }}>
                    Sign In
                </Button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                New to SkillVerify? <Link to="/register" style={{ fontWeight: '600' }}>Join now</Link>
            </p>
        </AuthLayout>
    );
};

export default Login;
