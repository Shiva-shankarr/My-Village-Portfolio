import { createSlice } from '@reduxjs/toolkit';
import config from '../../config/config';

// Get initial state from localStorage
const token = localStorage.getItem(config.auth.tokenKey);
const userStr = localStorage.getItem(config.auth.userKey);
let user = null;
try {
  user = userStr ? JSON.parse(userStr) : null;
} catch (e) {
  console.error('Error parsing user data from localStorage:', e);
  // Clear invalid data
  localStorage.removeItem(config.auth.tokenKey);
  localStorage.removeItem(config.auth.userKey);
}

const initialState = {
  user,
  token,
  isAuthenticated: false, // Start as false until verified
  loading: true, // Start as true to show loading state
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      // Save to localStorage
      localStorage.setItem(config.auth.tokenKey, action.payload.token);
      localStorage.setItem(config.auth.userKey, JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      // Clear localStorage
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
    },
    logout: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
    },
    clearError: (state) => {
      state.error = null;
    },
    verifyTokenStart: (state) => {
      state.loading = true;
    },
    verifyTokenSuccess: (state) => {
      state.loading = false;
      state.isAuthenticated = true;
    },
    verifyTokenFailure: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      // Clear localStorage
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
    }
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  verifyTokenStart,
  verifyTokenSuccess,
  verifyTokenFailure
} = authSlice.actions;

export default authSlice.reducer; 