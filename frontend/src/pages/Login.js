import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { login, error, clearErrors, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        // eslint-disable-next-line
    }, [isAuthenticated, navigate]);

    // Clear errors on mount
    React.useEffect(() => {
        if (error) clearErrors();
        // eslint-disable-next-line
    }, []);

    const { email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        await login(formData);
    };

    return (
        <div className='auth-form-container'>
            <h1>Login</h1>
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={onSubmit}>
                <div>
                    <label>Email Address</label>
                    <input
                        type='email'
                        name='email'
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type='password'
                        name='password'
                        value={password}
                        onChange={onChange}
                        required
                        minLength='6'
                    />
                </div>
                <button type='submit'>Login</button>
            </form>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
                Don't have an account? <a href="/register">Sign Up</a>
            </p>
        </div>
    );
};

export default Login;
