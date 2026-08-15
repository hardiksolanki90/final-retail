import axios from 'axios';

// Create axios instance with configuration
const api = axios.create({
  baseURL: '/api', // Will be proxied by Next.js to Laravel
  timeout: 10000,
  withCredentials: true, // Enable cookies for session-based auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized responses
    if (error.response?.status === 401) {
      // Clear any stored auth state and redirect to login
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
    }

    // Handle 419 CSRF token mismatch
    if (error.response?.status === 419) {
      // Refresh CSRF token and retry request
      return getCsrfCookie().then(() => {
        return api.request(error.config);
      });
    }

    return Promise.reject(error);
  }
);

// Get CSRF cookie from Sanctum
export const getCsrfCookie = () => {
  return api.get('/sanctum/csrf-cookie');
};

// Authentication API calls
export const authApi = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    // Get CSRF cookie first
    await getCsrfCookie();
    
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get authenticated user
  user: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },

  // Get user profile
  profile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

// Organisation API
export const organisationApi = {
  // Complete organisation setup
  setup: async (organisationData) => {
    const response = await api.post('/organisation/setup', organisationData);
    return response.data;
  },

  // Get current user's organisation
  getCurrent: async () => {
    const response = await api.get('/organisation/current');
    return response.data;
  },

  // Update organisation
  update: async (organisationData) => {
    const response = await api.put('/organisation/update', organisationData);
    return response.data;
  },
};

// Customer API
export const customerApi = {
  // Get paginated list of customers
  list: async (params = {}) => {
    const response = await api.get('/customer/list', { params });
    return response.data;
  },

  // Get all customers (no pagination)
  listAll: async (params = {}) => {
    const response = await api.get('/customer/all', { params });
    return response.data;
  },

  // Add new customer
  add: async (customerData) => {
    const response = await api.post('/customer/add', customerData);
    return response.data;
  },

  // Get customer by UUID
  getByUuid: async (uuid) => {
    const response = await api.get(`/customer/edit/${uuid}`);
    return response.data;
  },

  // Update customer
  update: async (uuid, customerData) => {
    const response = await api.post(`/customer/edit/${uuid}`, customerData);
    return response.data;
  },

  // Delete customer
  delete: async (uuid) => {
    const response = await api.delete(`/customer/delete/${uuid}`);
    return response.data;
  },
};

// Export the main api instance for other modules
export default api;