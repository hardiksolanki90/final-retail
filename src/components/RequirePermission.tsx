import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, children }) => {
  const { hasPermission, loading } = useAuth();

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

  if (!hasPermission(permission)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Not authorized</h1>
        <p className="text-gray-500 dark:text-gray-400">
          You don't have permission (<code>{permission}</code>) to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequirePermission;
