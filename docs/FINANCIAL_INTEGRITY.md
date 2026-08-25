# FINANCIAL INTEGRITY & AUDIT TRAIL

## 1. Zero Mutation of Posted Ledgers (Protocol 7)

Financial transactions are strictly **append-only**:
1. `collection_allocations` rows are inserted upon collection and are never updated or deleted.
2. `savings_transactions` rows are written as immutable point-in-time ledgers recording `balance_before` and `balance_after`.
3. If an erroneous transaction occurs, corrections must be executed via controlled **compensating adjustments** or **formal reversals**.

---

## 2. Derived Balance Integrity Verifier (Artisan Command)

To verify continuous integrity between denormalized cache columns and raw ledger records, the backend includes an automated audit verification command:

```bash
php artisan ngo:verify-financial-integrity
```

This command runs nightly:
1. Iterates over all active loans and compares `cached_outstanding` against `total_payable_amount - SUM(collection_allocations)`.
2. Iterates over all savings accounts and compares `cached_balance` against the latest `savings_transactions.balance_after`.
3. Dispatches immediate alerts if any discrepancy is detected ($> 0.00$).
