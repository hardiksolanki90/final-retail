import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  profileImage?: string;
  role?: {
    id: string;
    name: string;
  };
  organisationId?: string;
  organisationName?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('rc-auth-token');
    const storedUser = localStorage.getItem('rc-user');

    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setToken(storedToken);

      // Verify token with backend
      const response = await axiosInstance.get('/auth/user');
      if (response.data?.status === 'success') {
        setUser(response.data.user);
        localStorage.setItem('rc-user', JSON.stringify(response.data.user));
      }
    } catch {
      // Token invalid, clear auth state
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('rc-auth-token');
    localStorage.removeItem('rc-user');
    setUser(null);
    setToken(null);
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });

      if (response.data?.status === 'success') {
        const { user: userData, token: authToken } = response.data;

        setUser(userData);
        setToken(authToken);
        localStorage.setItem('rc-auth-token', authToken);
        localStorage.setItem('rc-user', JSON.stringify(userData));

        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('rc-user', JSON.stringify(userData));
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    updateUser,
  };
}

export default useAuth;
