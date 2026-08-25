# FRONTEND PERMISSIONS & AUTHORIZATION MATRIX

| Portal Feature / Route | Super Admin / Admin | Field Officer / Staff | Customer / Member | Backend Enforcement |
|---|---|---|---|---|
| `/admin/*` Routes | Full Access | Denied (Redirects to `/staff/dashboard`) | Denied (Redirects to `/customer/overview`) | `middleware('role:admin')` |
| `/staff/*` Routes | Full Access | Branch Scoped Access | Denied | `middleware('role:staff,admin')` |
| `/customer/*` Routes | Full Access (for audit) | Denied | Own Profile Only | `middleware('role:customer,admin')` + Customer ID matching |
| Register New Customer | Authorized (All branches) | Authorized (Own branch only) | Denied | `CustomerPolicy@create` |
| Disburse New Loan | Authorized | Denied (Admin approval required) | Denied | `LoanPolicy@create` |
| Record Collection | Authorized | Authorized (Assigned branch members) | Denied | `CollectionPolicy@create` |
| Deposit / Withdraw Savings | Authorized | Deposit only | Denied | `SavingsPolicy@withdraw` |
| View Financial Reports | Authorized (Full export) | Denied | Denied | `ReportPolicy@view` |
| Modify System Settings | Authorized | Denied | Denied | `SettingsPolicy@update` |

> [!IMPORTANT]
> Frontend restrictions are visual only. Every permission above must be independently enforced in Laravel Controllers and Form Requests via Policies and Gates.
