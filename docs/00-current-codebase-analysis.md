# 00 — Current Codebase Analysis

## 1. Project Overview
The **NGO Loan & Savings Management System** is a modern microfinance operating platform designed for non-governmental organizations and micro-credit institutions in Bangladesh. It provides institutional accounting, dual-account loan installment and savings recovery, branch oversight, field officer management, and customer self-service capabilities.

## 2. Existing Stack & Technologies
- **Framework**: React 19.2.8 with TypeScript 6.0.2 & Vite 8.2.2
- **Styling**: Tailwind CSS v4.3.3 (`@tailwindcss/vite`), Custom CSS variables for financial figures and Bengali typography
- **State Management**: Zustand 5.0.15 with `persist` middleware
- **Data Visualization**: Recharts 3.10.1
- **Icons & Micro-interactions**: Lucide React, Framer Motion 13.1.1
- **Component Primitives**: Radix UI (Dialog, Tabs, Badge, Slot)

## 3. Existing Modules
1. **Core Data Store (`src/store/index.ts`)**: Reactive Zustand state managing `users`, `branches`, `staff`, `customers`, `loans`, `savingsAccounts`, `collections`, `notifications`, and computed `dueItems`.
2. **Design System (`src/index.css`)**: Deep Teal palette (`--color-primary-700`), warm neutrals, tabular numerals (`.financial-value`), Bengali font fallback (`.bn`), print stylesheet for 80mm receipts.
3. **Combined Collection & Allocation (`src/components/collection/`)**:
   - `CombinedCollectionModal.tsx`: Dual-account settlement modal.
   - `AccountAllocationViz.tsx`: Visual diagram showing distribution of single payment into loan and savings ledgers.
   - `ReceiptView.tsx`: Printable thermal receipt layout.
4. **Admin Portal Pages (`src/pages/admin/`)**:
   - `DashboardPage.tsx`: Live KPI summary cards, 7-day/30-day collection charts, branch comparison table, and quick collection triggers.
   - `CustomersPage.tsx`: Customer directory with search, filter, and modal for onboarding new borrowers.
   - `CustomerDetailPage.tsx`: 360-degree borrower profile, installment calendar, savings ledger, and transaction history.
   - `LoansPage.tsx`: Loan portfolio table and 3-step Create Loan wizard.
   - `SavingsPage.tsx`: Member savings vault, transaction ledger, and withdrawal workflow.
   - `DuePage.tsx`: Real-time daily due tracking with instant collection triggers.
   - `BranchesPage.tsx`: Multi-branch network oversight.
   - `StaffPage.tsx`: Field officer roster.
5. **Auth Portal (`src/pages/auth/LoginPage.tsx`)**: 1-click role switcher for Admin, Staff, and Customer demos.
