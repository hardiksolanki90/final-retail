# Onboarding Guide — React Frontend

Welcome to the **Retail App React** frontend! This guide will get you productive quickly.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| npm | 9+ | Package manager |
| Git | 2.x | Version control |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> retail-app-react
cd retail-app-react

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api (or your backend URL)

# 4. Start development server
npm run dev
# App runs at http://localhost:5173
```

---

## Development Workflow

### Daily
1. `git pull origin main`
2. `npm install` (if package.json changed)
3. `npm run dev`

### Creating a New Module

1. Create page folder: `src/pages/NewModule/`
2. Create components:
   - `NewModuleList.tsx` — Table with data
   - `NewModuleAdd.tsx` — Creation form
   - `NewModuleEdit.tsx` — Edit form
   - `NewModuleViewDrawer.tsx` — Side drawer
3. Create service: `src/services/newModuleService.ts`
4. Register routes in the router configuration
5. Add sidebar entry in the layout

### Git Conventions
```
feat(module): description     # New feature
fix(module): description      # Bug fix
refactor(module): description # Code restructuring
perf(module): description     # Performance improvement
```

---

## Project Structure

```
src/
├── components/     # Shared components (Layout, Table, Drawer, Form)
├── pages/          # Page components by module
├── services/       # API service layer
├── store/          # State management
├── utils/          # Utility functions
├── hooks/          # Custom hooks
├── types/          # TypeScript types
└── routes/         # Route configuration
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure backend CORS config allows your dev server origin |
| 401 on API calls | Check token storage and `Authorization` header |
| Blank page after build | Check `base` in `vite.config.ts` and router basename |
| TypeScript errors | Run `npx tsc --noEmit` to see all type issues |
| Hot reload not working | Clear `.vite` cache: `rm -rf node_modules/.vite` |

---

## Resources

- [Architecture](./architecture.md)
- [API Reference](./api-reference.md)
- [Project Structure](../PROJECT_STRUCTURE.md)
