import React from 'react';
import Card from '../common/Card';

const AuthLayout = ({ children, title }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f3f2ef 100%)' // Subtle gradient
        }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--brand-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>SkillVerify</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back</p>
                </div>
                <Card title={title}>
                    {children}
                </Card>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    &copy; Skill Verification Platform
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
