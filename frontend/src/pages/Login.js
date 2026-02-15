import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
    const { login, isAuthenticated, error, clearErrors } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        if (error) {
            const timer = setTimeout(() => {
                clearErrors();
            }, 3000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line
    }, [isAuthenticated, navigate, error]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        login({ email, password });
    };

    return (
        <AuthLayout title="Sign In">
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
