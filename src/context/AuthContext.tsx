import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as AuthApi from '../api/AuthApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Organisation {
  id: number;
  org_name: string;
  org_company_id?: string;
  org_email?: string;
  org_phone?: string;
  org_address?: string;
  org_status: boolean;
  is_complete?: boolean;
}

interface User {
  id: number;
  uuid: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile?: string;
  usertype: number;
  status: boolean;
  is_approved_by_admin: boolean;
  organisation?: Organisation;
}

interface LoginCredentialsLocal {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  data?: any;
  errors?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  organisationComplete: boolean;
  loading: boolean;
  login: (credentials: LoginCredentialsLocal) => Promise<AuthResult>;
  register: (userData: any) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<AuthResult>;
  checkAuthStatus: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organisationComplete, setOrganisationComplete] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const applyUser = (u: User) => {
    setUser(u);
    setIsAuthenticated(true);
    // If the organisation has a company ID or phone (which are required for full profile vs skeleton), it's complete
    const isComplete = Boolean(
      u.organisation?.is_complete || 
      u.organisation?.org_company_id || 
      u.organisation?.org_phone
    );
    setOrganisationComplete(isComplete);
  };

  const clearUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    setOrganisationComplete(false);
  };

  // ── checkAuthStatus ───────────────────────────────────────────────────────
  // On mount, silently probe /auth/user. If the session cookie is valid
  // Laravel returns the user; if not, it returns 401 which we catch quietly.

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      const userData = await AuthApi.getCurrentUser();
      applyUser(userData as unknown as User);
    } catch {
      clearUser();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  // getCsrfCookie() is called inside AuthApi.login before posting credentials.
  // Laravel Sanctum responds with a Set-Cookie (session + XSRF-TOKEN).

  const login = async (credentials: LoginCredentialsLocal): Promise<AuthResult> => {
    try {
      setLoading(true);
      const response = await AuthApi.login(credentials as LoginCredentials);

      // Backend: { success, data: { user, ... } } or just { user }
      const userData = (response as any)?.user ?? response;
      applyUser(userData as User);
      return { success: true, data: response };
    } catch (error: any) {
      clearUser();
      const message = error.response?.data?.message || error.message || 'Login failed.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ── register ──────────────────────────────────────────────────────────────

  const register = async (userData: any): Promise<AuthResult> => {
    try {
      setLoading(true);
      const response = await AuthApi.register(userData as RegisterData);
      return {
        success: true,
        data: response,
        message: 'Registration successful. Awaiting admin approval.',
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed.';
      return { success: false, message, errors: error.response?.data?.errors };
    } finally {
      setLoading(false);
    }
  };

  // ── logout ────────────────────────────────────────────────────────────────

  const logout = async (): Promise<void> => {
    try {
      await AuthApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUser();
      window.location.href = '/login';
    }
  };

  // ── updateProfile ─────────────────────────────────────────────────────────

  const updateProfile = async (profileData: any): Promise<AuthResult> => {
    try {
      const updated = await AuthApi.updateProfile(profileData as Partial<AuthUser>);
      applyUser(updated as unknown as User);
      return { success: true, data: updated };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Profile update failed.';
      return { success: false, message, errors: error.response?.data?.errors };
    }
  };

  // ── Context value ─────────────────────────────────────────────────────────

  const value: AuthContextType = {
    user,
    isAuthenticated,
    organisationComplete,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;