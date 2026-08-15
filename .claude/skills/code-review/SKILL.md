# Code Review Skill

## Overview
Comprehensive code review skill for the Retail App React frontend. Analyzes code changes for quality, performance, accessibility, and adherence to project conventions.

## Checklist

### Component Quality
- [ ] Components follow single responsibility principle
- [ ] Proper TypeScript types/interfaces defined
- [ ] Props are destructured and typed
- [ ] Components use the established folder structure
- [ ] No prop drilling beyond 2 levels — use context or state management

### State Management
- [ ] State lives at the correct level (local vs global)
- [ ] No redundant state (derivable from existing state)
- [ ] Side effects properly handled in useEffect with correct deps
- [ ] Cleanup functions in useEffect for subscriptions/timers

### API Integration
- [ ] API calls go through the service layer
- [ ] Loading, error, and empty states handled
- [ ] Requests cancelled on component unmount
- [ ] Proper error messages shown to users

### Styling
- [ ] No inline styles — use CSS modules or styled-components
- [ ] Responsive design verified
- [ ] Dark mode compatible (if applicable)
- [ ] Consistent spacing and typography

### Performance
- [ ] No unnecessary re-renders
- [ ] Heavy components lazy loaded
- [ ] Images optimized and lazy loaded
- [ ] Lists virtualized when > 100 items

## Severity Levels
- 🔴 **Critical**: Crashes, data loss, security holes
- 🟠 **Major**: Performance issues, broken UX, missing validation
- 🟡 **Minor**: Code style, naming, missing types
- 🟢 **Info**: Suggestions and improvements
