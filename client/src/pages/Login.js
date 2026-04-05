import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { authService } from '../services/auth';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, error: authError } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    // Show auth error from Redux store
    if (authError) {
      setError(authError);
      setIsSubmitting(false);
    }
  }, [authError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setIsSubmitting(true);

    // Validate form
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    try {
      dispatch(loginStart());
      const response = await authService.login(formData.email, formData.password);
      dispatch(loginSuccess(response));
      // Navigation will be handled by the useEffect above
    } catch (err) {
      const errorMessage = err.message || 'Failed to login. Please check your credentials.';
      dispatch(loginFailure(errorMessage));
      setError(errorMessage);
      // Clear password field on error
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Admin Login</h1>
        </div>

        <div className="login-body">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
              <span className="input-label">Email address</span>
            </div>

            <div className="form-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <span className="input-label">Password</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`login-button ${isSubmitting ? 'loading' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="login-footer">
            Village Portfolio Admin Panel
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 