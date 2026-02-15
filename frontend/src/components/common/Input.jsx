import React from 'react';

const Input = ({ label, id, error, className = '', ...props }) => {
    return (
        <div className={`input-group ${className}`} style={{ marginBottom: '1rem' }}>
            {label && (
                <label
                    htmlFor={id}
                    style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)'
                    }}
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                {...props}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: error ? '1px solid var(--error-color)' : '1px solid var(--border-color)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                    if (!error) e.target.style.borderColor = 'var(--brand-color)';
                    e.target.style.boxShadow = error ? 'none' : '0 0 0 1px var(--brand-color)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = error ? 'var(--error-color)' : 'var(--border-color)';
                    e.target.style.boxShadow = 'none';
                }}
            />
            {error && <span style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
        </div>
    );
};

export default Input;
