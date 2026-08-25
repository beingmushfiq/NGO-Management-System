# INSTITUTIONAL REPORT DEFINITIONS

Detailed formulas and column definitions for the four formal institutional reports in [`ReportsPage.tsx`](file:///d:/NGO%20System/ngo-frontend/src/pages/admin/ReportsPage.tsx).

---

## 1. Daily Collection Sheet (`daily_collection`)
- **Purpose**: Field collection reconciliation and cash-in-hand accounting.
- **Columns**: `Receipt No`, `Customer Name`, `Branch`, `Staff / Collector`, `Loan Installment (BDT)`, `Savings Deposit (BDT)`, `Total Collection (BDT)`, `Payment Method`.
- **Grand Totals**:
  - Total Loan Collections = $\sum \text{Allocations}_{\text{loan}}$
  - Total Savings Collections = $\sum \text{Allocations}_{\text{savings}}$
  - Total Cash Inflow = $\sum \text{Collections}_{\text{total}}$

---

## 2. Loan Portfolio Quality Report (`loan_portfolio`)
- **Purpose**: Portfolio risk assessment and recovery health.
- **Columns**: `Loan ID`, `Borrower`, `Principal`, `Service Charge`, `Total Payable`, `Paid to Date`, `Outstanding Balance`, `Status`.
- **Calculations**:
  - Recovery Rate = $\frac{\sum \text{Total Paid}}{\sum \text{Total Payable}} \times 100\%$

---

## 3. Member Savings Vault Report (`savings_ledger`)
- **Purpose**: Member equity and deposit liability auditing.
- **Columns**: `Account Holder`, `Customer ID`, `Branch`, `Lifetime Deposited`, `Lifetime Withdrawn`, `Current Balance`, `Last Deposit Date`.
- **Formula**:
  - Current Balance = $\sum \text{Deposits} - \sum \text{Withdrawals} \pm \text{Adjustments}$

---

## 4. Branch Performance Matrix (`branch_audit`)
- **Purpose**: Multi-branch operational comparison for head office executive leadership.
- **Columns**: `Branch Name`, `Manager`, `Active Borrowers`, `Loans Disbursed`, `Portfolio Outstanding`, `Savings Balance`, `Recovery Rate`.
