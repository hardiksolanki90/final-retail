# Code Optimization References

Curated resources for understanding and applying performance optimization techniques in React applications.

---

## Official Documentation

### React Performance
- [React Docs: Optimizing Performance](https://react.dev/learn/render-and-commit)
- [React.memo API](https://react.dev/reference/react/memo)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [useCallback Hook](https://react.dev/reference/react/useCallback)
- [Code Splitting with React.lazy](https://react.dev/reference/react/lazy)

### Vite Build Optimization
- [Vite: Build Optimizations](https://vitejs.dev/guide/build.html)
- [Vite: Dependency Pre-bundling](https://vitejs.dev/guide/dep-pre-bundling.html)
- [Rollup Output Options (used by Vite)](https://rollupjs.org/configuration-options/#output-manualchunks)

### Web Performance Standards
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)

---

## Key Concepts

### 1. React Rendering Model
React re-renders a component when:
- Its state changes
- Its parent re-renders (unless wrapped in `React.memo`)
- A context it consumes changes

**Rule of thumb**: Don't optimize renders until you've measured. Use React DevTools Profiler.

### 2. Bundle Splitting Strategy
For the Retail App, recommended chunk strategy:

```
vendor.js        → React, React DOM, Router (rarely changes, cached long-term)
ui-library.js    → Ant Design / MUI components
app.js           → Application code (routes, layouts)
[module].js      → Lazy-loaded per-module chunks (Salesman, Item, etc.)
```

### 3. Memoization Decision Tree
```
Should I memoize this?
├── Is the component re-rendering unnecessarily? → MEASURE FIRST
│   ├── Yes, and it's expensive → React.memo + useMemo
│   ├── Yes, but it's cheap → Probably not worth it
│   └── No → Don't memoize
└── Is a computed value expensive (>1ms)? 
    ├── Yes → useMemo
    └── No → Don't bother
```

### 4. Network Waterfall Optimization
```
BAD:  Page Load → Auth Check → Fetch Layout → Fetch Data → Render
GOOD: Page Load → [Auth Check + Prefetch Data] → Render
```

Parallelize independent requests. Use `Promise.all()` or data fetching libraries with deduplication.

---

## Useful Tools

| Tool | Purpose | Command |
|------|---------|---------|
| React DevTools Profiler | Measure component render times | Browser extension |
| vite-bundle-analyzer | Visualize bundle composition | `npx vite-bundle-analyzer` |
| Lighthouse | Full performance audit | `npx lighthouse <url>` |
| depcheck | Find unused dependencies | `npx depcheck` |
| why-is-node-running | Debug hanging processes | `npx why-is-node-running` |
| source-map-explorer | Analyze source maps | `npx source-map-explorer dist/**/*.js` |

---

## Project-Specific Notes

### Retail App Optimization Priorities

1. **Drawer/Modal code splitting** — ViewDrawer components are heavy but not needed on initial load
2. **Table virtualization** — Salesman, Item, Customer lists can have 1000+ rows
3. **API response caching** — Master data (countries, currencies, routes) rarely changes
4. **Image lazy loading** — Product catalog images should load on demand
5. **Form library** — Ensure form state updates don't trigger full-page re-renders
