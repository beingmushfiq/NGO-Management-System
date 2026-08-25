# REST API ENDPOINTS SPECIFICATION

All endpoints are prefixed with `/api/v1` and protected with Sanctum token authentication unless marked `[Public]`.

---

## 1. Authentication & Session

- `POST /api/v1/auth/login` `[Public]` — Authenticate user with phone & password.
- `POST /api/v1/auth/logout` — Revoke active token.
- `GET /api/v1/auth/me` — Retrieve authenticated user profile and permissions.

---

## 2. Dashboard & Metrics

- `GET /api/v1/dashboard/summary` — Portfolio KPI aggregates (`branch_id` query param).
- `GET /api/v1/dashboard/trends` — Dual-stream trend data for Recharts charts (`range`, `days`, `branch_id`).

---

## 3. Customer Management

- `GET /api/v1/customers` — List members with filters (`search`, `branch_id`, `status`, pagination).
- `POST /api/v1/customers` — Register new member and initialize savings vault.
- `GET /api/v1/customers/{id}` — Full member profile with loans, savings ledger, and receipt history.
- `PUT /api/v1/customers/{id}` — Update KYC profile and address.

---

## 4. Loan Management

- `GET /api/v1/loans` — List loan portfolio (`search`, `status`, `branch_id`).
- `POST /api/v1/loans` — Originate & disburse loan with automated 50-week installment schedule.
- `GET /api/v1/loans/{id}` — Loan contract details.
- `GET /api/v1/loans/{id}/schedule` — 50-week installment breakdown with paid/remaining balances.

---

## 5. Due Installment Queue

- `GET /api/v1/installments/due` — Today's actionable recovery queue (`branch_id`, `date`, `search`).

---

## 6. Collections & Receipts (The Financial Core)

- `POST /api/v1/collections` — Process atomic combined collection (loan + savings). Supports idempotency keys.
- `GET /api/v1/collections/{id}/receipt` — Printable digital receipt payload.
- `GET /api/v1/collections` — Collection history list (`branch_id`, `staff_id`, `date`).

---

## 7. Savings Vaults

- `GET /api/v1/savings` — Savings accounts directory.
- `POST /api/v1/savings/{id}/deposit` — Direct counter savings deposit.
- `POST /api/v1/savings/{id}/withdraw` — Member savings withdrawal (guarded by balance limit).
- `GET /api/v1/savings/{id}/transactions` — Immutable transaction ledger for account.

---

## 8. Branch & Staff Roster

- `GET /api/v1/branches`, `POST /api/v1/branches`, `PUT /api/v1/branches/{id}`
- `GET /api/v1/staff`, `POST /api/v1/staff`, `PUT /api/v1/staff/{id}`

---

## 9. Reports & Exports

- `GET /api/v1/reports/daily-collection` — Daily collection sheet with grand totals.
- `GET /api/v1/reports/loan-portfolio` — Portfolio recovery and risk classification.
- `GET /api/v1/reports/savings` — Member savings equity ledger.
- `GET /api/v1/reports/branch-audit` — Multi-branch recovery matrix.
- `GET /api/v1/settings`, `PUT /api/v1/settings` — Institutional legal branding & MRA settings.
