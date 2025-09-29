import React from 'react';
import { Navigate } from 'react-router-dom';

interface RouteGuardProps {
  children: React.ReactNode;
  isUnderDevelopment?: boolean;
  condition?: boolean;
  redirectTo?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  isUnderDevelopment = false, 
  condition = true,
  redirectTo = '/under-development' 
}) => {
  // If the route is marked as under development, redirect
  if (isUnderDevelopment) {
    return <Navigate to={redirectTo} replace />;
  }

  // If condition is not met, redirect
  if (!condition) {
    return <Navigate to={redirectTo} replace />;
  }

  // Otherwise, render the children
  return <>{children}</>;
};

export default RouteGuard;