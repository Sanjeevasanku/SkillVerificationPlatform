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
            // Placeholder for /me endpoint if added later
            // const res = await api.get('/auth/me');
            // dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    // Register User
    const register = async (formData) => {
        try {
            const res = await api.post('/auth/register', formData);

            setAuthToken(res.data.token); // Set token in headers

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

            setAuthToken(res.data.token); // Set token in headers

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
    const logout = () => {
        setAuthToken(null);
        dispatch({ type: 'LOGOUT' });
    };

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
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Updated to match backend
        localStorage.setItem('token', token);
        console.log('--- AUTH TOKEN (Copy this for manual testing) ---');
        console.log(token);
        console.log('---------------------------------------------');
    } else {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
}

export default AuthContext;
