# React Component Standards

## Component Structure
- Use **functional components** with TypeScript
- Define prop types with `interface` (name: `{ComponentName}Props`)
- Export as default for page components, named exports for shared components

## File Naming
- Components: PascalCase (`CustomerList.tsx`, `OrderAdd.tsx`)
- Hooks: camelCase with `use` prefix (`useCustomers.ts`, `useAuth.ts`)
- API classes: PascalCase with `Api` suffix (`CustomerApi.ts`)
- Types: PascalCase (`Customer.ts`, `Order.ts`)
- Utils: camelCase (`formatDate.ts`)

## Module Organization
Each feature module follows this pattern:
```
pages/{Module}/
├── {Module}List.tsx    # List view with table, search, filters
├── {Module}Add.tsx     # Create/edit form (modal or page)
├── {Module}View.tsx    # Detail view (optional)
└── index.ts            # Re-exports (optional)

hooks/{Module}/
├── use{Module}.ts      # Main data hook (list, CRUD operations)
├── use{Module}Form.ts  # Form-specific hook (optional)
└── index.ts            # Re-exports (optional)
```

## State Management
- **Server state**: TanStack React Query (`useQuery`, `useMutation`)
- **App state**: React Context (auth, organisation, theme)
- **Form state**: React Hook Form (`useForm`, `Controller`)
- **Local state**: React `useState` for component-level UI state

## Hooks Pattern
```tsx
// Example: Custom hook for a module
export const useCustomers = () => {
  const query = useQuery({
    queryKey: ['customers'],
    queryFn: () => CustomerApi.list(),
  });

  const addMutation = useMutation({
    mutationFn: (data: CustomerFormData) => CustomerApi.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer added successfully');
    },
  });

  return { ...query, addCustomer: addMutation };
};
```

## Error Handling
- Use React Query's `onError` callbacks for API errors
- Display errors via `react-hot-toast`
- Handle loading/error states in UI with conditional rendering

## Protected Routes
- Wrap authenticated routes with `<ProtectedRoute />`
- Wrap organisation-required routes with `<OrganisationGuard />`
