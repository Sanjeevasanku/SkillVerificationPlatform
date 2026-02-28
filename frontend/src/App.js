import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css'; // Keeping for any global styles not in index.css, though we should aim to remove it.

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProjectUpload = lazy(() => import('./pages/ProjectUpload'));
const MyProjects = lazy(() => import('./pages/MyProjects'));
const SkillTest = lazy(() => import('./pages/SkillTest'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg-primary)'
  }}>
    <div className="loader"></div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload-project" element={<ProjectUpload />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/skill-test/:repoId" element={<SkillTest />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;

