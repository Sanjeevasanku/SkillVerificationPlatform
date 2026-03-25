import React, { useState, useEffect, useContext } from 'react';
import api from '../lib/api';
import AuthContext from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import { AlertDialog, ConfirmDialog } from '../components/common/Dialog';

const HRDashboard = () => {
    const { user } = useContext(AuthContext);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search state
    const [searchSkill, setSearchSkill] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Dialog state
    const [dialog, setDialog] = useState({
        isOpen: false,
        type: 'alert', // 'alert' or 'confirm'
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'OK',
        variant: 'primary',
        pendingAction: null
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
        const fetchRoles = async () => {
            try {
                const res = await api.get('/hr/roles');
                setRoles(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching roles:', err);
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const handleDelete = (roleId) => {
        showConfirmDialog(
            'Delete Role',
            'Are you sure you want to delete this role? This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/hr/roles/${roleId}`);
                    // Remove the deleted role from the state
                    setRoles(roles.filter(role => role._id !== roleId));
                } catch (err) {
                    console.error('Error deleting role:', err);
                    showAlertDialog('Error', 'Failed to delete role. Please try again.');
                }
            },
            'Delete',
            'danger'
        );
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchSkill.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        try {
            const res = await api.get(`/hr/search/students?skill=${encodeURIComponent(searchSkill)}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error('Error searching students:', err);
            showAlertDialog('Search Error', 'Failed to search students. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchSkill('');
        setSearchResults([]);
        setHasSearched(false);
    };
    return (
        <Layout>
            <div className="p-xl">
                <div className="admin-header">
                    <div>
                        <h1 className="text-2xl mb-sm">HR Dashboard</h1>
                        <p className="text-secondary">Welcome back, {user?.fullName}. Manage your job roles and find top candidates.</p>
                    </div>
                    <Link to="/hr/create-role">
                        <Button variant="primary">Create New Role</Button>
                    </Link>
                </div>

                {/* --- Search Section --- */}
                <div className="search-section">
                    <h2 className="text-lg mb-md">Find Candidates by Skill</h2>
                    <form onSubmit={handleSearch} className={`flex gap-md ${hasSearched ? 'mb-lg' : 'mb-0'}`}>
                        <input
                            type="text"
                            placeholder="e.g. React, Node.js, Python"
                            value={searchSkill}
                            onChange={(e) => setSearchSkill(e.target.value)}
                            className="search-input flex-1"
                        />
                        <Button type="submit" variant="primary" disabled={isSearching || !searchSkill.trim()}>
                            {isSearching ? 'Searching...' : 'Search'}
                        </Button>
                        {hasSearched && (
                            <Button type="button" variant="secondary" onClick={clearSearch}>Clear</Button>
                        )}
                    </form>

                    {hasSearched && (
                        <div>
                            <h3 className="mb-md text-md">
                                Found {searchResults.length} candidate(s) for "{searchSkill}"
                            </h3>

                            {searchResults.length > 0 ? (
                                <div className="candidate-grid">
                                    {searchResults.map(student => (
                                        <div key={student.studentId} className="candidate-card">
                                            <div>
                                                <h4 className="mb-xs">{student.name}</h4>
                                                <div className="flex items-center gap-sm flex-wrap mb-xs">
                                                    <span className={`text-xs font-bold ${
                                                        student.skill.level === 'Advanced' ? 'badge-advanced' :
                                                        student.skill.level === 'Intermediate' ? 'badge-intermediate' : 'badge-beginner'
                                                    }`}>
                                                        {student.skill.level} ({Math.round((student.skill.finalSkillScore || student.skill.confidence) * 100)}%)
                                                    </span>
                                                    {student.skill.validationStatus === 'validated' && (
                                                        <span className="text-xs text-success font-bold">✓ Validated</span>
                                                    )}
                                                    {student.skill.validationStatus === 'expired' && (
                                                        <span className="text-xs text-error font-bold">! Expired</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-secondary">
                                                    {student.college} • Batch of {student.graduationYear}
                                                </p>
                                            </div>
                                            <Link to={`/hr/students/${student.studentId}`}>
                                                <Button variant="secondary" className="btn-sm">Profile</Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-secondary">No candidates found with this specific skill matching the search criteria.</p>
                            )}
                        </div>
                    )}
                </div>
                {/* --- End Search Section --- */}

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

                <h2 className="text-xl mb-md">Your Posted Roles</h2>
                <div className="roles-grid">
                    {loading ? (
                        <p>Loading roles...</p>
                    ) : roles.length > 0 ? (
                        roles.map(role => (
                            <div key={role._id} className="role-card-container">
                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(role._id)}
                                    className="btn-delete-role"
                                    title="Delete Role"
                                >
                                    Delete
                                </button>
                                <div className="mt-10px"> {/* Margin to avoid overlapping with delete button */}
                                    <h3 className="mb-sm pr-45px">{role.title}</h3>
                                    <p className="text-sm text-secondary mb-md line-clamp-3">
                                        {role.description}
                                    </p>
                                    <div className="mb-md">
                                        <p className="text-xs font-bold mb-xs">Required Skills:</p>
                                        <div className="flex flex-wrap gap-xs">
                                            {role.requiredSkills.map((s, idx) => (
                                                <span key={idx} className="skill-tag">
                                                    {s.skillName} (w:{s.weight})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/hr/roles/${role._id}`} className="w-full">
                                    <Button variant="secondary" className="w-full">View Rankings</Button>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="roles-empty">
                            <p className="mb-md">No roles created yet.</p>
                            <Link to="/hr/create-role">
                                <Button variant="primary">Post Your First Job Role</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default HRDashboard;
