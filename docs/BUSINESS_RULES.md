# BUSINESS RULES

This document defines the authoritative domain business rules governing the microfinance operations. These are **what** the system does from an NGO operational perspective, independent of technology.

---

## 1. Loan Origination & Structure

1. **Loan Amount Definition**:
   - **Loan Principal**: The exact capital disbursed to the borrower.
   - **Service Charge**: The institutional operational fee/cost of borrowing calculated on principal.
   - **Total Payable Amount**: `Principal + Service Charge`.
   - **Installment Amount**: `Total Payable Amount / Number of Installments`.

2. **Calculation Formula**:
   - For a standard weekly micro-credit cycle:
     $$\text{Service Charge} = \text{Principal} \times \frac{\text{Rate (\%)}}{100}$$
     $$\text{Total Payable} = \text{Principal} + \text{Service Charge}$$
     $$\text{Weekly Installment} = \left\lfloor \frac{\text{Total Payable}}{\text{Duration (Weeks)}} \right\rfloor$$
   - Any fractional remainder resulting from integer division is absorbed into the **final installment** so that the sum of all installments equals `Total Payable` exactly.

3. **Installment Numbering & Due Dates**:
   - Installment numbering starts at `1` and increments sequentially up to `number_of_installments` (e.g. 1 through 50).
   - The first installment due date is calculated as `start_date + 7 days` for weekly cycles.

---

## 2. Collection & Repayment Rules

1. **Flexible Collection Types (ADR-006)**:
   - **Combined Collection**: Borrower pays both loan installment and weekly savings deposit in one interaction.
   - **Loan-Only Collection**: Borrower pays only the loan installment (`loan_amount > 0`, `savings_amount = 0`).
   - **Savings-Only Deposit**: Member deposits into savings without a loan installment payment (`loan_amount = 0`, `savings_amount > 0`).
   - A collection with both amounts equal to zero is invalid and rejected.

2. **Partial Installment Repayments (ADR-005)**:
   - A borrower may pay less than the scheduled weekly installment amount (e.g. paying ৳700 against an expected ৳1,100).
   - When a partial payment is received:
     - Installment status transitions to `partial`.
     - The remaining balance on that installment (e.g. ৳400) remains due and unpaid.
     - The installment does **not** advance to the next week until the current installment is settled in full (`remaining = 0`).
     - Installment status transitions to `paid` only when cumulative payments equal the expected installment amount.

3. **Overpayment Restrictions**:
   - A single installment allocation cannot exceed the installment's remaining unpaid balance.
   - Total loan payments cannot exceed the loan's `total_payable_amount`.

4. **Loan Completion**:
   - When cumulative loan allocations equal `total_payable_amount` (and outstanding is ৳0.00), the loan status automatically transitions to `completed`.

---

## 3. Savings Account Operations

1. **Single Primary Vault**:
   - Each registered member has exactly one primary active savings account.
2. **Weekly Target Contribution**:
   - Default mandatory weekly contribution is ৳200 (or custom configured monthly contribution).
3. **Withdrawal Limits**:
   - A member cannot withdraw more than their current available ledger balance.
   - No negative savings balances are permitted.
4. **Counter Deposits**:
   - Direct savings deposits may be accepted at the branch counter independent of field collections.

---

## 4. Operational Hours & Timezones

- All financial dates, collection timestamps, and daily reporting cutoff windows operate on **Bangladesh Standard Time (BST, UTC+6)**.
- Collections recorded after 23:59:59 BST are attributed to the subsequent business calendar day.
