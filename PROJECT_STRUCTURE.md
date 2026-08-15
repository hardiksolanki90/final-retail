# Project Overview

This is a Retail Management Application built with React, TypeScript, Vite, and Tailwind CSS.

## Codebase Structure

### Retail Application (React)
- **Frontend**: `/Users/rudransh/Documents/Hardik/retail-app-react`
  - Technology: React 19 + TypeScript + Vite + Tailwind CSS 4
  - Main entry: `src/main.tsx`
  - Key features: Customer management, Sales operations, Inventory, Reports, Dashboard

## Current Working Directory
Primary: `/Users/rudransh/Documents/Hardik/retail-app-react`

## Project Structure

```
retail-app-react/
├── public/                     # Static assets
├── src/
│   ├── assets/                # Images, icons, static files
│   ├── components/            # Reusable UI components
│   │   ├── layout/           # Layout components (Header, Sidebar, Layout)
│   │   └── ui/               # Generic UI components (Drawer, Modal, etc.)
│   ├── contexts/             # React Context providers
│   ├── data/                 # Static data and configurations
│   ├── pages/                # Page components (routes)
│   │   ├── Customer/         # Customer module
│   │   └── Dashboard.tsx     # Dashboard page
│   ├── App.tsx               # Root application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles (Tailwind)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Technology Stack

- **Framework**: React 19.1.0
- **Language**: TypeScript
- **Build Tool**: Vite with SWC for React
- **Styling**: Tailwind CSS 4.1.10 (NO Ant Design CSS)
- **Form Management**: React Hook Form for ALL form submissions
- **UI Components**: Custom Tailwind-based components
- **Routing**: React Router DOM 7.6.2
- **Icons**: Lucide React
- **State Management**: React Context API + React Query
- **Notifications**: React Hot Toast

## Coding Standards

### 1. General
- Follow **Airbnb** style guide for React/TypeScript
- Use clear, descriptive names; avoid unnecessary abbreviations
- Favor small, single-purpose functions over large blocks of logic
- Write JSDoc comments for complex business logic

### 2. Form Management with React Hook Form

**IMPORTANT: ALL FORM SUBMISSIONS MUST USE REACT HOOK FORM**

```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  password: string;
  name?: string;
}

const MyForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      name: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      // API call
      const response = await apiCall(data);
      
      if (response.success) {
        showToast.success('Form submitted successfully!');
        reset(); // Reset form after successful submission
      } else {
        setError('root', { message: response.message });
      }
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'An error occurred' 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Show root errors */}
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.root.message}
        </div>
      )}

      {/* Input with validation */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Please enter a valid email'
            }
          })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

### 3. File & Component Naming
- **Components**: PascalCase (e.g., `CustomerList.tsx`, `Header.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useTheme.ts`, `formatDate.ts`)
- **Directories**: PascalCase for feature modules (e.g., `Customer/`, `Dashboard/`)
- **CSS Variables**: kebab-case with `--` prefix (e.g., `--text-primary`, `--bg-card`)

### 3. Component Structure
```typescript
// Imports - grouped by: external, internal, types
import { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';
import { SomeComponent } from '../components';

// Types/Interfaces
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// Component
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State
  const [state, setState] = useState<Type>(initial);

  // Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);

  // Handlers
  const handleAction = () => {
    // handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 4. Error Handling
- Use try/catch sparingly; only when you can add meaningful recovery logic
- Let errors bubble up to error boundaries where possible
- In async code, use `.catch()` or try/catch inside async functions

### 5. Control Flow
- Use guard clauses and early returns
- Prefer logical fallbacks (`||`, `??`) over if/else
- Minimize nested conditionals

### 6. State Management
- Use React Context for global state (theme, auth, etc.)
- Use local state for component-specific data
- Avoid prop drilling; use context or composition

### 7. Styling Guidelines - NO ANT DESIGN

**CRITICAL: This project uses ONLY Tailwind CSS - NO Ant Design components or CSS anywhere**

```typescript
// ✅ CORRECT - Pure Tailwind CSS
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Submit
</button>

// ❌ FORBIDDEN - Do NOT use Ant Design (antd) components
// import { Button } from 'antd';           // NEVER use this
// <Button type="primary">Submit</Button>   // NEVER use this
```

**Tailwind Standards:**
- Use Tailwind utility classes exclusively
- Use CSS variables for theme colors:
  - `--text-primary`, `--text-secondary`, `--text-muted`
  - `--bg-card`, `--bg-secondary`
  - `--border-color`
- Support both light and dark themes with `dark:` prefix
- Use `transition-colors` for smooth theme transitions
- Responsive design with breakpoint prefixes: `sm:`, `md:`, `lg:`, `xl:`

**Loading Spinners (Tailwind only):**
```typescript
// Custom loading spinner
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

// With text
<div className="flex justify-center items-center min-h-screen">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  <p className="ml-4 text-lg text-gray-600">Loading...</p>
</div>
```

### 8. Component Patterns

#### Page Components
```typescript
export function PageName() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Page Title</h1>
        <p className="text-[var(--text-secondary)] mt-1">Page description</p>
      </div>

      {/* Page Content */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
        {/* content */}
      </div>
    </div>
  );
}
```

#### List/Table Components
- Include checkbox selection for bulk actions
- Add pagination with rows per page selector
- Include action buttons (Create, Export, Import, etc.)
- Support column visibility toggle

#### Modal Components
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title: string;
  children: React.ReactNode;
}
```

### 9. Adding New Features


### 10. Import/Export Organization
```typescript
// External libraries
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Icons
import { Plus, Download, Upload } from 'lucide-react';

// Internal components
import { Drawer } from '../components/ui';

// Types
import type { Customer } from '../types';

// Data
import { menuData } from '../data/menuData';
```

### 11. Dropdown/Popover Pattern
```typescript
const [isOpen, setIsOpen] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);

// Close on outside click
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### 12. Theme Support
- Always use CSS variables for colors
- Test components in both light and dark modes
- Use `dark:` prefix for dark mode specific styles when needed

### Modal Hook Pattern

Promise-based modal controllers for form modals and selection modals.

```typescript
// src/hooks/usePostFormModal.tsx
import { useState } from 'react';
import type { Post, PostFormData } from '../types/post';
import PostFormModal from '../components/PostFormModal';

interface PostFormOpenData {
  post?: Post | null;
}

type PostFormEvent =
  | { type: 'Saved'; data: PostFormData }
  | { type: 'Cancelled' };

export function usePostFormModal() {
  const [resolver, setResolver] = useState<((value: PostFormEvent) => void) | null>(null);
  const [state, setState] = useState<{
    isOpen: boolean;
    post: Post | null;
  }>({
    isOpen: false,
    post: null,
  });

  // Returns a promise that resolves when modal closes
  function openPostForm(data?: PostFormOpenData): Promise<PostFormEvent> {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setState({
        isOpen: true,
        post: data?.post || null,
      });
    });
  }

  function onClose() {
    if (state.isOpen) {
      setState({ isOpen: false, post: null });
      resolver?.({ type: 'Cancelled' });
    }
  }

  function onSave(data: PostFormData) {
    setState({ isOpen: false, post: null });
    resolver?.({ type: 'Saved', data });
  }

  // Render function for the modal
  function PostFormModalView() {
    return (
      <PostFormModal
        isOpen={state.isOpen}
        post={state.post}
        onClose={onClose}
        onSave={onSave}
      />
    );
  }

  return {
    openPostForm,
    PostFormModalView,
  };
}
```

**Usage in List Page:**

```typescript
function PostList() {
  const { openPostForm, PostFormModalView } = usePostFormModal();
  const createMutation = useCreatePost();

  async function handleAddNew() {
    const event = await openPostForm();

    if (event.type === 'Saved') {
      await createMutation.mutateAsync(event.data);
    }
  }

  async function handleEdit(post: Post) {
    const event = await openPostForm({ post });

    if (event.type === 'Saved') {
      await updateMutation.mutateAsync({ id: post.id, data: event.data });
    }
  }

  return (
    <IonPage>
      {/* ... list content */}
      <PostFormModalView />
    </IonPage>
  );
}
```

### Selection Modal Pattern

For selecting related entities (e.g., author, categories).

```typescript
// Single select (Author)
type AuthorSelectEvent =
  | { type: 'AuthorSelected'; data: { author: Employee } }
  | { type: 'Cleared' }
  | { type: 'Cancelled' };

// Multi-select (Categories)
type CategorySelectEvent =
  | { type: 'CategoriesSelected'; data: { categories: PostCategory[] } }
  | { type: 'Cancelled' };
```

### Segment Slider Pattern

For tabbed content with swipe navigation.

```typescript
// src/hooks/useSegmentSlider.tsx
export default function useSegmentSlider(segments: string[], defaultSegment: string) {
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const [segment, setSegment] = useState<string>(defaultSegment);

  function onSlideChange(swiper: Swiper) {
    setSegment(segments[swiper.activeIndex]);
  }

  function onSegmentChange(event: CustomEvent) {
    setSegment(event.detail.value);
    swiper?.slideTo(segments.indexOf(event.detail.value));
  }

  return { swiper, setSwiper, onSegmentChange, onSlideChange, segment };
}
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Git Workflow
- Create feature branches from main
- Use descriptive commit messages
- Test before pushing

## Best Practices
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript strictly; avoid `any` type
- Memoize expensive computations with `useMemo`
- Memoize callbacks passed to children with `useCallback`
- Lazy load pages/routes for better performance
