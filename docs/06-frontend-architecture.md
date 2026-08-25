# 06 — Frontend Architecture & State Management

## 1. Directory Structure

```text
src/
├── types/              # Domain interfaces and union types
├── data/               # Bangladesh NGO mock seed datasets
├── lib/                # Utility helpers (cn, formatCurrency, formatDate, id generators)
├── store/              # Zustand stores with localStorage persistence
├── components/
│   ├── ui/             # Radix primitives & reusable presentation widgets
│   ├── layout/         # AppLayout, Sidebar, Topbar, Search, NotificationCenter
│   └── collection/     # CombinedCollectionModal, AccountAllocationViz, ReceiptView
└── pages/
    ├── auth/           # LoginPage
    ├── admin/          # Admin portal pages
    ├── staff/          # Staff field operations portal pages
    └── customer/       # Customer self-service portal pages
```

## 2. Routing Architecture
Centralized in `src/App.tsx` utilizing React Router v7 with nested route layouts:
- `/login`: Public auth view
- `/admin/*`: Admin routes wrapped in `AppLayout`
- `/staff/*`: Staff routes wrapped in `AppLayout`
- `/customer/*`: Customer routes wrapped in `AppLayout`
- Dynamic redirects ensuring authenticated users land on their role's respective home view.
