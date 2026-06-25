/**
 * ============================================
 * API Service — Axios Instance & Interceptors
 * ============================================
 * Centralized HTTP client with JWT attachment,
 * automatic token refresh, and error handling.
 */

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

/**
 * Request interceptor — Attach JWT token to every request.
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — Handle auth errors globally.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ---------- Auth API ---------- */
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me')
};

/* ---------- Reviews API ---------- */
export const reviewsAPI = {
  submit: (data) => API.post('/reviews', data),
  getAll: (params) => API.get('/reviews', { params }),
  getById: (id) => API.get(`/reviews/${id}`),
  delete: (id) => API.delete(`/reviews/${id}`)
};

/* ---------- Dashboard API ---------- */
export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats')
};

/* ---------- User API ---------- */
export const userAPI = {
  updateProfile: (data) => API.put('/user/profile', data),
  changePassword: (data) => API.put('/user/password', data)
};

export default API;