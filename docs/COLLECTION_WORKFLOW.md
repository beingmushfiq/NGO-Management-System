# ATOMIC COLLECTION WORKFLOW SPECIFICATION

Complete execution trace of `ProcessCollectionService` inside a single MySQL transaction.

```
ProcessCollectionService::execute(CollectionDTO $dto): CollectionResult
│
├── 1. IDEMPOTENCY CHECK (Pre-Transaction)
│   └── Query collections WHERE idempotency_key = $dto->idempotencyKey
│       └── IF EXISTS → Return existing collection & receipt (HTTP 200)
│
├── 2. BEGIN DB::transaction()
│
├── 3. PESSIMISTIC ROW LOCKING
│   ├── Lock loan_installments row FOR UPDATE (if loan_amount > 0)
│   └── Lock savings_accounts row FOR UPDATE (if savings_amount > 0)
│
├── 4. INVARIANT & BALANCE CHECKS INSIDE LOCK
│   ├── Calculate: current_installment_paid = SUM(allocations WHERE loan_installment_id = ID)
│   ├── Calculate: installment_remaining = expected_amount - current_installment_paid
│   ├── Assert: loan_amount <= installment_remaining (FI-13)
│   ├── Assert: loan_amount <= loan.cached_outstanding (FI-11)
│   └── Assert: customer, loan, savings_account are active
│
├── 5. INSERT `collections` RECORD
│   ├── receipt_number = ReceiptNumberService::generate()  -- COL-YYYYMMDD-XXXXX
│   ├── total_amount = loan_amount + savings_amount (backend-computed)
│   ├── loan_balance_before = loan.cached_outstanding
│   └── savings_balance_before = savings_account.cached_balance
│
├── 6. PROCESS LOAN REPAYMENT (IF loan_amount > 0)
│   ├── INSERT `collection_allocations` { type: 'loan', amount: loan_amount, loan_id, loan_installment_id }
│   ├── Calculate: new_installment_paid = current_installment_paid + loan_amount
│   ├── Set installment status:
│   │   ├── IF new_installment_paid == expected_amount → 'paid', paid_at = now()
│   │   └── IF 0 < new_installment_paid < expected_amount → 'partial'
│   ├── UPDATE `loans` SET:
│   │   ├── cached_outstanding = cached_outstanding - loan_amount
│   │   ├── cached_total_paid = cached_total_paid + loan_amount
│   │   └── status = (cached_outstanding == 0 ? 'completed' : status)
│
├── 7. PROCESS SAVINGS DEPOSIT (IF savings_amount > 0)
│   ├── INSERT `collection_allocations` { type: 'savings', amount: savings_amount, savings_account_id }
│   ├── INSERT `savings_transactions` {
│   │     savings_account_id,
│   │     type: 'deposit',
│   │     amount: savings_amount,
│   │     balance_before: savings_account.cached_balance,
│   │     balance_after: savings_account.cached_balance + savings_amount,
│   │     reference_type: 'collection',
│   │     reference_id: collection.id
│   │   }
│   └── UPDATE `savings_accounts` SET cached_balance = cached_balance + savings_amount
│
├── 8. UPDATE COLLECTION SNAPSHOTS
│   └── UPDATE `collections` SET:
│         loan_balance_after = loan.cached_outstanding,
│         savings_balance_after = savings_account.cached_balance
│
├── 9. WRITE AUDIT LOG
│   └── INSERT `audit_logs` { action: 'collection.created', entity_type: 'Collection', entity_id }
│
├── 10. COMMIT
│
└── 11. RETURN CollectionResult (Digital Receipt Data)
```
