# Unit Tests

Place unit tests for individual components, hooks, and utility functions here.

## Naming Convention
- `{ComponentName}.test.tsx` for component tests
- `{hookName}.test.ts` for hook tests
- `{utilName}.test.ts` for utility tests

## Example
```tsx
import { render, screen } from '@testing-library/react';
import { ItemList } from '@/pages/Item/ItemList';

describe('ItemList', () => {
  it('renders the item table', () => {
    render(<ItemList />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
```
