import React, { createContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null, // Add error state
};

const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload,
                error: null, // Clear error
            };
        case 'REGISTER_SUCCESS':
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false,
                error: null, // Clear error
            };
        case 'REGISTER_FAIL':
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: action.payload, // Set error
            };
        case 'CLEAR_ERRORS':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = async () => {
        if (localStorage.token) {
            setAuthToken(localStorage.token);
        }

        try {
            // Create a verify route later or decode token?
            // For now, we assume if token exists, we are somewhat good, 
            // but ideally we call /api/auth/me. 
            // Since we didn't make that yet, we can't fully load.
            // Let's just set loading false if validation fails.
            dispatch({ type: 'AUTH_ERROR' });
            // Note: To fully implement loadUser, we need an endpoint.
            // User didn't ask for /me yet. We'll rely on Login/Register response.
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    // Register User
    const register = async (formData) => {
        try {
            const res = await api.post('/auth/register', formData);

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data,
            });
        } catch (err) {
            dispatch({
                type: 'REGISTER_FAIL',
                payload: err.response.data.msg,
            });
        }
    };

    // Login User
    const login = async (formData) => {
        try {
            const res = await api.post('/auth/login', formData);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data,
            });
        } catch (err) {
            dispatch({
                type: 'LOGIN_FAIL',
                payload: err.response.data.msg,
            });
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    // Clear Errors
    const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                error: state.error,
                register,
                login,
                logout,
                clearErrors,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete api.defaults.headers.common['x-auth-token'];
    }
}

export default AuthContext;
