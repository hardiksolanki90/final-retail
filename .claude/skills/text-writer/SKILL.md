# Text Writer Skill

## Overview
Generates clear, concise text content for the React frontend project — including documentation, commit messages, PR descriptions, component JSDoc, and user-facing copy.

## Capabilities

### Component Documentation
```tsx
/**
 * SalesmanViewDrawer
 * 
 * Side drawer displaying salesman details with tabbed navigation.
 * Opens when a row is clicked in SalesmanList.
 * 
 * @param open - Whether the drawer is visible
 * @param onClose - Callback to close the drawer
 * @param salesmanId - UUID of the selected salesman
 */
```

### Commit Messages
Follow Conventional Commits:
```
feat(salesman): add view drawer with tabbed details
fix(auth): resolve token refresh race condition
refactor(services): extract shared API error handler
perf(item-list): virtualize table for large datasets
```

### PR Descriptions
```markdown
## What
Added ItemViewDrawer with product catalog and comments tabs.

## Why  
Users need to view item details without navigating away from the list.

## How
- Created `ItemViewDrawer` component with tabbed layout
- Added row click handler in `ItemList`
- Integrated with item detail API endpoint

## Testing
1. Navigate to Items → List
2. Click any row → Drawer opens with correct data
3. Switch between tabs → Content loads correctly
4. Close drawer → Returns to list view
```

### User-Facing Copy
- Error messages: Actionable ("Unable to load items. Please try again.")
- Empty states: Helpful ("No items found. Create your first item to get started.")
- Loading states: Brief ("Loading...")
- Success toasts: Confirming ("Item created successfully")
