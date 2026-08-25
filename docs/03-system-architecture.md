# 03 — System Architecture

## 1. High-Level Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion + Recharts       │
│                                                                        │
│  ┌──────────────────────┬──────────────────────┬────────────────────┐  │
│  │     Admin Portal     │     Staff Portal     │  Customer Portal   │  │
│  │   /admin/dashboard   │   /staff/dashboard   │ /customer/overview │  │
│  │   /admin/customers   │   /staff/due         │ /customer/loan     │  │
│  │   /admin/loans       │   /staff/customers   │ /customer/savings  │  │
│  │   /admin/reports     │   /staff/collections │ /customer/receipts │  │
│  └──────────────────────┴──────────────────────┴────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       REACTIVE CLIENT STORE LAYER                       │
│                        Zustand + Persist (LocalStorage)                │
│                                                                        │
│  useAuthStore  useCustomerStore  useLoanStore  useSavingsStore        │
│  useCollectionStore  useBranchStore  useStaffStore  useOrgStore        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    DUAL-ACCOUNT LEDGER TRANSACTION ENGINE               │
│                                                                        │
│   Single Combined Collection Entry:                                    │
│   ├── 1. Decrement Loan Outstanding & Mark Installment Paid             │
│   ├── 2. Increment Savings Account Balance & Append Deposit Ledger     │
│   ├── 3. Generate Official Collection Receipt ID                       │
│   └── 4. Trigger Real-time Dashboard KPI & Audit Notification          │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Component Boundaries & Responsibilities
- **`AppLayout`**: Manages common navigation, sidebar state, topbar search, branch switcher, and global collection modal trigger.
- **`CombinedCollectionModal`**: Orchestrates customer lookup, live calculation of total recovery, visual allocation preview, submission processing, and thermal receipt display.
- **`ReceiptView`**: Renders institutional proof of payment with printable CSS adhering to standard POS/A4 formats.
