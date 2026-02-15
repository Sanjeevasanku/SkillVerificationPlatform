import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Register = () => {
    const { register, isAuthenticated, error, clearErrors } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student', // default
    });

    const { name, email, password, role } = formData;

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
        register({ name, email, password, role });
    };

    return (
        <AuthLayout title="Create Account">
            <form onSubmit={onSubmit}>
                <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={name}
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

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        I am a...
                    </label>
                    <select
                        name="role"
                        value={role}
                        onChange={onChange}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem',
                            outline: 'none',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="student">Student / Job Seeker</option>
                        <option value="recruiter">Recruiter / Employer</option>
                    </select>
                </div>

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
                    Register
                </Button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                Already on SkillVerify? <Link to="/login" style={{ fontWeight: '600' }}>Sign in</Link>
            </p>
        </AuthLayout>
    );
};

export default Register;
