# Integration Tests

Place integration tests that verify multiple components working together here.

## Scope
- Page-level rendering with mocked API
- Router navigation between pages
- Form submission → API call → success/error flow
- Drawer open → data fetch → tab switching

## Example
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SalesmanList } from '@/pages/Salesman/SalesmanList';
import { server } from '@/mocks/server';

describe('Salesman Module Integration', () => {
  it('opens view drawer when row is clicked', async () => {
    render(
      <MemoryRouter>
        <SalesmanList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('John Doe'));
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByTestId('view-drawer')).toBeVisible();
  });
});
```
