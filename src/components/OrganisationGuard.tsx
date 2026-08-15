import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OrganisationGuardProps {
  children: React.ReactNode;
}

const OrganisationGuard: React.FC<OrganisationGuardProps> = ({ children }) => {
  const { isAuthenticated, organisationComplete, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking status
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but organisation setup not complete, redirect to organisation setup
  // Exception: allow access to organisation/add page itself
  if (isAuthenticated && !organisationComplete && location.pathname !== '/organisation/add') {
    return <Navigate to="/organisation/add" replace />;
  }

  // If on organisation/add page but organisation is already complete, redirect to dashboard
  if (isAuthenticated && organisationComplete && location.pathname === '/organisation/add') {
    return <Navigate to="/dashboard" replace />;
  }

  // Render protected component if all checks pass
  return <>{children}</>;
};

export default OrganisationGuard;