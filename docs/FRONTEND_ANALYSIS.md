# FRONTEND ANALYSIS

## 1. Frontend Technology Stack

| Dimension | Specification / Library | Purpose in System |
|---|---|---|
| **Framework** | React 19 (`react` 19.2.8, `react-dom` 19.2.8) | UI component model |
| **Language** | TypeScript 6.0.2 | Strict type safety for financial entities |
| **Build Tool** | Vite 8.2.2 with `@vitejs/plugin-react` | Development & build bundling |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite` 4.3.3) | Design system & utility styling |
| **Icons** | Lucide React 1.34.0 | Institutional iconography |
| **Animations** | Framer Motion 13.1.1 | Modal transitions & reactive animations |
| **Charts** | Recharts 3.10.1 | Trend lines, Area charts & Bar distributions |
| **State & Store** | Zustand 5.0.15 with `persist` middleware | Centralized state & reactive storage |
| **Data Fetching / Query** | TanStack React Query 5.102.3 | API data synchronization |
| **Routing** | React Router DOM 7.18.2 | Declarative multi-portal routing |
| **Forms & Validation** | React Hook Form 7.86.0 + Zod 4.4.3 | High-fidelity form validation |
| **Date Utilities** | Date-fns 4.4.0 | Timezone and calendar math |
| **Design Language** | Custom Institutional Microfinance System | Forest/Teal `#0f766e`, Slate Dark Mode, Bangla localization |

---

## 2. Portal & Navigation Architecture

The frontend is divided into three role-based portals guarded by `ProtectedLayout`:

1. **Admin Portal (`/admin/*`)** — Full organizational governance, dashboard metrics, customer KYC, loan lifecycle, savings vaults, due queue, branch management, staff assignments, institutional reports, and system settings.
2. **Staff Portal (`/staff/*`)** — Field-officer territory view, today's due recovery queue, assigned customers, field collection recording, and instant receipt generation.
3. **Customer Self-Service Portal (`/customer/*`)** — Member self-service view showing active loan status, weekly installment schedule, savings account ledger balance, and historical payment receipts.

---

## 3. Frontend State Management & Persistence Analysis

The frontend currently uses Zustand in [`ngo-frontend/src/store/index.ts`](file:///d:/NGO%20System/ngo-frontend/src/store/index.ts) with `localStorage` persistence:

- `useAuthStore` — User identity (`User`), role (`admin` | `staff` | `customer`), branch affiliation (`branchId`), customer mapping (`customerId`).
- `useCustomerStore` — Customer directory (`Customer[]`), registration method, search & filter predicates.
- `useLoanStore` — Loan lifecycle (`Loan[]`), installment schedule generation, installment payment application.
- `useSavingsStore` — Member savings accounts (`SavingsAccount[]`), deposit ledger, withdrawal ledger.
- `useCollectionStore` — Combined collection records (`Collection[]`), atomic dual-mutation, receipt ID generation.
- `useBranchStore` — Branch network (`Branch[]`), selected active branch filter.
- `useStaffStore` — Field officer roster (`Staff[]`).
- `useOrgStore` — Organization settings (`OrgSettings`), bilingual names, MRA registration, helpline.
- `useNotificationStore` — Real-time notification center for audit alerts and overdue flags.
- `useDueItems(branchId)` — Reactive computed selector deriving today's pending due items from loan installments and savings contributions.

---

## 4. Collection Lifecycle in Frontend

1. **Triggering**:
   - "+ New Collection" header button on Dashboard/Customers/Staff Due pages
   - "Collect" action on any pending due installment row
2. **Modal Experience (`CombinedCollectionModal.tsx`)**:
   - Member search / auto-selection
   - Automatic pre-fill of loan due (`installment.expected`) and savings target (৳200 default)
   - Real-time reactive flow visualization (`AccountAllocationViz.tsx`) showing:
     - Total collection amount
     - Loan balance before & after
     - Savings balance before & after
   - Mode selection (Cash, bKash/Nagad, Bank Transfer) with reference input
3. **Confirmation & Receipt (`ReceiptView.tsx`)**:
   - Structured breakdown with loan and savings components
   - Unique receipt identifier (`COL-YYYYMMDD-XXXXX`)
   - MRA-compliant printable layout with customer & collector signatures
   - Direct `window.print()` trigger with printable stylesheet
