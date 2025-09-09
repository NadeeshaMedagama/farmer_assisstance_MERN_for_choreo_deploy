import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  fallbackPath = '/dashboard' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
