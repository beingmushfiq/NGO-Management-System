# TECHNICAL DECISIONS

This document defines the engineering and architectural decisions. These are **how** the system is built to uphold the business rules and financial invariants.

---

## 1. Database & Money Precision

1. **Storage Engine**: MySQL InnoDB for all tables to ensure ACID compliance, row-level locking, and foreign key referential integrity.
2. **Money Precision**: All monetary values are represented as `DECIMAL(15,2)` in MySQL and strings in PHP/JSON. Never use `FLOAT` or `DOUBLE`.
3. **Arbitrary Precision Math**: In PHP, all financial calculations (subtractions, divisions, multiplications) must use the `bcmath` extension (`bcadd`, `bcsub`, `bcmul`, `bcdiv`) with 2 decimal places to prevent binary floating-point rounding errors.

---

## 2. Derived Balance & Cache Architecture (ADR-003 & ADR-004)

1. **Source of Truth**:
   - `LoanBalanceService`: Outstanding balance = `loans.total_payable_amount - SUM(collection_allocations WHERE type='loan')`.
   - `SavingsBalanceService`: Savings balance = `balance_after` of latest `savings_transactions` record.
2. **Denormalized Cache Columns**:
   - `loans.cached_outstanding` and `loans.cached_total_paid`
   - `savings_accounts.cached_balance`
   - These cache columns are updated **atomically inside the exact same `DB::transaction()`** that commits the ledger entries.
   - List and dashboard queries read cache columns for $O(1)$ performance without per-row aggregation subqueries.

---

## 3. Concurrency, Locking & Atomicity (ADR-007)

1. **Pessimistic Row Locking**:
   - Inside `ProcessCollectionService`, rows are locked using `SELECT ... FOR UPDATE` on `loan_installments` and `savings_accounts` before computing balances.
   - This serializes concurrent collection attempts on the same member and prevents race conditions.
2. **Atomic Rollback**:
   - The entire collection workflow executes inside `DB::transaction()`. If any step (allocation write, ledger record, status update, audit log) fails, the transaction rolls back completely with zero side-effects.

---

## 4. Idempotency & Field Resilience

1. **Idempotency Keys**:
   - The `collections` table includes a `UNIQUE` nullable `idempotency_key VARCHAR(64)` column.
   - When a field officer retries a timed-out request with an existing idempotency key, the backend catches the duplicate and returns the existing collection receipt with HTTP 200 rather than creating a duplicate charge.

---

## 5. Security & Authentication

1. **Authentication**: Laravel Sanctum stateful API token authentication.
2. **Password Hashing**: Bcrypt with minimum work factor 12.
3. **Authorization**: Laravel Policies on all Eloquent models, enforcing branch isolation and role boundaries on the server side.
