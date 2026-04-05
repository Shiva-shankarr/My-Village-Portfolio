import api from './api';
import config from '../config/config';

const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });

    if (response.data?.token) {
      localStorage.setItem(config.auth.tokenKey, response.data.token);
      if (response.data.user) {
        localStorage.setItem(config.auth.userKey, JSON.stringify(response.data.user));
      }
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Network error
    if (!error.response) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    // Server error responses
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 404) {
      throw new Error('Login service not available. Please try again later.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

const logout = () => {
  localStorage.removeItem(config.auth.tokenKey);
  localStorage.removeItem(config.auth.userKey);
};

const getCurrentUser = () => {
  const token = localStorage.getItem(config.auth.tokenKey);
  const user = localStorage.getItem(config.auth.userKey);
  return {
    token,
    user: user ? JSON.parse(user) : null
  };
};

const isAuthenticated = () => {
  const { token } = getCurrentUser();
  return !!token;
};

const getAuthHeader = () => {
  const { token } = getCurrentUser();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const authService = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getAuthHeader
}; 