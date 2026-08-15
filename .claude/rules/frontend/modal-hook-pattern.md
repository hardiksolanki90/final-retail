# Modal | Hook Pattern

## Overview

The **Modal | Hook Pattern** is the standard way to create reusable, Promise-based modals in this project. It separates modal UI from state management, enabling imperative usage (`await openModal(data)`) while keeping React's declarative rendering.

## Architecture

```
Consumer Component
  └─ const { open, ModalView } = useMyModal();
  └─ const result = await open({ ...data });
  └─ return <><ModalView /><OtherContent /></>
      │
      ▼
Hook (useMyModal.tsx)
  - Manages state (isOpen, data, resolver)
  - Provides open() function → returns Promise
  - Provides ModalView component
      │
      ▼
Modal Component (MyModal.tsx)
  - STRICT 4-PROP INTERFACE ONLY
```

## The 4-Prop Rule — MANDATORY

**Every modal component MUST accept exactly these 4 props:**

```typescript
interface ModalProps<TData = any, TEvent = any> {
    isOpen: boolean;
    onClose: () => void;
    data?: TData;
    onEvent?: (event: TEvent) => void;
}
```

| Prop | Purpose |
|------|---------|
| `isOpen` | Controls modal visibility |
| `onClose` | Called on cancel / backdrop tap / X button |
| `data` | **All custom props bundled into one object** |
| `onEvent` | Called when modal emits a result event |

## File Structure

```
src/
├── components/[Domain]/
│   └── MyModal.tsx          # Modal UI (4 props only)
└── hooks/[Domain]/
    └── useMyModal.tsx        # Hook: manages state + returns open() + ModalView
```

## Implementation

### 1. Define Types

```typescript
// src/types/MyModalTypes.ts
export interface MyModalData { items: Item[]; selectedId?: number; }
export interface MyModalEvent { eventType: 'ItemSelected' | 'Cancelled'; item?: Item; }
```

### 2. Modal Component

```typescript
// src/components/Domain/MyModal.tsx
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: MyModalData;
    onEvent?: (event: MyModalEvent) => void;
}

export default function MyModal({ isOpen, onClose, data, onEvent }: ModalProps) {
    return (
        <dialog open={isOpen} onClose={onClose}>
            {/* render data.items etc. */}
            <button onClick={() => onEvent?.({ eventType: 'Cancelled' })}>Cancel</button>
        </dialog>
    );
}
```

### 3. Hook

```typescript
// src/hooks/Domain/useMyModal.tsx
export default function useMyModal() {
    const [resolver, setResolver] = useState<((v: any) => void) | null>(null);
    const [state, setState] = useState<{ isOpen: boolean; data: MyModalData | null }>({
        isOpen: false, data: null,
    });

    function open(data: MyModalData): Promise<Item | null> {
        return new Promise((resolve) => {
            setResolver(() => resolve);
            setState({ data, isOpen: true });
        });
    }

    function onClose() {
        if (state.isOpen) { setState({ isOpen: false, data: null }); resolver?.(null); }
    }

    function onEvent(event: MyModalEvent) {
        if (event.eventType === 'ItemSelected') {
            setState({ isOpen: false, data: null }); resolver?.(event.item);
        }
    }

    const MyModalView = () => (
        <MyModal isOpen={state.isOpen} onClose={onClose} data={state.data} onEvent={onEvent} />
    );

    return { open, MyModalView };
}
```

### 4. Consumer Usage

```typescript
const { open: openItemSelector, MyModalView } = useMyModal();

const result = await openItemSelector({ items: myItems });
if (result) { /* user selected */ } else { /* user cancelled */ }

// MUST render ModalView in JSX:
return <><OtherContent /><MyModalView /></>;
```

## When to Use Hook Pattern vs Zustand

| Scenario | Use |
|----------|-----|
| Modal used by **a single component** | Hook pattern |
| Modal opened from **multiple components** | Zustand store |
| Modal opened from **services/classes** (non-React) | Zustand store |
| State shared **globally** | Zustand store |

### Zustand Pattern (for global modals)

```typescript
const useMyModalsStore = create((set) => ({
    myModal: { isOpen: false, data: null },
    openMyModal: (data) => set({ myModal: { isOpen: true, data } }),
    closeMyModal: () => set({ myModal: { isOpen: false, data: null } }),
}));
```

## Critical Rules

- ✅ **Always** use the strict 4-prop interface for modal components
- ✅ **Always** bundle all custom props into `data` — never add extra props
- ✅ **Always** render `<ModalView />` in the consumer's JSX
- ✅ **Always** reset state on `onClose`
- ❌ **Never** manage modal `isOpen` state in the consumer component
- ❌ **Never** resolve the Promise multiple times (guard with `isOpen` check)

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Hook file | `use[Name]Modal.tsx` | `useCustomerSelectorModal.tsx` |
| Open function | `open` or `open[Name]` | `openCustomerSelector()` |
| View component | `[Name]ModalView` | `CustomerSelectorModalView` |
| Modal component | `[Name]Modal.tsx` | `CustomerSelectorModal.tsx` |
| Data type | `[Name]ModalData` | `CustomerSelectorModalData` |
| Event type | `[Name]ModalEvent` | `CustomerSelectorModalEvent` |
