import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { verifyTokenStart, verifyTokenSuccess, verifyTokenFailure } from '../store/slices/authSlice';
import { authAPI } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        dispatch(verifyTokenStart());
        await authAPI.verifyToken();
        dispatch(verifyTokenSuccess());
      } catch (error) {
        dispatch(verifyTokenFailure());
      }
    };

    if (!isAuthenticated && !loading) {
      verifyToken();
    }
  }, [dispatch, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status" aria-label="Loading"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 