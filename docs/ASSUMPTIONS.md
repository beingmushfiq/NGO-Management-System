# ASSUMPTIONS & CLIENT CONFIRMATION LOG

This document tracks items that have been adopted as working defaults based on the analyzed frontend, but require explicit client sign-off if institutional policies differ.

---

## 1. Assumption Register

| ID | Area | Frontend Evidence | Working Assumption | Why Needed | Impact if Changed | Client Confirmation Required? |
|---|---|---|---|---|---|---|
| **ASM-01** | **Service Charge Model** | Frontend shows `serviceChargeRate` input defaulting to 10% | Service charge is a flat percentage on principal, calculated once at loan creation | Needed for schedule generation | If reducing-balance or APR is required, calculation formulas change | 🟡 Recommended Default (Confirmed) |
| **ASM-02** | **Overdue Penalties** | No penalty fields in frontend UI or forms | No automated monetary late-payment penalties are levied | Microcredit systems often rely on field group pressure rather than compounding fees | Would require penalty ledger if added | 🟢 Safe Default (Do not invent) |
| **ASM-03** | **Rounding Rule** | Frontend uses `Math.round(totalPayable / weeks)` | Integer BDT rounding with remainder placed in final installment | Eliminates fractional paisa in weekly collections | None | 🟢 Safe Default |
| **ASM-04** | **Savings Interest / Dividend** | No interest crediting UI in frontend | Savings interest crediting is not part of MVP | Only deposit and withdrawal ledgers required | If added, will be an `adjustment` transaction | 🟢 Safe Default |
| **ASM-05** | **Super Admin Scope** | Admin role can view and filter all branches | Super Admin / Admin has global organization-wide visibility; Staff is branch-restricted | Scoping queries in API | Security boundaries | 🟢 Safe Default |
