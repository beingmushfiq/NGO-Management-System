# FRONTEND GAPS & RECONCILIATION AUDIT

This document records architectural gaps identified between the client-side mock implementation and the production-grade Laravel backend requirements.

---

## 1. Identified Gaps & Resolutions

| # | Item | Frontend State | Backend Production Requirement | Resolution / ADR |
|---|---|---|---|---|
| **GAP-01** | **Mutable Outstanding Field** | `loan.outstanding` decremented directly in store | Must be derived from `collection_allocations` ledger | Resolved by ADR-003 & ADR-004 |
| **GAP-02** | **Flat Collection Schema** | Single `COLLECTION` table without allocations breakdown | Normalized `collections` + `collection_allocations` tables | Resolved by ADR-003 |
| **GAP-03** | **Partial Payment Support** | Frontend store set `paid: amount, outstanding: 0` regardless of amount | Backend must support `partial` status and compute remaining amount | Resolved by ADR-005 |
| **GAP-04** | **Flexible Collection Types** | UI assumed both loan and savings are submitted together | Backend supports combined, loan-only, and savings-only collections | Resolved by ADR-006 |
| **GAP-05** | **Offline Retry / Double-Submission** | UI had no idempotency key generation | Frontend should attach UUID `idempotency_key` to avoid duplicate charges on poor network | Resolved by ADR-007 |
| **GAP-06** | **Savings Account Creation** | Handled implicitly on customer add | Customer registration must transactionally create an active `savings_accounts` record | To be built in Customer Module |
| **GAP-07** | **Receipt Code Collisions** | Used client timestamp math | Backend generates collision-safe formatted sequence `COL-YYYYMMDD-XXXXX` | `ReceiptNumberService` |
| **GAP-08** | **Timezone Drift** | Browser local date strings | Explicit `Asia/Dhaka` (UTC+6) standard for all collection dates and report boundaries | Backend timezone config |
