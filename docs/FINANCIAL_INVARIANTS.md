# FINANCIAL INVARIANTS

This document specifies the non-negotiable mathematical and state invariants of the system. **Every invariant listed below is covered by a dedicated automated test.**

---

## 1. Mathematical Invariants

| ID | Invariant Statement | Verification Method | Automated Test |
|---|---|---|---|
| **FI-01** | Loan outstanding balance **cannot become negative** under any circumstance: $$\text{Outstanding} \ge 0$$ | Constraint check in `ProcessCollectionService` | `test_outstanding_cannot_go_negative()` |
| **FI-02** | Savings account balance **cannot become negative**: $$\text{Savings Balance} \ge 0$$ | Withdrawal validation check | `test_savings_balance_cannot_go_negative()` |
| **FI-03** | Collection total must equal the exact sum of its allocations: $$\text{total\_amount} = \sum \text{collection\_allocations.amount}$$ | Backend calculation, ignoring frontend submitted total | `test_collection_total_equals_sum_of_allocations()` |
| **FI-04** | A completed collection cannot be silently deleted: $$\text{DELETE FROM collections} \to \text{FORBIDDEN}$$ | Hard delete blocked on completed records | `test_completed_collection_cannot_be_deleted()` |
| **FI-05** | Every loan allocation belongs to **exactly one** collection and references a valid installment | Foreign key + domain validation | `test_loan_allocation_has_exactly_one_collection()` |
| **FI-06** | Every savings transaction belongs to **exactly one** savings account | Foreign key + domain validation | `test_savings_transaction_has_one_account()` |
| **FI-07** | Every installment payment is **traceable to a collection** via `collection_allocations` | Audit query linkage | `test_installment_payment_traceable_to_collection()` |
| **FI-08** | A rolled-back transaction leaves **zero financial side effects** across all tables | Rollback test injecting simulated exception | `test_failed_collection_leaves_no_side_effects()` |
| **FI-09** | Cached loan outstanding matches derived calculation at all times: $$\text{loan.cached\_outstanding} == \text{LoanBalanceService::getOutstanding(loan)}$$ | Invariant assertion | `test_cache_matches_derived_balance()` |
| **FI-10** | Cached savings balance matches derived transaction calculation at all times: $$\text{account.cached\_balance} == \text{SavingsBalanceService::getBalance(account)}$$ | Invariant assertion | `test_savings_cache_matches_derived_balance()` |
| **FI-11** | Cumulative loan repayments cannot exceed total payable: $$\sum \text{Allocations}_{\text{loan}} \le \text{total\_payable\_amount}$$ | Boundary check in collection service | `test_total_paid_cannot_exceed_total_payable()` |
| **FI-12** | Duplicate idempotency key returns the original collection with zero additional mutations | Idempotency middleware / service check | `test_duplicate_idempotency_key_returns_original()` |
| **FI-13** | Payment on an installment cannot exceed its remaining unpaid expected amount: $$\text{Payment} \le (\text{expected\_amount} - \text{paid\_amount})$$ | Validation check | `test_installment_payment_cannot_exceed_expected()` |
