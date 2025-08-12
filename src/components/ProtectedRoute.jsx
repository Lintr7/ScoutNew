import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login with return path if not authenticated
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}