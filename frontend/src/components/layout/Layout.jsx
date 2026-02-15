import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '2rem 0', backgroundColor: 'var(--bg-primary)' }}>
                <div className="container">
                    {children}
                </div>
            </main>
            <footer style={{
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                padding: '1.5rem 0',
                marginTop: 'auto',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
            }}>
                <div className="container">
                    &copy; Skill Verification Platform
                </div>
            </footer>
        </div>
    );
};

export default Layout;
