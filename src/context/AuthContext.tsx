import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { isAxiosError } from 'axios';
import * as AuthApi from '../api/AuthApi';
import type { AppConfig, ConfigCurrency, ConfigOrganisation, ConfigRole, ConfigTax, ConfigUser } from '../types/AppConfig';
import type { MenuSection, SettingsMenuItem } from '../data/menuData';
import {
  clearConfig,
  configFromLoginUser,
  fetchAppConfig,
  getEffectiveCurrency,
  getSettingsMenu,
  getSidebarMenu,
  hasPermission as configHasPermission,
  loadStoredConfig,
  removeLegacyKeys,
  saveConfig,
} from '../services/appConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Logged-in user as screens read it — role and organisation nested for convenience. */
export interface AuthUserView extends ConfigUser {
  role: ConfigRole | null;
  organisation: ConfigOrganisation | null;
}

interface LoginCredentialsLocal {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
}

interface AuthContextType {
  /** Full global config (user, role, organisation, currency). Null when logged out. */
  config: AppConfig | null;
  user: AuthUserView | null;
  organisation: ConfigOrganisation | null;
  currency: ConfigCurrency | null;
  tax: ConfigTax | null;
  sidebarMenu: MenuSection[];
  settingsMenu: SettingsMenuItem[];
  isAuthenticated: boolean;
  organisationComplete: boolean;
  loading: boolean;
  login: (credentials: LoginCredentialsLocal) => Promise<AuthResult>;
  register: (userData: Record<string, unknown>) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Record<string, unknown>) => Promise<AuthResult>;
  /** Re-fetch /app/config — call after anything that changes org, currency or roles. */
  refreshConfig: () => Promise<AppConfig | null>;
  /** Kept for existing callers; same as refreshConfig. */
  checkAuthStatus: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

type LoginPayload = Parameters<typeof configFromLoginUser>[0];

function errorResult(error: unknown, fallback: string): AuthResult {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    return { success: false, message: data?.message || error.message || fallback, errors: data?.errors };
  }
  return { success: false, message: error instanceof Error ? error.message : fallback };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const applyConfig = useCallback(async (next: AppConfig, options?: { newSession?: boolean }) => {
    setConfig(next);
    await saveConfig(next, options);
  }, []);

  const resetSession = useCallback(async () => {
    setConfig(null);
    await clearConfig();
  }, []);

  const refreshConfig = useCallback(async (): Promise<AppConfig | null> => {
    try {
      const fresh = await fetchAppConfig();
      await applyConfig(fresh);
      return fresh;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        await resetSession();
        return null;
      }
      // Network/server hiccup — keep whatever config is already loaded.
      console.warn('Could not refresh app config', error);
      return null;
    }
  }, [applyConfig, resetSession]);

  // ── App load: show cached config instantly, then refresh from the server ──
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      removeLegacyKeys();
      const stored = await loadStoredConfig();
      if (stored) {
        setConfig(stored);
        setLoading(false);
      }
      try {
        await applyConfig(await fetchAppConfig());
      } catch (error) {
        // 401 = no session. Any other failure with nothing cached also means
        // we can't confirm a session, so treat as logged out.
        if (!stored || (isAxiosError(error) && error.response?.status === 401)) {
          await resetSession();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [applyConfig, resetSession]);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = async (credentials: LoginCredentialsLocal): Promise<AuthResult> => {
    try {
      setLoading(true);
      const response = await AuthApi.login(credentials as Parameters<typeof AuthApi.login>[0]);
      const loginUser = ((response as { user?: unknown })?.user ?? response) as LoginPayload;

      try {
        await applyConfig(await fetchAppConfig(), { newSession: true });
      } catch (configError) {
        // Non-critical: login succeeded, so run on the login payload in memory.
        console.warn('App config unavailable after login, using login response', configError);
        setConfig(configFromLoginUser(loginUser));
      }

      return { success: true, data: response };
    } catch (error) {
      await resetSession();
      return errorResult(error, 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── register ──────────────────────────────────────────────────────────────
  const register = async (userData: Record<string, unknown>): Promise<AuthResult> => {
    try {
      setLoading(true);
      const response = await AuthApi.register(userData as Parameters<typeof AuthApi.register>[0]);
      const registeredUser = ((response as { user?: unknown })?.user ?? response) as LoginPayload | undefined;

      try {
        await applyConfig(await fetchAppConfig(), { newSession: true });
      } catch {
        if (registeredUser?.uuid) setConfig(configFromLoginUser(registeredUser));
      }

      return { success: true, data: response, message: 'Registration successful.' };
    } catch (error) {
      return errorResult(error, 'Registration failed.');
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
      await resetSession();
      window.location.href = '/login';
    }
  };

  // ── updateProfile ─────────────────────────────────────────────────────────
  const updateProfile = async (profileData: Record<string, unknown>): Promise<AuthResult> => {
    try {
      const updated = await AuthApi.updateProfile(profileData);
      await refreshConfig();
      return { success: true, data: updated };
    } catch (error) {
      return errorResult(error, 'Profile update failed.');
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const user = useMemo<AuthUserView | null>(() => (config ? { ...config.user, role: config.role, organisation: config.organisation } : null), [config]);
  const sidebarMenu = useMemo(() => getSidebarMenu(config), [config]);
  const settingsMenu = useMemo(() => getSettingsMenu(config), [config]);
  const currency = useMemo(() => getEffectiveCurrency(config), [config]);

  const value: AuthContextType = {
    config,
    user,
    organisation: config?.organisation ?? null,
    currency,
    tax: config?.tax ?? null,
    sidebarMenu,
    settingsMenu,
    isAuthenticated: Boolean(config),
    organisationComplete: Boolean(config?.organisation?.is_complete),
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshConfig,
    checkAuthStatus: async () => {
      await refreshConfig();
    },
    hasPermission: (permission: string) => configHasPermission(config, permission),
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
