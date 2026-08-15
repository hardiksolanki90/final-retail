# Architecture Overview

## Frontend Architecture

The Retail App React frontend is a **Single Page Application (SPA)** built with React, TypeScript, and Vite.

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                  │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │              React Router (Routes)              ││
│  └─────────┬───────────────────────────────────────┘│
│            │                                        │
│  ┌─────────▼───────────────────────────────────────┐│
│  │         Page Components (per module)            ││
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────┐  ││
│  │  │   List   │ │ Add/Edit │ │  View Drawer   │  ││
│  │  └────┬─────┘ └────┬─────┘ └───────┬────────┘  ││
│  └───────┼─────────────┼───────────────┼───────────┘│
│          │             │               │            │
│  ┌───────▼─────────────▼───────────────▼───────────┐│
│  │              Service Layer (API)                ││
│  │         axios instance + interceptors           ││
│  └─────────────────────┬───────────────────────────┘│
│                        │                            │
│  ┌─────────────────────▼───────────────────────────┐│
│  │           State Management (Store)              ││
│  └─────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────┘
                         │ HTTPS / REST
                         ▼
              ┌─────────────────────┐
              │   Laravel API       │
              │   (Backend)         │
              └─────────────────────┘
```

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool & dev server |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 4.x | Utility-first CSS framework |

## Directory Structure

```
src/
├── components/           # Shared reusable components
│   ├── Layout/           # App layout (sidebar, header, content)
│   ├── Table/            # Shared table components
│   ├── Drawer/           # Shared drawer patterns
│   └── Form/             # Shared form components
│
├── pages/                # Page components organized by module
│   ├── Auth/             # Login, Register
│   ├── Dashboard/        # Dashboard
│   ├── Salesman/         # Salesman CRUD
│   ├── Customer/         # Customer CRUD
│   ├── Item/             # Item CRUD
│   ├── Inventory/        # Stock management
│   ├── JourneyPlan/      # Journey planning
│   ├── Settings/         # Master data (Bank, Country, etc.)
│   └── Pricing/          # Pricing, Promotion, Discount
│
├── services/             # API service layer
│   ├── axios.ts          # Configured axios instance
│   ├── authService.ts    # Auth API calls
│   └── [module]Service.ts
│
├── store/                # Global state management
├── utils/                # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── routes/               # Route configuration
```

## Key Patterns

### Service Layer
All API calls go through the service layer — never inline `axios.get()` in components.

### Drawer Pattern
View details are shown in a side drawer (80% width) with tabbed navigation.

### Form Pattern
Add/Edit forms use controlled components with client-side validation before API submission.

### Auth Flow
Login → Sanctum token → Stored in memory/cookie → Sent via `Authorization` header → 401 triggers redirect to login.
