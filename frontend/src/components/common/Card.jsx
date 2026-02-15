import React from 'react';

const Card = ({ children, className = '', style = {}, title, actions }) => {
    return (
        <div
            className={`card ${className}`}
            style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                padding: '1.5rem',
                ...style
            }}
        >
            {(title || actions) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    {title && <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>}
                    {actions && <div>{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
