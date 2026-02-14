import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
    });

    const { register, error, clearErrors } = useContext(AuthContext);
    const navigate = useNavigate();

    // Clear errors when component unmounts or navigates? 
    // Ideally we use useEffect.
    React.useEffect(() => {
        if (error) clearErrors();
        // eslint-disable-next-line
    }, []);

    const { name, email, password, role } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        await register(formData);
        if (!error) {
            // We can't immediately know success unless we await and check result or use effect on isAuthenticated
            // But for now, if register is successful, it updates state. 
            // Logic in Register.js was: await register; navigate.
            // But if register fails, we shouldn't navigate.
            // We need to check if we are authenticated.
        }
    };

    // Better logic: Use useEffect to redirect if isAuthenticated
    const { isAuthenticated } = useContext(AuthContext);
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className='auth-form-container'>
            <h1>Sign Up</h1>
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={onSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        type='text'
                        name='name'
                        value={name}
                        onChange={onChange}
                        required
                    />
                </div>
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
                <div>
                    <label>Role</label>
                    <select name='role' value={role} onChange={onChange}>
                        <option value='student'>Student</option>
                        <option value='recruiter'>Recruiter</option>
                        <option value='admin'>Admin</option>
                    </select>
                </div>
                <button type='submit'>Register</button>
            </form>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
};

export default Register;
