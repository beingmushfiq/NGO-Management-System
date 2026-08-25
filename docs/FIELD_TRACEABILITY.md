# FIELD TRACEABILITY MATRIX

This document traces every UI field in the frontend to its exact database column, API response attribute, and transformation pipeline.

---

## 1. Traceability Table

| Frontend Component / Screen | UI Label / Property | Frontend Type Property | API JSON Attribute | MySQL Table & Column | Calculation / Authority |
|---|---|---|---|---|---|
| `DashboardPage` | Total Outstanding | `loan.outstanding` | `active_loan_portfolio` | `loans.cached_outstanding` | `SUM(loans.total_payable_amount - loan allocations)` |
| `DashboardPage` | Total Savings | `account.balance` | `member_savings_vault` | `savings_accounts.cached_balance` | Latest `savings_transactions.balance_after` |
| `DashboardPage` | Today's Collection | `collection.totalAmount` | `today_total_collection` | `collections.total_amount` | `SUM(collections.total_amount WHERE date = today)` |
| `CustomersPage` | Full Name | `customer.name` | `name` | `customers.name` | Direct column |
| `CustomersPage` | বাংলা নাম | `customer.nameBn` | `name_bn` | `customers.name_bn` | Direct column |
| `CustomersPage` | Mobile Number | `customer.phone` | `phone` | `customers.phone` | Direct column |
| `CustomersPage` | National ID | `customer.nid` | `nid` | `customers.nid` | Direct column |
| `CustomersPage` | Branch | `branch.name` | `branch_name` | `branches.name` | Joined via `customers.branch_id` |
| `LoansPage` | Principal | `loan.principal` | `principal_amount` | `loans.principal_amount` | Direct column |
| `LoansPage` | Service Charge | `loan.serviceCharge` | `service_charge_amount` | `loans.service_charge_amount` | `(principal * rate) / 100` |
| `LoansPage` | Total Payable | `loan.totalPayable` | `total_payable_amount` | `loans.total_payable_amount` | `principal + service_charge` |
| `LoansPage` | Weekly Installment | `loan.installmentAmount` | `installment_amount` | `loans.installment_amount` | `total_payable / weeks` |
| `CombinedCollectionModal` | Loan Repayment | `loanAmount` | `loan_amount` | `collection_allocations.amount` | Form input allocated to loan |
| `CombinedCollectionModal` | Savings Deposit | `savingsAmount` | `savings_amount` | `collection_allocations.amount` | Form input allocated to savings |
| `ReceiptView` | Receipt No | `collection.receiptNo` | `receipt_number` | `collections.receipt_number` | Generated sequence `COL-YYYYMMDD-XXXXX` |
| `ReceiptView` | Loan Balance After | `collection.loanBalanceAfter` | `loan_balance_after` | `collections.loan_balance_after` | Snapshot after atomic transaction |
| `ReceiptView` | Savings Balance After | `collection.savingsBalanceAfter` | `savings_balance_after` | `collections.savings_balance_after` | Snapshot after atomic transaction |
| `SavingsPage` | Lifetime Deposited | `account.totalDeposited` | `total_deposited` | Computed | `SUM(savings_transactions WHERE type='deposit')` |
| `SavingsPage` | Lifetime Withdrawn | `account.totalWithdrawn` | `total_withdrawn` | Computed | `SUM(savings_transactions WHERE type='withdrawal')` |
