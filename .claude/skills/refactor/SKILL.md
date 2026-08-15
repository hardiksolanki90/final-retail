# Refactor Skill

## Overview
Guides safe, incremental refactoring of the React frontend. Focuses on component decomposition, state normalization, and pattern consolidation.

## Refactoring Strategies

### Extract Shared Component
When the same UI pattern appears in 3+ modules:
```tsx
// ❌ Before: Duplicate drawer header in every module
// SalesmanViewDrawer.tsx, ItemViewDrawer.tsx, CustomerViewDrawer.tsx
// all have identical header + tabs structure

// ✅ After: Shared ViewDrawerLayout component
const ViewDrawerLayout = ({ title, tabs, onClose, actions }) => (
  <Drawer>
    <DrawerHeader title={title} onClose={onClose} actions={actions} />
    <TabContainer tabs={tabs} />
  </Drawer>
);
```

### Consolidate API Service
Move scattered axios calls to a unified service:
```tsx
// ❌ Before: Inline API calls
useEffect(() => {
  axios.get(`${baseUrl}/api/salesman`).then(res => setSalesmen(res.data));
}, []);

// ✅ After: Service layer
import { salesmanService } from '@/services';
const { data } = await salesmanService.getAll();
```

### Simplify State
Replace multiple `useState` calls with `useReducer` when state is complex:
```tsx
// ❌ Before: Multiple related states
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// ✅ After: Unified state
const [state, dispatch] = useReducer(fetchReducer, initialState);
```

### Extract Custom Hook
When logic is reused across components:
```tsx
// ✅ Custom hook for paginated data
const usePaginatedData = (endpoint: string) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // ... fetch logic
  return { data, page, total, setPage };
};
```

## Safety Rules
1. **One refactor per PR** — don't mix feature work and refactoring
2. **Tests first** — write tests for current behavior before changing structure
3. **Small steps** — refactor one component at a time
4. **Verify visually** — check the UI after each change
5. **Preserve behavior** — refactoring changes structure, not functionality
