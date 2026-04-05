import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config/config';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a flag to track if we're already redirecting
let isRedirecting = false;

// Request interceptor
api.interceptors.request.use(
  (axiosConfig) => {
    const token = localStorage.getItem(config.auth.tokenKey);
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only show error toast for non-auth errors
    if (!error.response || error.response.status !== 401) {
      const message = error.response?.data?.message || 'An error occurred';
      toast.error(message);
    }

    // Handle auth errors
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verifyToken: () => api.get('/auth/verify'),
};

// Gallery endpoints
export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
  getStats: () => api.get('/gallery/stats'),
};

// Videos endpoints
export const videosAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`),
  create: (data) => api.post('/videos', data),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
  getStats: () => api.get('/videos/stats'),
};

// Updates endpoints
export const updatesAPI = {
  getAll: (params) => api.get('/updates', { params }),
  getById: (id) => api.get(`/updates/${id}`),
  create: (data) => api.post('/updates', data),
  update: (id, data) => api.put(`/updates/${id}`, data),
  delete: (id) => api.delete(`/updates/${id}`),
  getStats: () => api.get('/updates/stats'),
};

// Dashboard endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
  getAnalytics: (period) => api.get('/dashboard/analytics', { params: { period } }),
};

// Settings endpoints
export const settingsAPI = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data) => api.put('/settings/profile', data),
  updatePassword: (data) => api.put('/settings/password', data),
  getSiteSettings: () => api.get('/settings/site'),
  updateSiteSettings: (data) => api.put('/settings/site', data),
};

export default api; 