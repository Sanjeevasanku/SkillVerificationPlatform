import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    className = '',
    disabled = false,
    style: userStyle,
    onMouseEnter: userOnMouseEnter,
    onMouseLeave: userOnMouseLeave,
    ...props
}) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        fontWeight: '600',
        border: '1px solid transparent',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? '0.6' : '1',
    };

    const variants = {
        primary: {
            background: 'var(--brand-color)',
            color: '#fff',
            border: '1px solid var(--brand-color)',
        },
        secondary: {
            background: 'transparent',
            color: 'var(--brand-color)',
            border: '1px solid var(--brand-color)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid transparent',
        },
        danger: {
            background: 'var(--error-color)',
            color: '#fff',
            border: '1px solid var(--error-color)',
        }
    };

    const sizes = {
        small: { padding: '6px 12px', fontSize: '0.85rem' },
        medium: { padding: '10px 20px', fontSize: '0.95rem' },
        large: { padding: '14px 24px', fontSize: '1.1rem' },
    };

    return (
        <button
            className={`btn ${className}`}
            disabled={disabled}
            {...props}
            style={{
                ...baseStyles,
                ...variants[variant],
                ...sizes[size],
                ...userStyle,
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    if (variant === 'primary') e.currentTarget.style.background = 'var(--brand-hover)';
                    if (variant === 'secondary') e.currentTarget.style.background = 'rgba(10, 102, 194, 0.08)';
                    if (variant === 'ghost') {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }
                }
                if (userOnMouseEnter) userOnMouseEnter(e);
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.background = variants[variant].background;
                    e.currentTarget.style.color = variants[variant].color;
                }
                if (userOnMouseLeave) userOnMouseLeave(e);
            }}
        >
            {children}
        </button>
    );
};

export default Button;
