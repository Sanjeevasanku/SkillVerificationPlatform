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
            <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>HR Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.fullName}. Manage your job roles and find top candidates.</p>
                    </div>
                    <Link to="/hr/create-role">
                        <Button variant="primary">Create New Role</Button>
                    </Link>
                </div>

                {/* --- Search Section --- */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Find Candidates by Skill</h2>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: hasSearched ? '1.5rem' : '0' }}>
                        <input
                            type="text"
                            placeholder="e.g. React, Node.js, Python"
                            value={searchSkill}
                            onChange={(e) => setSearchSkill(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)'
                            }}
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
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                                Found {searchResults.length} candidate(s) for "{searchSkill}"
                            </h3>

                            {searchResults.length > 0 ? (
                                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                    {searchResults.map(student => (
                                        <div key={student.studentId} style={{
                                            background: 'var(--bg-primary)',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <h4 style={{ marginBottom: '0.25rem' }}>{student.name}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        color: student.skill.level === 'Advanced' ? 'var(--success-color)' :
                                                            student.skill.level === 'Intermediate' ? 'var(--brand-color)' : '#f59e0b',
                                                        backgroundColor: student.skill.level === 'Advanced' ? 'rgba(16, 185, 129, 0.1)' :
                                                            student.skill.level === 'Intermediate' ? 'rgba(10, 102, 194, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px'
                                                    }}>
                                                        {student.skill.level} ({Math.round(student.skill.confidence * 100)}%)
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {student.college} • Batch of {student.graduationYear}
                                                </p>
                                            </div>
                                            <Link to={`/hr/students/${student.studentId}`}>
                                                <Button variant="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Profile</Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>No candidates found with this specific skill matching the search criteria.</p>
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

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Posted Roles</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {loading ? (
                        <p>Loading roles...</p>
                    ) : roles.length > 0 ? (
                        roles.map(role => (
                            <div key={role._id} style={{
                                background: 'var(--bg-secondary)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative' // For absolute positioning of the delete button
                            }}>
                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(role._id)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--error-color)',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        padding: '5px',
                                        opacity: 0.7,
                                        transition: 'opacity 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = 1}
                                    onMouseLeave={(e) => e.target.style.opacity = 0.7}
                                    title="Delete Role"
                                >
                                    🗑️
                                </button>
                                <div style={{ marginTop: '10px' }}> {/* Margin to avoid overlapping with delete button */}
                                    <h3 style={{ marginBottom: '0.5rem', paddingRight: '25px' }}>{role.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {role.description}
                                    </p>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Required Skills:</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            {role.requiredSkills.map((s, idx) => (
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
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                            <p style={{ marginBottom: '1rem' }}>No roles created yet.</p>
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
