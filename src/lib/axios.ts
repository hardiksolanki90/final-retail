import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { showToast } from './toast';

// ─── Axios instance (session/cookie-based, Sanctum SPA auth) ─────────────────
//
// withCredentials: true is REQUIRED so the browser sends the Laravel session
// cookie and XSRF-TOKEN cookie with every request (cross-origin SPA).

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://app.retail.test/api/';
// const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,          // send session + XSRF cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',  // tells Laravel it's an AJAX request
  },
  timeout: 30000,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// Reads the XSRF-TOKEN cookie that Sanctum sets and forwards it as a header
// so Laravel's CSRF middleware accepts the request.

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const xsrfToken = getCookieValue('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    const signature = import.meta.env.VITE_API_SIGNATURE;
    if (signature) {
      config.headers['x-signature'] = signature;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // Session expired — only redirect if not already on the login page
          // (avoids infinite reload when checkAuthStatus fires on the login page)
          if (!window.location.pathname.startsWith('/login')) {
            showToast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;

        case 403:
          showToast.error('You do not have permission to perform this action.');
          break;

        case 404:
          showToast.error('Resource not found.');
          break;

        case 419:
          // CSRF token mismatch — should not normally happen, but guard against it
          showToast.error('Page expired. Please refresh and try again.');
          break;

        case 422: {
          const data = response.data as { message?: string; errors?: Record<string, string[]> };
          if (data.errors) {
            const firstError = Object.values(data.errors)[0]?.[0];
            showToast.error(firstError || 'Validation failed.');
          } else if (data.message) {
            showToast.error(data.message);
          }
          break;
        }

        case 500:
          showToast.error('Server error. Please try again later.');
          break;

        default:
          showToast.error('An error occurred. Please try again.');
      }
    } else if (error.request) {
      showToast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
