# Frontend API Integration Patterns

## Axios Instance
- Base instance configured in `src/services/api.js`
- Base URL: `/api` (proxied to Laravel backend)
- Includes CSRF token handling, 401 redirect, 419 token refresh
- `withCredentials: true` for Sanctum cookie auth

## API Class Pattern
Each module has a dedicated API class in `src/api/`:
```typescript
// src/api/EntityApi.ts
import api from '../services/api';

const EntityApi = {
  list: async (params?: Record<string, any>) => {
    const response = await api.get('/entity/list', { params });
    return response.data;
  },

  listAll: async () => {
    const response = await api.get('/entity/all');
    return response.data;
  },

  add: async (data: EntityFormData) => {
    const response = await api.post('/entity/add', data);
    return response.data;
  },

  getByUuid: async (uuid: string) => {
    const response = await api.get(`/entity/edit/${uuid}`);
    return response.data;
  },

  update: async (uuid: string, data: EntityFormData) => {
    const response = await api.post(`/entity/edit/${uuid}`, data);
    return response.data;
  },

  delete: async (uuid: string) => {
    const response = await api.delete(`/entity/delete/${uuid}`);
    return response.data;
  },
};

export default EntityApi;
```

## React Query Integration
```typescript
// In hooks: use React Query with API classes
const { data, isLoading } = useQuery({
  queryKey: ['entities', filters],
  queryFn: () => EntityApi.list(filters),
});
```

## Error Handling
- API errors are caught by Axios interceptors (401 → redirect, 419 → retry)
- Module-level errors handled in React Query `onError` callbacks
- Display errors with `toast.error()` from react-hot-toast

## Authentication Flow
1. Call `GET /sanctum/csrf-cookie` before login
2. Call `POST /api/auth/login` with email/password
3. Store auth state in React Context
4. All subsequent API calls include cookie automatically
