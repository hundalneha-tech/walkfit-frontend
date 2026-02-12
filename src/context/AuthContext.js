// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Helper function to decode JWT payload
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        // Check if user is logged in on mount
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedProfilePicture = localStorage.getItem('userProfilePicture');
            
            if (storedToken) {
                try {
                    // Try to get user from backend first
                    try {
                        const response = await authAPI.getCurrentUser();
                        const userData = response.data.user;
                        // Use stored profile picture if available
                        if (storedProfilePicture) {
                            userData.picture = storedProfilePicture;
                        }
                        setUser(userData);
                        setToken(storedToken);
                    } catch (error) {
                        // If backend fails, try to decode the token (for Google JWT)
                        const decoded = decodeJWT(storedToken);
                        if (decoded) {
                            const userData = {
                                name: decoded.name,
                                email: decoded.email,
                                picture: storedProfilePicture || decoded.picture
                            };
                            setUser(userData);
                            setToken(storedToken);
                        } else {
                            throw error;
                        }
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (newToken) => {
        if (!newToken) {
            console.error('No token provided to login');
            return;
        }
        localStorage.setItem('token', newToken);
        setToken(newToken);
        
        // Try to fetch user data from backend
        authAPI.getCurrentUser()
            .then(response => {
                setUser(response.data.user);
            })
            .catch(error => {
                console.warn('Backend getCurrentUser failed, decoding JWT:', error.message);
                // If backend fails, decode the Google JWT token
                const decoded = decodeJWT(newToken);
                if (decoded) {
                    const userData = {
                        name: decoded.name,
                        email: decoded.email,
                        picture: decoded.picture
                    };
                    setUser(userData);
                } else {
                    console.error('Failed to decode JWT token');
                }
            });
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            window.location.href = '/';
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const handleAuthCallback = async () => {
        // This method handles the OAuth callback
        // Implementation depends on your OAuth provider
        return Promise.resolve();
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        handleAuthCallback,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
