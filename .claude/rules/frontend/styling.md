# TailwindCSS Styling Conventions

## Version
- Using **TailwindCSS v4** with the Vite plugin (`@tailwindcss/vite`)
- No `tailwind.config.js` — TailwindCSS v4 uses CSS-based configuration

## CSS Architecture
- Global styles in `src/index.css`
- Use Tailwind utility classes directly in JSX
- Use `clsx` for conditional class composition
- Avoid inline styles — use Tailwind utilities instead

## Design System
- Follow consistent spacing, color, and typography patterns
- Use Tailwind's built-in responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Prefer semantic color names when defining custom colors

## Component Styling
```tsx
// Good: Conditional classes with clsx
<div className={clsx(
  'px-4 py-2 rounded-lg',
  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
)} />

// Bad: Inline styles
<div style={{ padding: '16px', backgroundColor: 'blue' }} />
```

## Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Test UI at common breakpoints: 375px, 768px, 1024px, 1440px

## Dark Mode
- Not currently implemented — follow Tailwind `dark:` prefix if added
