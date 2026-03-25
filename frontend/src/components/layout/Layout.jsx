import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-100vh flex flex-col">
            <Navbar />
            <main className="flex-1 py-xl bg-primary">
                <div className="container">
                    {children}
                </div>
            </main>
            <footer className="app-footer">
                <div className="container">
                    &copy; Skill Verification Platform
                </div>
            </footer>
        </div>
    );
};

export default Layout;
