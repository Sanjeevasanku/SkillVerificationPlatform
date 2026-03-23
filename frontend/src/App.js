import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css'; // Keeping for any global styles not in index.css, though we should aim to remove it.

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProjectUpload = lazy(() => import('./pages/ProjectUpload'));
const MyProjects = lazy(() => import('./pages/MyProjects'));
const SkillTest = lazy(() => import('./pages/SkillTest'));
const HRDashboard = lazy(() => import('./pages/HRDashboard'));
const CreateRole = lazy(() => import('./pages/CreateRole'));
const RoleDetails = lazy(() => import('./pages/RoleDetails'));
const StudentProfileView = lazy(() => import('./pages/StudentProfileView'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ReviewQueue = lazy(() => import('./pages/ReviewQueue'));

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
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Login />} />

            {/* Student Private Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-project"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ProjectUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-projects"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skill-test/:skillName"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SkillTest />
                </ProtectedRoute>
              }
            />

            {/* HR Private Routes */}
            <Route
              path="/hr/dashboard"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <HRDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/create-role"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <CreateRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/roles/:roleId"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <RoleDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/students/:studentId"
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <StudentProfileView />
                </ProtectedRoute>
              }
            />

            {/* Admin Private Routes */}
            <Route
              path="/admin/roles/:roleId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RoleDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:studentId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentProfileView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/review-queue"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReviewQueue />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
