# FRONTEND API REQUIREMENTS

This document details every endpoint required by the frontend portals, their request contracts, response payloads, and usage locations.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
- **Frontend Consumer**: `LoginPage.tsx`
- **Request Body**:
  ```json
  {
    "phone": "01711-000001",
    "password": "password123",
    "role": "admin"
  }
  ```
- **Response Shape**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "1|sanctum_token_string",
      "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@asha.org",
        "phone": "01711-000001",
        "role": "admin",
        "branch_id": null,
        "customer_id": null
      }
    }
  }
  ```

### `POST /api/v1/auth/logout`
- **Request Headers**: `Authorization: Bearer <token>`
- **Response Shape**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

### `GET /api/v1/auth/me`
- **Request Headers**: `Authorization: Bearer <token>`
- **Response Shape**: Current user object matching frontend `User` interface.

---

## 2. Dashboard Endpoints

### `GET /api/v1/dashboard/summary`
- **Frontend Consumer**: `DashboardPage.tsx`
- **Query Parameters**: `branch_id` (optional, for branch filtering)
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": {
      "today_total_collection": "125500.00",
      "today_loan_collection": "105000.00",
      "today_savings_collection": "20500.00",
      "active_loan_portfolio": "585000.00",
      "active_loans_count": 18,
      "member_savings_vault": "115800.00",
      "active_customers_count": 24,
      "collection_efficiency_rate": 96.4
    }
  }
  ```

### `GET /api/v1/dashboard/trends`
- **Frontend Consumer**: `DashboardPage.tsx` (Recharts Area/Bar charts)
- **Query Parameters**: `range` (`daily` | `weekly` | `monthly` | `yearly` | `custom`), `days` (7, 14, 30), `start_date`, `end_date`, `branch_id`
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "19 Aug",
        "loan": 82000.00,
        "savings": 14000.00,
        "total": 96000.00,
        "rate": 93
      }
    ]
  }
  ```

---

## 3. Customer Endpoints

### `GET /api/v1/customers`
- **Frontend Consumer**: `CustomersPage.tsx`
- **Query Parameters**: `search`, `branch_id`, `status`, `page`, `per_page`
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "customer_id": "CUS-1024",
        "name": "Rahim Ahmed",
        "name_bn": "রহিম আহমেদ",
        "phone": "01712-345678",
        "nid": "19882691234567",
        "address": "House 12, Road 4, Mirpur-10, Dhaka",
        "branch_id": 1,
        "branch_name": "Mirpur Branch",
        "staff_id": 2,
        "staff_name": "Farhana Akter",
        "status": "active",
        "occupation": "Small Business / ক্ষুদ্র ব্যবসা",
        "loan_outstanding": "42500.00",
        "savings_balance": "8750.00",
        "registered_at": "2024-01-15T00:00:00.000000Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "total": 24,
      "per_page": 15
    }
  }
  ```

### `POST /api/v1/customers`
- **Frontend Consumer**: `CustomersPage.tsx` (Add Member Modal)
- **Request Body**:
  ```json
  {
    "name": "Rahim Ahmed",
    "name_bn": "রহিম আহমেদ",
    "phone": "01712345678",
    "nid": "19882691234567",
    "address": "House 12, Road 4, Mirpur",
    "branch_id": 1,
    "staff_id": 2,
    "occupation": "Small Business"
  }
  ```

### `GET /api/v1/customers/{id}`
- **Frontend Consumer**: `CustomerDetailPage.tsx`
- **Response Shape**: Single customer profile including relationships with active loans, savings accounts, and collections.

---

## 4. Loan Endpoints

### `GET /api/v1/loans`
- **Frontend Consumer**: `LoansPage.tsx`
- **Query Parameters**: `search`, `status`, `branch_id`, `page`
- **Response Shape**: Array of loans with customer details, principal, service charge, total payable, installment amount, outstanding, total paid, and status.

### `POST /api/v1/loans`
- **Frontend Consumer**: `LoansPage.tsx` (Create Loan Wizard)
- **Request Body**:
  ```json
  {
    "customer_id": 1,
    "principal_amount": "30000.00",
    "service_charge_rate": 10.0,
    "duration_weeks": 50,
    "start_date": "2026-08-25",
    "purpose": "Grocery Shop Investment / মুদির দোকান বিনিয়োগ"
  }
  ```

### `GET /api/v1/loans/{id}/schedule`
- **Frontend Consumer**: `LoansPage.tsx` (Schedule Drawer), `CustomerLoanPage.tsx`
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": {
      "loan_id": 1,
      "loan_number": "LN-2026-000452",
      "total_payable": "33000.00",
      "total_paid": "6600.00",
      "outstanding": "26400.00",
      "installments": [
        {
          "id": 1,
          "installment_number": 1,
          "due_date": "2026-09-01",
          "expected_amount": "660.00",
          "paid_amount": "660.00",
          "remaining_amount": "0.00",
          "status": "paid",
          "paid_at": "2026-09-01T10:30:00Z"
        }
      ]
    }
  }
  ```

---

## 5. Due Queue Endpoint

### `GET /api/v1/installments/due`
- **Frontend Consumer**: `DuePage.tsx`, `DashboardPage.tsx`, `StaffDuePage.tsx`
- **Query Parameters**: `branch_id`, `date` (defaults to today), `search`
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": [
      {
        "customer": {
          "id": 1,
          "customer_id": "CUS-1024",
          "name": "Rahim Ahmed",
          "phone": "01712-345678"
        },
        "loan": {
          "id": 1,
          "loan_number": "LN-2026-000452",
          "installment_amount": "1100.00"
        },
        "installment": {
          "id": 12,
          "installment_number": 12,
          "due_date": "2026-08-25",
          "expected_amount": "1100.00",
          "remaining_amount": "1100.00",
          "status": "pending"
        },
        "savings_account": {
          "id": 1,
          "weekly_target": "200.00",
          "balance": "8750.00"
        },
        "total_due": "1300.00"
      }
    ]
  }
  ```

---

## 6. Collection & Receipt Endpoints (The Critical Financial Path)

### `POST /api/v1/collections`
- **Frontend Consumer**: `CombinedCollectionModal.tsx`
- **Request Body**:
  ```json
  {
    "customer_id": 1,
    "loan_id": 1,
    "installment_id": 12,
    "loan_amount": "1100.00",
    "savings_amount": "200.00",
    "payment_method": "cash",
    "payment_reference": null,
    "collection_date": "2026-08-25",
    "idempotency_key": "4f9d2a8b-7c1e-4390-b3fa-99281a8e1024"
  }
  ```
- **Response Shape**:
  ```json
  {
    "success": true,
    "message": "Collection recorded successfully.",
    "data": {
      "id": 108,
      "receipt_number": "COL-20260825-000124",
      "customer_id": 1,
      "customer_name": "Rahim Ahmed",
      "customer_code": "CUS-1024",
      "branch_id": 1,
      "branch_name": "Mirpur Branch",
      "staff_id": 2,
      "staff_name": "Farhana Akter",
      "loan_amount": "1100.00",
      "savings_amount": "200.00",
      "total_amount": "1300.00",
      "payment_method": "cash",
      "loan_balance_before": "42500.00",
      "loan_balance_after": "41400.00",
      "savings_balance_before": "8750.00",
      "savings_balance_after": "8950.00",
      "installment_number": 12,
      "collected_at": "2026-08-25T14:32:00Z"
    }
  }
  ```

### `GET /api/v1/collections/{id}/receipt`
- **Frontend Consumer**: `ReceiptView.tsx`
- **Response Shape**: Complete receipt representation with organization branding, customer details, breakdown table, balances before/after, and digital verification seal.

---

## 7. Savings Endpoints

### `GET /api/v1/savings`
- **Frontend Consumer**: `SavingsPage.tsx`
- **Query Parameters**: `search`, `branch_id`, `page`

### `POST /api/v1/savings/{id}/deposit`
- **Frontend Consumer**: `SavingsPage.tsx` (Direct Deposit Modal)
- **Request Body**:
  ```json
  {
    "amount": "500.00",
    "note": "Counter Deposit / কাউন্টারে সঞ্চয় জমা"
  }
  ```

### `POST /api/v1/savings/{id}/withdraw`
- **Frontend Consumer**: `SavingsPage.tsx` (Withdrawal Modal)
- **Request Body**:
  ```json
  {
    "amount": "1000.00",
    "note": "Emergency Medical Expense"
  }
  ```

---

## 8. Branch, Staff, and Report Endpoints

- `GET /api/v1/branches`, `POST /api/v1/branches`
- `GET /api/v1/staff`, `POST /api/v1/staff`
- `GET /api/v1/reports/daily-collection`
- `GET /api/v1/reports/loan-portfolio`
- `GET /api/v1/reports/savings`
- `GET /api/v1/reports/branch-audit`
- `GET /api/v1/settings`, `PUT /api/v1/settings`
