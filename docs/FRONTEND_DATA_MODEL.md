# FRONTEND DATA MODEL

This document maps all TypeScript interfaces from [`ngo-frontend/src/types/index.ts`](file:///d:/NGO%20System/ngo-frontend/src/types/index.ts) to their conceptual backend counterparts.

---

## 1. Core Entity Matrix

| Frontend Entity | Primary Fields | Key Relationships | Backend Entity / Source |
|---|---|---|---|
| `User` | `id`, `name`, `email`, `phone`, `role`, `branchId?`, `customerId?` | Belongs to `Branch` (if staff) or `Customer` (if customer) | `users` table |
| `Branch` | `id`, `name`, `nameBn`, `address`, `managerId`, `phone`, `status`, `createdAt` | Has many `Staff`, `Customers`, `Loans` | `branches` table |
| `Staff` | `id`, `name`, `staffCode`, `phone`, `email`, `branchId`, `role`, `status`, `joinedAt` | Belongs to `Branch`, manages `Customers` & `Collections` | `users` table (with role) |
| `Customer` | `id`, `customerId`, `name`, `nameBn?`, `phone`, `nid`, `address`, `branchId`, `staffId`, `status`, `registeredAt`, `occupation?` | Belongs to `Branch` & `Staff`, owns `Loans` & `SavingsAccount` | `customers` table |
| `Loan` | `id`, `loanId`, `customerId`, `branchId`, `staffId`, `principal`, `serviceCharge`, `totalPayable`, `installmentAmount`, `frequency`, `durationWeeks`, `startDate`, `endDate`, `outstanding`, `totalPaid`, `status`, `purpose?` | Belongs to `Customer`, has many `Installments` & `CollectionAllocations` | `loans` table |
| `Installment` | `id`, `loanId`, `installmentNo`, `dueDate`, `expected`, `paid`, `outstanding`, `status`, `paidAt?`, `receiptId?` | Belongs to `Loan`, receives `CollectionAllocations` | `loan_installments` table |
| `SavingsAccount` | `id`, `customerId`, `branchId`, `balance`, `totalDeposited`, `totalWithdrawn`, `monthlyContribution`, `openedAt`, `lastDepositAt` | Belongs to `Customer` (1-to-1), has many `SavingsTransactions` | `savings_accounts` table |
| `SavingsTransaction` | `id`, `accountId`, `type`, `amount`, `balanceAfter`, `date`, `note`, `receiptId?` | Belongs to `SavingsAccount` | `savings_transactions` table |
| `Collection` | `id`, `receiptNo`, `customerId`, `loanId`, `savingsAccountId`, `branchId`, `staffId`, `loanAmount`, `savingsAmount`, `totalAmount`, `paymentMethod`, `paymentReference?`, `loanBalanceBefore`, `loanBalanceAfter`, `savingsBalanceBefore`, `savingsBalanceAfter`, `collectedAt`, `installmentNo` | Belongs to `Customer`, `Loan`, `SavingsAccount`, has many `CollectionAllocations` | `collections` + `collection_allocations` tables |
| `DueItem` | `customer`, `loan`, `installment`, `savingsAccount`, `totalDue` | Dynamic composite projection for today's recovery queue | Computed by `InstallmentDueService` |
| `OrgSettings` | `name`, `nameBn`, `tagline`, `logoUrl?`, `primaryColor`, `phone`, `email`, `address`, `registrationNo` | Singleton organization configuration | `org_settings` table |

---

## 2. Status Enums & Valid Values

- `UserRole`: `"admin"` | `"staff"` | `"customer"`
- `CustomerStatus`: `"active"` | `"inactive"` | `"blacklisted"`
- `LoanStatus`: `"active"` | `"completed"` | `"overdue"` | `"pending"` | `"cancelled"`
- `InstallmentStatus`: `"pending"` | `"paid"` | `"overdue"` | `"partial"`
- `InstallmentFrequency`: `"weekly"` | `"biweekly"` | `"monthly"`
- `PaymentMethod`: `"cash"` | `"mobile_banking"` | `"bank"` | `"other"`
- `SavingsTransactionType`: `"deposit"` | `"withdrawal"` | `"adjustment"`
- `CollectionStatus`: `"completed"` | `"reversed"`
