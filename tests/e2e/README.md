# End-to-End Tests

Place E2E tests that simulate real user flows here, using Playwright or Cypress.

## Scope
- Full user journeys: Login → Navigate → CRUD → Logout
- Cross-module workflows
- Permission-based access testing
- Responsive layout verification

## Example (Playwright)
```ts
import { test, expect } from '@playwright/test';

test('salesman CRUD flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to Salesman
  await page.click('text=Salesman');
  await expect(page).toHaveURL(/salesman/);

  // Create
  await page.click('text=Add Salesman');
  await page.fill('[name="name"]', 'Test Salesman');
  await page.click('text=Save');
  await expect(page.getByText('Test Salesman')).toBeVisible();
});
```
