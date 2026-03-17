import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageLoader } from './Loader';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard
    const dashboards = {
      buyer: '/buyer/dashboard',
      seller: '/seller/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboards[user?.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
