# API Reference (Frontend Perspective)

## Configuration

```typescript
// Base URL from environment
const API_URL = import.meta.env.VITE_API_URL; // e.g., https://apirudra.solequantum.com/api

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach auth token
api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) redirectToLogin();
    return Promise.reject(error);
  }
);
```

## Service Layer Usage

### Pattern
```typescript
// src/services/salesmanService.ts
import api from '@/utils/axios';

export const salesmanService = {
  getAll: (params?: object) => api.get('/salesman', { params }),
  getById: (id: string) => api.get(`/salesman/${id}`),
  create: (data: object) => api.post('/salesman', data),
  update: (id: string, data: object) => api.put(`/salesman/${id}`, data),
  remove: (id: string) => api.delete(`/salesman/${id}`),
};
```

### Usage in Components
```tsx
import { salesmanService } from '@/services/salesmanService';

const [salesmen, setSalesmen] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  salesmanService.getAll({ page: 1, per_page: 15 })
    .then(res => setSalesmen(res.data.data))
    .catch(err => message.error('Failed to load salesmen'))
    .finally(() => setLoading(false));
}, []);
```

## API Response Types

```typescript
interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  status: boolean;
  data: {
    current_page: number;
    data: T[];
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

## Available Endpoints

See the backend [API Reference](../../retail-app/docs/api-reference.md) for the complete list of endpoints, request/response shapes, and query parameters.
