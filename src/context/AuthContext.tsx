import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import * as AuthApi from '../api/AuthApi';
import { getOrganisationDetails } from '../api/OrganisationApi';
import {
  getStoredOrganisation,
  setStoredOrganisation,
  clearStoredOrganisation,
} from '../utils/organisationStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Organisation {
  id: number;
  uuid?: string;
  org_name: string;
  org_company_id?: string;
  org_email?: string;
  org_phone?: string;
  org_address?: string;
  org_city?: string;
  org_state?: string;
  org_postal?: string;
  org_currency?: string;
  org_contact_person?: string;
  org_contact_person_number?: string;
  org_status: boolean;
  is_complete?: boolean;
  country?: {
    id: number;
    countryMasterId: number | null;
    name: string;
    countryCode: string;
    dialCode?: string | null;
    currency?: string | null;
    currencyCode?: string | null;
    currencySymbol?: string | null;
  } | null;
}

interface UserRole {
  id: number;
  name: string;
  permissions: string[];
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
  role?: UserRole | null;
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
  organisation: Organisation | null;
  isAuthenticated: boolean;
  organisationComplete: boolean;
  loading: boolean;
  login: (credentials: LoginCredentialsLocal) => Promise<AuthResult>;
  register: (userData: any) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<AuthResult>;
  checkAuthStatus: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(() => getStoredOrganisation() as Organisation | null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organisationComplete, setOrganisationComplete] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const applyUser = (u: User) => {
    setUser(u);
    setIsAuthenticated(true);
    // is_complete is set server-side only when the user submits the
    // Organisation Details form (OrganisationAdd) — registration always
    // creates the org shell with is_complete = false, even though it
    // already carries org_name/org_company_id/org_phone.
    setOrganisationComplete(Boolean(u.organisation?.is_complete));
    if (u.organisation) {
      setOrganisation(u.organisation);
      setStoredOrganisation(u.organisation as any);
    }
  };

  const clearUser = () => {
    setUser(null);
    setOrganisation(null);
    setIsAuthenticated(false);
    setOrganisationComplete(false);
    clearStoredOrganisation();
  };

  // ── checkAuthStatus ───────────────────────────────────────────────────────
  // On mount, silently probe /auth/user. If the session cookie is valid
  // Laravel returns the user; if not, it returns 401 which we catch quietly.

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      const userData = await AuthApi.getCurrentUser();
      applyUser(userData as unknown as User);

      // Refresh organisation details in localStorage
      try {
        const orgDetails = await getOrganisationDetails();
        if (orgDetails) {
          setOrganisation(orgDetails as any);
          setStoredOrganisation(orgDetails as any);
          setOrganisationComplete(Boolean(orgDetails.is_complete));
        }
      } catch {
        // Fallback gracefully if org details call fails
      }
    } catch {
      clearUser();
    } finally {
      setLoading(false);
    }
  };

  // Guards against StrictMode's dev-mode double-invoke of mount effects,
  // which otherwise fires getCurrentUser()/getOrganisationDetails() twice.
  const didCheckAuth = useRef(false);
  useEffect(() => {
    if (didCheckAuth.current) return;
    didCheckAuth.current = true;
    checkAuthStatus();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  // getCsrfCookie() is called inside AuthApi.login before posting credentials.
  // Laravel Sanctum responds with a Set-Cookie (session + XSRF-TOKEN).

  const login = async (credentials: any): Promise<AuthResult> => {
    try {
      setLoading(true);
      const response = await AuthApi.login(credentials as any);

      // Backend: { success, data: { user, ... } } or just { user }
      const user = (response as any)?.user ?? response;
      applyUser(user as User);

      // Call API after successfully login to fetch and store reusable org details in localStorage
      try {
        const orgDetails = await getOrganisationDetails();
        if (orgDetails) {
          setOrganisation(orgDetails as any);
          setStoredOrganisation(orgDetails as any);
          setOrganisationComplete(Boolean(orgDetails.is_complete));
        }
      } catch (orgErr) {
        console.warn('Could not fetch organisation details after login:', orgErr);
      }

      return { success: true, data: response };
    } catch (error: any) {
      clearUser();
      const message = error.response?.data?.message || error.message || 'Login failed.';
      return { success: false, message, errors: error.response?.data?.errors };
    } finally {
      setLoading(false);
    }
  };

  // ── register ──────────────────────────────────────────────────────────────

  const register = async (userData: any): Promise<AuthResult> => {
    try {
      setLoading(true);
      const response = await AuthApi.register(userData as any);
      const user = (response as any)?.user ?? response;
      if (user) {
        applyUser(user as User);
      }
      return {
        success: true,
        data: response,
        message: 'Registration successful.',
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

  // ── hasPermission ─────────────────────────────────────────────────────────

  const hasPermission = (permission: string): boolean => {
    return user?.role?.permissions.includes(permission) ?? false;
  };

  // ── Context value ─────────────────────────────────────────────────────────

  const value: AuthContextType = {
    user,
    organisation,
    isAuthenticated,
    organisationComplete,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
    hasPermission,
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