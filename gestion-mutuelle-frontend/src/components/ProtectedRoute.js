import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
    
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
