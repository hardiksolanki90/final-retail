# React Component Patterns Reference

## Page Component Structure
```
src/pages/ModuleName/
├── ModuleNameList.tsx        # List page with table
├── ModuleNameAdd.tsx         # Create form
├── ModuleNameEdit.tsx        # Edit form
├── ModuleNameViewDrawer.tsx  # Side drawer with details
└── components/               # Module-specific shared components
```

## Drawer Pattern
```tsx
interface ViewDrawerProps {
  open: boolean;
  onClose: () => void;
  recordId: string | null;
}

const ModuleViewDrawer: React.FC<ViewDrawerProps> = ({ open, onClose, recordId }) => {
  // Fetch data when recordId changes
  // Render tabs: Overview, Details, etc.
};
```

## Service Layer Pattern
```tsx
// src/services/moduleService.ts
import axios from '@/utils/axios';

export const getAll = (params?: object) => axios.get('/module', { params });
export const getById = (id: string) => axios.get(`/module/${id}`);
export const create = (data: object) => axios.post('/module', data);
export const update = (id: string, data: object) => axios.put(`/module/${id}`, data);
export const remove = (id: string) => axios.delete(`/module/${id}`);
```
