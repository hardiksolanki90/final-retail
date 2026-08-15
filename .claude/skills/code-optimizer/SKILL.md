# Code Optimizer Skill

## Overview

The **Code Optimizer** skill provides structured guidance and automated tooling for improving the performance, bundle size, and runtime efficiency of the Retail App React frontend. It covers everything from component-level optimizations to build pipeline tuning, with a focus on measurable improvements.

## Purpose

React applications can degrade in performance as they grow — unnecessary re-renders, bloated bundles, unoptimized assets, and inefficient data fetching patterns all contribute to a slow user experience. This skill helps you:

- **Identify** performance bottlenecks systematically
- **Apply** proven optimization patterns specific to React + Vite + TypeScript
- **Measure** the impact of each optimization
- **Prevent** regression with automated checks

## How to Use

### 1. Run the Performance Audit

Start by running the audit script to get a baseline:

```bash
bash .claude/skills/code-optimizer/scripts/audit.sh
```

This will analyze:
- Bundle size breakdown
- Component render counts
- Unused dependencies
- Large imports

### 2. Apply Optimizations by Category

#### 🔄 Re-render Prevention

```tsx
// ❌ Bad: Inline object creates new reference every render
<Component style={{ color: 'red' }} />

// ✅ Good: Stable reference via useMemo or constant
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />
```

```tsx
// ❌ Bad: Inline callback creates new function every render
<Button onClick={() => handleClick(id)} />

// ✅ Good: Stable callback via useCallback
const handleClick = useCallback((id) => { ... }, []);
<Button onClick={() => handleClick(id)} />
```

```tsx
// ❌ Bad: Parent re-render causes child re-render
const ChildComponent = ({ data }) => <div>{data.name}</div>;

// ✅ Good: Memoize expensive children
const ChildComponent = React.memo(({ data }) => <div>{data.name}</div>);
```

#### 📦 Bundle Size Reduction

```tsx
// ❌ Bad: Import entire library (kills tree-shaking)
import _ from 'lodash';
import { format, parse, addDays, subDays, isAfter } from 'date-fns';

// ✅ Good: Import only what you need
import debounce from 'lodash/debounce';
import { format } from 'date-fns/format';
```

```tsx
// ❌ Bad: Load everything on initial page
import ItemViewDrawer from './ItemViewDrawer';

// ✅ Good: Code-split drawers/modals (not needed on first paint)
const ItemViewDrawer = React.lazy(() => import('./ItemViewDrawer'));
```

#### 🌐 API & Data Fetching

```tsx
// ❌ Bad: Fetch on every mount with no caching
useEffect(() => {
  axios.get('/api/items').then(res => setItems(res.data));
}, []);

// ✅ Good: Cache responses, deduplicate requests
// Use SWR, React Query, or a custom cache layer
const { data: items } = useSWR('/api/items', fetcher);
```

```tsx
// ❌ Bad: Fetch all data then filter client-side
const allItems = await getItems();
const filtered = allItems.filter(i => i.status === 'active');

// ✅ Good: Server-side filtering
const activeItems = await getItems({ status: 'active' });
```

#### 🖼️ Asset Optimization

```tsx
// ❌ Bad: Uncompressed images loaded eagerly
<img src="/images/hero-banner.png" />

// ✅ Good: Lazy load, compress, use modern formats
<img 
  src="/images/hero-banner.webp" 
  loading="lazy" 
  decoding="async"
  width={1200}
  height={400}
/>
```

#### 📋 List Virtualization

```tsx
// ❌ Bad: Render 1000+ rows in the DOM
{items.map(item => <Row key={item.id} {...item} />)}

// ✅ Good: Virtualize long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <Row style={style} {...items[index]} />
  )}
</FixedSizeList>
```

### 3. Measure Results

After applying optimizations, verify the impact:

```bash
# Build and analyze bundle
npm run build
npx vite-bundle-analyzer

# Run Lighthouse audit
npx lighthouse http://localhost:5173 --output=json --output-path=./lighthouse-report.json

# Check bundle size
du -sh dist/
```

## Optimization Checklist

### Component Level
- [ ] `React.memo()` on pure presentational components
- [ ] `useCallback` for event handlers passed as props
- [ ] `useMemo` for expensive computations
- [ ] Avoid inline object/array literals in JSX props
- [ ] Use `key` prop correctly in lists (not array index for dynamic lists)

### Route Level
- [ ] Lazy load all route-level page components
- [ ] Prefetch critical routes on hover/focus
- [ ] Code-split heavy drawers, modals, and forms

### Data Fetching
- [ ] Cache API responses (SWR / React Query / custom)
- [ ] Debounce search/filter inputs (300ms minimum)
- [ ] Paginate large datasets server-side
- [ ] Cancel in-flight requests on unmount

### Bundle
- [ ] Tree-shake UI library imports
- [ ] Analyze bundle with `vite-bundle-analyzer`
- [ ] Extract vendor chunks for caching
- [ ] Remove unused dependencies (`depcheck`)
- [ ] Use dynamic imports for rarely-used features

### Assets
- [ ] Convert images to WebP/AVIF
- [ ] Lazy load below-the-fold images
- [ ] Use SVG for icons (not icon fonts)
- [ ] Compress static assets in production build

### Build Pipeline
- [ ] Enable gzip/brotli compression in Vite config
- [ ] Configure proper cache headers for static assets
- [ ] Minify CSS and JS in production
- [ ] Source maps disabled in production (unless needed for error tracking)

## When to Optimize

| Signal | Action |
|--------|--------|
| Lighthouse Performance < 90 | Run full audit |
| Bundle size > 500KB (gzipped) | Analyze and code-split |
| Component re-renders > 3x per interaction | Add memoization |
| API response > 1s | Add caching or pagination |
| List with > 100 visible items | Virtualize |
| Time-to-Interactive > 3s | Lazy load non-critical code |

## Anti-Patterns to Avoid

1. **Premature optimization** — Profile first, optimize second
2. **Over-memoization** — `useMemo`/`useCallback` on cheap computations adds overhead
3. **Prop drilling to avoid re-renders** — Use context or state management instead
4. **Disabling React Strict Mode** — It reveals real issues, don't suppress them
5. **Ignoring dev vs prod differences** — Always measure in production builds
