import React, { createContext, useReducer, useEffect } from 'react';
import api from '../lib/api';

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
        if (!localStorage.getItem('token')) {
            dispatch({ type: 'AUTH_ERROR' });
            return;
        }

        try {
            const res = await api.get('/auth/me');
            dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    useEffect(() => {
        loadUser();
        // eslint-disable-next-line
    }, []);

    // Register Student
    const register = async (studentData) => {
        try {
            const res = await api.post('/auth/register', studentData);

            setAuthToken(res.data.token);

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data,
            });
            return { success: true };
        } catch (err) {
            dispatch({
                type: 'REGISTER_FAIL',
                payload: err.response?.data?.message || 'Registration failed',
            });
            return { success: false, error: err.response?.data?.message || 'Registration failed' };
        }
    };

    // Login User
    const login = async (formData) => {
        const { role, ...loginData } = formData;
        let endpoint = '/auth/login';
        if (role === 'hr') endpoint = '/auth/hr/login';
        else if (role === 'admin') endpoint = '/auth/admin/login';

        try {
            const res = await api.post(endpoint, loginData);

            setAuthToken(res.data.token); // Set token in headers

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data,
            });
        } catch (err) {
            dispatch({
                type: 'LOGIN_FAIL',
                payload: err.response?.data?.message || 'Invalid Credentials',
            });
        }
    };

    // Login User with Token (from OAuth)
    const loginWithToken = (token) => {
        setAuthToken(token);
        dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token }
        });
        loadUser();
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
                loginWithToken,
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
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
}

export default AuthContext;
