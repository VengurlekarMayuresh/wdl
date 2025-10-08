import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

// Usage: <ProtectedRoute allow={['doctor']}><DoctorPage/></ProtectedRoute>
export const ProtectedRoute = ({ allow = [], children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return children; // let pages handle their own spinners

  // Not logged in at all
  if (!isAuthenticated || !user) {
    toast.error('Access denied. Please login first.');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role-based gate
  if (allow.length > 0 && !allow.includes(user.userType)) {
    toast.error('Access denied. You do not have permission to view this page.');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
