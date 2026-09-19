import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OrganisationGuardProps {
  children: React.ReactNode;
}

const OrganisationGuard: React.FC<OrganisationGuardProps> = ({ children }) => {
  const { isAuthenticated, organisationComplete, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking status
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3ED] dark:bg-[#0B0D0A]">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-spin border-2 border-[#0B0D0A]/15 border-t-[#FF5A1F] dark:border-[#F5F3ED]/15 dark:border-t-[#FF5A1F]" />
          <p className="font-mono-ui text-xs tracking-[0.2em] text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
            LOADING…
          </p>
        </div>
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

  // If on organisation/add page but organisation is already complete, redirect to organisation/view
  if (isAuthenticated && organisationComplete && location.pathname === '/organisation/add') {
    return <Navigate to="/organisation/view" replace />;
  }

  // Render protected component if all checks pass
  return <>{children}</>;
};

export default OrganisationGuard;