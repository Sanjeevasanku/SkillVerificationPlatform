import React from 'react';
import Button from './Button';

/**
 * Base Modal Backdrop component
 */
const ModalBackdrop = ({ children, onClose }) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
        <div
            style={{
                background: 'var(--bg-secondary)',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                maxWidth: '450px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                animation: 'slideUp 0.3s ease-out'
            }}
            onClick={e => e.stopPropagation()}
        >
            {children}
        </div>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
    </div>
);

/**
 * AlertDialog - Replacement for window.alert()
 */
export const AlertDialog = ({ isOpen, title, message, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <ModalBackdrop onClose={onConfirm}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>{message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={onConfirm}>OK</Button>
            </div>
        </ModalBackdrop>
    );
};

/**
 * ConfirmDialog - Replacement for window.confirm()
 */
export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', variant = 'primary' }) => {
    if (!isOpen) return null;
    return (
        <ModalBackdrop onClose={onCancel}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>{message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
            </div>
        </ModalBackdrop>
    );
};
