import axiosInstance from '../lib/axios';

// ─── CSRF handshake ───────────────────────────────────────────────────────────
// Must be called before the first state-changing request (i.e. login/register).
// It makes Laravel set the XSRF-TOKEN cookie which axios then picks up.

const SANCTUM_URL = (import.meta.env.VITE_APP_URL || 'http://localhost:8000') + '/api/sanctum/csrf-cookie';

export const getCsrfCookie = (): Promise<void> =>
  axiosInstance.get(SANCTUM_URL, { baseURL: '' }).then(() => undefined);

// ─── Auth API calls ───────────────────────────────────────────────────────────

/**
 * Login — fetches CSRF cookie first, then authenticates.
 * Laravel Sanctum sets a session cookie in the response.
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  await getCsrfCookie();
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data.data ?? response.data;
};

/**
 * Logout — invalidates the server-side session.
 */
export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

/**
 * Get the currently authenticated user (relies on session cookie).
 */
export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await axiosInstance.get('/auth/user');
  return response.data.data ?? response.data;
};

/**
 * Register a new user account.
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  await getCsrfCookie();
  const response = await axiosInstance.post('/auth/register', data);
  return response.data.data ?? response.data;
};

/**
 * Request a password-reset link.
 */
export const forgotPassword = async (data: PasswordResetRequest): Promise<{ message: string }> => {
  await getCsrfCookie();
  const response = await axiosInstance.post('/auth/forgot-password', data);
  return response.data;
};

/**
 * Submit a new password using the reset token.
 */
export const resetPassword = async (data: PasswordResetConfirm): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/reset-password', data);
  return response.data;
};

/**
 * Update profile fields for the authenticated user.
 */
export const updateProfile = async (data: Partial<AuthUser>): Promise<AuthUser> => {
  const response = await axiosInstance.put('/auth/profile', data);
  return response.data.data ?? response.data;
};

/**
 * Change password (requires current password).
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/change-password', data);
  return response.data;
};
