// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    verifyToken: (token) => api.post('/auth/verify', { token }),
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout')
};

// User APIs
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    getLeaderboard: (timeframe) => api.get(`/users/leaderboard?timeframe=${timeframe}`)
};

// Steps APIs
export const stepsAPI = {
    addSteps: (data) => api.post('/steps', data),
    getTodaySteps: () => api.get('/steps/today'),
    getWeekSteps: () => api.get('/steps/week'),
    getMonthSteps: () => api.get('/steps/month'),
    getStats: () => api.get('/steps/stats')
};

// Challenges APIs
export const challengesAPI = {
    getAll: () => api.get('/challenges'),
    create: (data) => api.post('/challenges', data)
};

// Events APIs
export const eventsAPI = {
    getAll: () => api.get('/events')
};

// Programs APIs
export const programsAPI = {
    getAll: () => api.get('/programs')
};

// Achievements APIs
export const achievementsAPI = {
    getAll: () => api.get('/achievements')
};

// Rewards APIs
export const rewardsAPI = {
    getAll: () => api.get('/rewards')
};

export default api;
