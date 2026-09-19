import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OrganisationAddGuardProps {
  children: React.ReactNode;
}

export const OrganisationAddGuard: React.FC<OrganisationAddGuardProps> = ({ children }) => {
  const { user, isAuthenticated, loading, organisationComplete, organisation } = useAuth();
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

  // Check if user has an organisation and it is complete
  const orgData = organisation || user?.organisation;
  
  // The user should be redirected to /organisation/view if the organisation is complete.
  // We check both the derived organisationComplete state and the object properties directly.
  const isComplete = Boolean(orgData?.is_complete || organisationComplete);
  const hasOrganisationData = Boolean(orgData?.id || orgData?.org_name || (user as any)?.organisation_id);

  if (hasOrganisationData && isComplete) {
    return <Navigate to="/organisation/view" replace />;
  }

  // Render protected component if all checks pass
  return <>{children}</>;
};

export default OrganisationAddGuard;
