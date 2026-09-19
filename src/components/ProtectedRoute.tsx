import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected component if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;