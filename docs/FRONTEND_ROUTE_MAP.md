# FRONTEND ROUTE MAP

| Route | Screen Name | Role Scope | Purpose | Required Backend API | Actions Supported | Status |
|---|---|---|---|---|---|---|
| `/login` | Login Page | Public | User authentication with phone + password or role switcher | `POST /api/v1/auth/login` | Login, role toggle | Confirmed |
| `/admin/dashboard` | Executive Financial Overview | `admin` | View portfolio KPIs, trend chart, due queue, recent receipts | `GET /api/v1/dashboard/summary`, `GET /api/v1/dashboard/trends` | Filter branch, time ranges, launch collection | Confirmed |
| `/admin/customers` | Customer Directory | `admin` | Member directory, KYC search, registration modal | `GET /api/v1/customers`, `POST /api/v1/customers` | Search, branch filter, status filter, register member | Confirmed |
| `/admin/customers/:id` | Member Profile Details | `admin` | Detailed view of single customer, active loans, savings ledger, receipts | `GET /api/v1/customers/{id}` | Direct deposit modal, collect modal, print statement | Confirmed |
| `/admin/loans` | Loan Portfolio | `admin` | Active and completed loans, 3-step disbursement wizard, installment drawer | `GET /api/v1/loans`, `POST /api/v1/loans`, `GET /api/v1/loans/{id}/schedule` | Disburse loan, search, view schedule, launch collect | Confirmed |
| `/admin/savings` | Savings Management | `admin` | Savings accounts directory, direct deposit modal, withdrawal modal, ledger | `GET /api/v1/savings`, `POST /api/v1/savings/{id}/deposit`, `POST /api/v1/savings/{id}/withdraw` | Direct deposit, record withdrawal, search accounts | Confirmed |
| `/admin/due` | Today's Due Installments | `admin` | Actionable recovery queue with customer, installment, savings due | `GET /api/v1/installments/due` | Branch filter, search, quick collect | Confirmed |
| `/admin/branches` | Branch Operations | `admin` | Branch performance cards, recovery rates, open new branch modal | `GET /api/v1/branches`, `POST /api/v1/branches` | Open branch, filter, manager assign | Confirmed |
| `/admin/staff` | Staff & Field Officers | `admin` | Staff roster, appoint officer modal, branch assignments | `GET /api/v1/staff`, `POST /api/v1/staff` | Appoint staff, branch filter, role assign | Confirmed |
| `/admin/reports` | Institutional Reports | `admin` | Daily collection sheet, loan portfolio quality, savings ledger, branch audit | `GET /api/v1/reports/daily-collection`, `GET /api/v1/reports/loan-portfolio`, `GET /api/v1/reports/savings`, `GET /api/v1/reports/branch-audit` | Filter branch/period, export CSV, print formal report | Confirmed |
| `/admin/settings` | System Settings | `admin` | Organization identity, MRA registration, helpline, branding | `GET /api/v1/settings`, `PUT /api/v1/settings` | Save settings | Confirmed |
| `/staff/dashboard` | Field Operations Dashboard | `staff` | Staff daily overview, assigned queue, branch stats | `GET /api/v1/staff/dashboard` | Launch collection, view assigned due | Confirmed |
| `/staff/due` | Assigned Due List | `staff` | Staff-specific recovery list for today's field route | `GET /api/v1/staff/due` | Search, quick collect | Confirmed |
| `/staff/customers` | Branch Borrowers | `staff` | Customers in staff's operating branch territory | `GET /api/v1/staff/customers` | Search, launch collection | Confirmed |
| `/staff/collections` | Staff Collection History | `staff` | Receipts issued by staff member today | `GET /api/v1/staff/collections` | View receipt, print receipt | Confirmed |
| `/customer/overview` | Member Self-Service | `customer` | Member's financial cards, loan status, savings balance | `GET /api/v1/customer/summary` | View receipts, check next due | Confirmed |
| `/customer/loan` | Member Loan Details | `customer` | Active loan details, 50-week installment schedule | `GET /api/v1/customer/loan` | View schedule, payment status | Confirmed |
| `/customer/savings` | Member Savings Vault | `customer` | Savings balance, lifetime deposits, transaction history | `GET /api/v1/customer/savings` | View transaction history | Confirmed |
| `/customer/receipts` | Money Receipts Archive | `customer` | Digital archive of money receipts | `GET /api/v1/customer/receipts` | View receipt, print receipt | Confirmed |
