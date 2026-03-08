import React, { useState, useEffect, useContext } from 'react';
import api from '../lib/api';
import AuthContext from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Link } from 'react-router-dom';
import { AlertDialog, ConfirmDialog } from '../components/common/Dialog';

const TABS = ['Students', 'HR Users', 'Roles'];

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Students');
    const [students, setStudents] = useState([]);
    const [hrs, setHrs] = useState([]);
    const [roles, setRoles] = useState([]);
    const [pendingReviews, setPendingReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog state
    const [dialog, setDialog] = useState({
        isOpen: false,
        type: 'alert',
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'OK',
        variant: 'primary'
    });

    const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

    const showAlertDialog = (title, message) => {
        setDialog({
            isOpen: true,
            type: 'alert',
            title,
            message,
            onConfirm: closeDialog
        });
    };

    const showConfirmDialog = (title, message, onConfirm, confirmText = 'Confirm', variant = 'primary') => {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title,
            message,
            onConfirm: () => {
                onConfirm();
                closeDialog();
            },
            confirmText,
            variant
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [studentsRes, hrsRes, rolesRes, reviewRes] = await Promise.all([
                    api.get('/admin/students'),
                    api.get('/admin/hrs'),
                    api.get('/admin/roles'),
                    api.get('/admin/repositories/review-queue')
                ]);
                setStudents(studentsRes.data);
                setHrs(hrsRes.data);
                setRoles(rolesRes.data);
                setPendingReviews(reviewRes.data.length);
            } catch (err) {
                console.error('Error fetching admin data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDeleteStudent = (id) => {
        showConfirmDialog(
            'Delete Student',
            'Are you sure you want to delete this student? This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/admin/students/${id}`);
                    setStudents(students.filter(s => s._id !== id));
                } catch (err) {
                    console.error('Error deleting student:', err);
                    showAlertDialog('Error', 'Failed to delete student.');
                }
            },
            'Delete',
            'danger'
        );
    };

    const handleDeleteHR = (id) => {
        showConfirmDialog(
            'Delete HR User',
            'Are you sure you want to delete this HR user? This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/admin/hrs/${id}`);
                    setHrs(hrs.filter(h => h._id !== id));
                } catch (err) {
                    console.error('Error deleting HR:', err);
                    showAlertDialog('Error', 'Failed to delete HR user.');
                }
            },
            'Delete',
            'danger'
        );
    };

    const handleDeleteRole = (id) => {
        showConfirmDialog(
            'Delete Role',
            'Are you sure you want to delete this role? This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/hr/roles/${id}`);
                    setRoles(roles.filter(r => r._id !== id));
                } catch (err) {
                    console.error('Error deleting role:', err);
                    showAlertDialog('Error', 'Failed to delete role.');
                }
            },
            'Delete',
            'danger'
        );
    };

    const filteredStudents = students.filter(s =>
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.college?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHRs = hrs.filter(h =>
        h.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRoles = roles.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabStyle = (tab) => ({
        padding: '0.6rem 1.5rem',
        borderRadius: '8px 8px 0 0',
        border: 'none',
        cursor: 'pointer',
        fontWeight: activeTab === tab ? '700' : '500',
        fontSize: '0.95rem',
        background: activeTab === tab ? 'var(--bg-secondary)' : 'transparent',
        color: activeTab === tab ? 'var(--brand-color)' : 'var(--text-secondary)',
        borderBottom: activeTab === tab ? '2px solid var(--brand-color)' : '2px solid transparent',
        transition: 'all 0.2s ease'
    });

    const tableHeaderStyle = {
        textAlign: 'left',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const tableCellStyle = {
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.9rem'
    };

    return (
        <Layout>
            <div style={{ padding: '2rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Panel</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Welcome, {user?.fullName}. Manage all users and roles from here.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '2rem', color: 'var(--brand-color)', margin: 0 }}>{students.length}</h3>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Students</p>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '2rem', color: '#10b981', margin: 0 }}>{hrs.length}</h3>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>HR Users</p>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '2rem', color: '#f59e0b', margin: 0 }}>{roles.length}</h3>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Roles</p>
                        </div>
                    </Card>
                    <Link to="/admin/review-queue" style={{ textDecoration: 'none' }}>
                        <Card style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2rem', color: pendingReviews > 0 ? 'var(--error-color)' : 'var(--success-color)', margin: 0 }}>{pendingReviews}</h3>
                                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Pending Reviews</p>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                    {TABS.map(tab => (
                        <button key={tab} style={tabStyle(tab)} onClick={() => { setActiveTab(tab); setSearchTerm(''); }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        {/* Students Tab */}
                        {activeTab === 'Students' && (
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={tableHeaderStyle}>Name</th>
                                            <th style={tableHeaderStyle}>Email</th>
                                            <th style={tableHeaderStyle}>College</th>
                                            <th style={tableHeaderStyle}>Branch</th>
                                            <th style={tableHeaderStyle}>Year</th>
                                            <th style={tableHeaderStyle}>GitHub</th>
                                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                            <tr key={student._id} style={{ transition: 'background 0.15s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={tableCellStyle}>
                                                    <strong>{student.fullName}</strong>
                                                </td>
                                                <td style={tableCellStyle}>{student.email}</td>
                                                <td style={tableCellStyle}>{student.college}</td>
                                                <td style={tableCellStyle}>{student.branch}</td>
                                                <td style={tableCellStyle}>{student.graduationYear}</td>
                                                <td style={tableCellStyle}>
                                                    {student.githubUsername ? (
                                                        <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer"
                                                            style={{ color: 'var(--brand-color)' }}>
                                                            {student.githubUsername}
                                                        </a>
                                                    ) : '—'}
                                                </td>
                                                <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <Link to={`/admin/students/${student._id}`}>
                                                            <Button variant="secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>View</Button>
                                                        </Link>
                                                        <Button variant="ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: 'var(--error-color)' }}
                                                            onClick={() => handleDeleteStudent(student._id)}>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" style={{ ...tableCellStyle, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                    No students found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* HR Users Tab */}
                        {activeTab === 'HR Users' && (
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={tableHeaderStyle}>Name</th>
                                            <th style={tableHeaderStyle}>Email</th>
                                            <th style={tableHeaderStyle}>Company</th>
                                            <th style={tableHeaderStyle}>Joined</th>
                                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHRs.length > 0 ? filteredHRs.map(hr => (
                                            <tr key={hr._id} style={{ transition: 'background 0.15s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={tableCellStyle}>
                                                    <strong>{hr.fullName}</strong>
                                                </td>
                                                <td style={tableCellStyle}>{hr.email}</td>
                                                <td style={tableCellStyle}>{hr.companyName}</td>
                                                <td style={tableCellStyle}>
                                                    {new Date(hr.createdAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                                                    <Button variant="ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: 'var(--error-color)' }}
                                                        onClick={() => handleDeleteHR(hr._id)}>
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" style={{ ...tableCellStyle, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                    No HR users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Roles Tab */}
                        {activeTab === 'Roles' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {filteredRoles.length > 0 ? filteredRoles.map(role => (
                                    <div key={role._id} style={{
                                        background: 'var(--bg-secondary)',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        position: 'relative'
                                    }}>
                                        <button
                                            onClick={() => handleDeleteRole(role._id)}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--error-color)',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                padding: '5px',
                                                opacity: 0.7,
                                                transition: 'opacity 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = 1}
                                            onMouseLeave={(e) => e.target.style.opacity = 0.7}
                                            title="Delete Role"
                                        >
                                            Delete
                                        </button>
                                        <div style={{ marginTop: '10px' }}>
                                            <h3 style={{ marginBottom: '0.5rem', paddingRight: '45px' }}>{role.title}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                {role.description || 'No description'}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                                Created by: {role.createdBy?.fullName || 'Unknown'}
                                            </p>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Required Skills:</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                    {role.requiredSkills?.map((s, idx) => (
                                                        <span key={idx} style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                            {s.skillName} (w:{s.weight})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/hr/roles/${role._id}`} style={{ width: '100%' }}>
                                            <Button variant="secondary" style={{ width: '100%' }}>View Rankings</Button>
                                        </Link>
                                    </div>
                                )) : (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                        <p style={{ color: 'var(--text-secondary)' }}>No roles found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Dialog */}
                {dialog.type === 'alert' ? (
                    <AlertDialog
                        isOpen={dialog.isOpen}
                        title={dialog.title}
                        message={dialog.message}
                        onConfirm={dialog.onConfirm}
                    />
                ) : (
                    <ConfirmDialog
                        isOpen={dialog.isOpen}
                        title={dialog.title}
                        message={dialog.message}
                        onConfirm={dialog.onConfirm}
                        onCancel={closeDialog}
                        confirmText={dialog.confirmText}
                        variant={dialog.variant}
                    />
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboard;
