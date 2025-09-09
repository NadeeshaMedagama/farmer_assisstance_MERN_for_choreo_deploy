import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'expert' | 'farmer')[];
  fallbackPath?: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  children, 
  allowedRoles,
  fallbackPath = '/dashboard' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
