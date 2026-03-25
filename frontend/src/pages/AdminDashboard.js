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
                    await api.delete(`/admin/roles/${id}`);
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

    const getTabClass = (tab) => {
        return `tab-item ${activeTab === tab ? 'active' : ''}`;
    };



    return (
        <Layout>
            <div className="p-xl">
                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1 className="text-2xl mb-sm">Admin Panel</h1>
                        <p className="text-secondary">
                            Welcome, {user?.fullName}. Manage all users and roles from here.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stat-cards-grid">
                    <Card>
                        <div className="text-center">
                            <h3 className="stat-card-number text-brand">{students.length}</h3>
                            <p className="stat-card-label">Students</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <h3 className="stat-card-number text-success">{hrs.length}</h3>
                            <p className="stat-card-label">HR Users</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <h3 className="stat-card-number text-warning">{roles.length}</h3>
                            <p className="stat-card-label">Roles</p>
                        </div>
                    </Card>
                    <Link to="/admin/review-queue" className="no-underline">
                        <Card className="cursor-pointer transition-shadow">
                            <div className="text-center">
                                <h3 className={`stat-card-number ${pendingReviews > 0 ? 'text-error' : 'text-success'}`}>{pendingReviews}</h3>
                                <p className="stat-card-label">Pending Reviews</p>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    {TABS.map(tab => (
                        <button key={tab} className={getTabClass(tab)} onClick={() => { setActiveTab(tab); setSearchTerm(''); }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="mb-lg">
                    <input
                        type="text"
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
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
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>College</th>
                                            <th>Branch</th>
                                            <th>Year</th>
                                            <th>GitHub</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                            <tr key={student._id}>
                                                <td>
                                                    <strong>{student.fullName}</strong>
                                                </td>
                                                <td>{student.email}</td>
                                                <td>{student.college}</td>
                                                <td>{student.branch}</td>
                                                <td>{student.graduationYear}</td>
                                                <td>
                                                    {student.githubUsername ? (
                                                        <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer"
                                                            className="text-brand">
                                                            {student.githubUsername}
                                                        </a>
                                                    ) : '—'}
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex gap-sm justify-center">
                                                        <Link to={`/admin/students/${student._id}`}>
                                                            <Button variant="secondary" className="btn-sm">View</Button>
                                                        </Link>
                                                        <Button variant="ghost" className="btn-sm text-error"
                                                            onClick={() => handleDeleteStudent(student._id)}>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="text-center text-secondary p-md">
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
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Company</th>
                                            <th>Joined</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHRs.length > 0 ? filteredHRs.map(hr => (
                                            <tr key={hr._id}>
                                                <td>
                                                    <strong>{hr.fullName}</strong>
                                                </td>
                                                <td>{hr.email}</td>
                                                <td>{hr.companyName}</td>
                                                <td>
                                                    {new Date(hr.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="text-center">
                                                    <Button variant="ghost" className="btn-sm text-error"
                                                        onClick={() => handleDeleteHR(hr._id)}>
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-secondary p-md">
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
                            <div className="roles-grid">
                                {filteredRoles.length > 0 ? filteredRoles.map(role => (
                                    <div key={role._id} className="role-card-container">
                                        <button
                                            onClick={() => handleDeleteRole(role._id)}
                                            className="btn-delete-role"
                                            title="Delete Role"
                                        >
                                            Delete
                                        </button>
                                        <div className="mt-10px">
                                            <h3 className="mb-sm pr-45px">{role.title}</h3>
                                            <p className="text-sm text-secondary mb-sm">
                                                {role.description || 'No description'}
                                            </p>
                                            <div className="mb-md">
                                                <p className="text-xs font-bold mb-xs">Required Skills:</p>
                                                <div className="flex flex-wrap gap-xs">
                                                    {role.requiredSkills?.map((s, idx) => (
                                                        <span key={idx} className="skill-tag">
                                                            {s.skillName} (w:{s.weight})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/admin/roles/${role._id}`} className="w-full">
                                            <Button variant="secondary" className="w-full">View Rankings</Button>
                                        </Link>
                                    </div>
                                )) : (
                                    <div className="roles-empty">
                                        <p className="text-secondary">No roles found.</p>
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
