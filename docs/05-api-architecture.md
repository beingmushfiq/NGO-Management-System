# 05 — API Architecture & Contracts

## 1. REST / Client Endpoint Specifications

### Authentication
- `POST /api/auth/login`: Authenticates user credentials or demo role.
- `POST /api/auth/logout`: Clears session token.

### Customers
- `GET /api/customers`: List customers with filtering by branch, status, search string.
- `POST /api/customers`: Register a new customer profile.
- `GET /api/customers/:id`: Retrieve detailed customer profile including loans, savings accounts, and payment history.

### Loans
- `GET /api/loans`: Portfolio summary and list of loans.
- `POST /api/loans`: Create new loan origination with generated installment schedule.
- `GET /api/loans/:id/schedule`: Get full repayment schedule for a loan.

### Savings
- `GET /api/savings`: Member savings accounts and total vault metrics.
- `POST /api/savings/:id/deposit`: Record standalone deposit.
- `POST /api/savings/:id/withdraw`: Process member withdrawal.

### Combined Collections (Critical Path)
- `POST /api/collections/submit`: Atomically processes dual-account collection:
  ```json
  {
    "customerId": "cu-01",
    "loanId": "ln-01",
    "installmentId": "ins-ln-01-3",
    "savingsAccountId": "sa-01",
    "branchId": "br-01",
    "staffId": "st-02",
    "loanAmount": 1100,
    "savingsAmount": 200,
    "paymentMethod": "cash"
  }
  ```
  Returns generated collection record, updated balances, and receipt metadata.
