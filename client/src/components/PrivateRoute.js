import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'artist') return <Navigate to="/artist-dashboard" />;
    if (user.role === 'customer') return <Navigate to="/customer-dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
  }

  return children;
};

export default PrivateRoute;
