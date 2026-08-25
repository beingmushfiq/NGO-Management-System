# DATABASE DECISIONS & SCHEMA EVOLUTION

This document records the design decisions and architectural rationale for the relational schema.

---

## 1. Summary of Key Architectural Decisions

| Decision Area | Chosen Approach | Alternatives Rejected | Rationale |
|---|---|---|---|
| **Balance Representation** | Derived from ledger + atomic cache column (ADR-003, ADR-004) | Single mutable column | Prevents silent balance drift, preserves full audit history, guarantees $O(1)$ read performance |
| **Collection Allocation** | Normalized `collection_allocations` table | Comma-separated or polymorphic JSON | Allows strict foreign key constraints to both `loan_installments` and `savings_accounts`, enabling multi-level SQL indexing |
| **Monetary Storage** | `DECIMAL(15,2)` | `FLOAT`, `DOUBLE`, `INT` (paisa) | Standard SQL precision for BDT currency, eliminates binary rounding errors |
| **Pessimistic Locking** | `SELECT ... FOR UPDATE` inside `DB::transaction()` | Optimistic locking with version column | Microfinance field collections cannot afford optimistic lock retry loops in poor network environments; pessimistic lock guarantees immediate serial execution |
| **Installment Remainder** | Remainder absorbed into final installment | Fractional paisa per installment | Bangladeshi currency operates on whole Taka in field practice; fractional installments cause field collector rounding errors |
| **Idempotency Defense** | `idempotency_key UNIQUE` on `collections` table | Redis cache TTL tokens | Database-backed uniqueness guarantees persistence across server restarts and Redis eviction |
