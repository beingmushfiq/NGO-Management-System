# BACKEND IMPLEMENTATION PLAN

## 1. Phased Delivery Roadmap

```mermaid
gantt
    title NGO Backend Implementation Phases
    dateFormat  YYYY-MM-DD
    section Foundation
    Laravel App Scaffold & Config    :done, 2026-08-26, 1d
    Sanctum Auth & CORS Setup        :active, 2026-08-26, 1d
    section Database Layer
    Migrations & Relational Schema   :2026-08-26, 1d
    Eloquent Models & Relationships  :2026-08-26, 1d
    Seeders Matching Frontend Demo   :2026-08-26, 1d
    section Core Services
    ProcessCollectionService (Atomic):2026-08-26, 1d
    Loan & Schedule Services         :2026-08-26, 1d
    Savings Vault Ledger Services    :2026-08-26, 1d
    section API & Integration
    API Controllers & Resources      :2026-08-26, 1d
    Form Requests & Policies         :2026-08-26, 1d
    Financial Invariants Tests       :2026-08-26, 1d
```

---

## 2. Dependency Order of Module Implementation

1. **`branches`** & **`users`** (Auth, Staff, Roles)
2. **`customers`** (KYC, Members, Branch Linkages)
3. **`savings_accounts`** & **`savings_transactions`** (Vault Ledger)
4. **`loans`** & **`loan_installments`** (Disbursement & 50-Week Schedule)
5. **`collections`** & **`collection_allocations`** (`ProcessCollectionService` with row locking & atomic rollback)
6. **`audit_logs`** & **`org_settings`**
7. **Dashboard & Report Aggregators**
8. **Automated Test Suite (Financial Invariants FI-01 through FI-13)**
