# DATABASE DATA DICTIONARY

Detailed reference of all database tables, columns, data types, constraints, and frontend linkages.

---

## 1. Table: `branches`

| Column | Type | Nullable | Default | Description | Frontend Field | Indexes |
|---|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | `branch.id` | PK |
| `code` | `VARCHAR(20)` | No | — | Unique branch code (e.g. BR-01) | `branch.code` | UNIQUE |
| `name` | `VARCHAR(100)` | No | — | English branch name | `branch.name` | — |
| `name_bn` | `VARCHAR(100)` | Yes | NULL | Bengali branch name | `branch.nameBn` | — |
| `address` | `VARCHAR(255)` | No | — | Physical branch location | `branch.address` | — |
| `phone` | `VARCHAR(30)` | No | — | Branch official contact phone | `branch.phone` | — |
| `email` | `VARCHAR(100)` | Yes | NULL | Branch correspondence email | `branch.email` | — |
| `status` | `ENUM('active','inactive')` | No | `'active'` | Operating status | `branch.status` | INDEX |
| `created_at` | `TIMESTAMP` | Yes | NULL | Record creation timestamp | `branch.createdAt` | — |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Record last update timestamp | — | — |

---

## 2. Table: `users`

| Column | Type | Nullable | Default | Description | Frontend Field | Indexes |
|---|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | `user.id`, `staff.id` | PK |
| `name` | `VARCHAR(100)` | No | — | Full user / staff name | `user.name`, `staff.name` | — |
| `email` | `VARCHAR(100)` | Yes | NULL | Login email address | `user.email`, `staff.email` | UNIQUE |
| `phone` | `VARCHAR(30)` | No | — | Primary mobile phone | `user.phone`, `staff.phone` | UNIQUE |
| `password` | `VARCHAR(255)` | No | — | Bcrypt hashed password | — | — |
| `branch_id` | `BIGINT UNSIGNED` | Yes | NULL | FK to `branches.id` | `staff.branchId` | FK, INDEX |
| `role` | `ENUM('admin','staff','customer')` | No | `'staff'` | Primary system role | `user.role` | INDEX |
| `staff_code` | `VARCHAR(20)` | Yes | NULL | Unique staff ID (e.g. STF-001) | `staff.staffCode` | UNIQUE |
| `status` | `ENUM('active','inactive')` | No | `'active'` | Account status | `staff.status` | INDEX |
| `last_login_at` | `TIMESTAMP` | Yes | NULL | Last login time | — | — |
| `created_at` | `TIMESTAMP` | Yes | NULL | Creation timestamp | `staff.joinedAt` | — |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — | — |

---

## 3. Table: `customers`

| Column | Type | Nullable | Default | Description | Frontend Field | Indexes |
|---|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | `customer.id` | PK |
| `customer_code` | `VARCHAR(30)` | No | — | Unique member code (CUS-XXXX) | `customer.customerId` | UNIQUE |
| `name` | `VARCHAR(100)` | No | — | English member full name | `customer.name` | INDEX |
| `name_bn` | `VARCHAR(100)` | Yes | NULL | Bengali member full name | `customer.nameBn` | — |
| `phone` | `VARCHAR(30)` | No | — | Mobile phone number | `customer.phone` | INDEX |
| `alternate_phone` | `VARCHAR(30)` | Yes | NULL | Secondary emergency phone | `customer.alternatePhone` | — |
| `nid` | `VARCHAR(30)` | No | — | National ID (10/13/17 digits) | `customer.nid` | INDEX |
| `address` | `TEXT` | No | — | Village, Ward, Street address | `customer.address` | — |
| `branch_id` | `BIGINT UNSIGNED` | No | — | FK to `branches.id` | `customer.branchId` | FK, INDEX |
| `staff_id` | `BIGINT UNSIGNED` | No | — | FK to `users.id` (field officer) | `customer.staffId` | FK, INDEX |
| `status` | `ENUM('active','inactive','blacklisted')` | No | `'active'` | Member status | `customer.status` | INDEX |
| `occupation` | `VARCHAR(100)` | Yes | NULL | Primary livelihood | `customer.occupation` | — |
| `emergency_contact` | `VARCHAR(100)` | Yes | NULL | Guarantor or next of kin | `customer.guarantorName` | — |
| `registered_at` | `TIMESTAMP` | No | CURRENT_TIMESTAMP | Registration date | `customer.registeredAt` | INDEX |
| `created_at` | `TIMESTAMP` | Yes | NULL | Creation timestamp | — | — |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — | — |

---

## 4. Table: `loans`

| Column | Type | Nullable | Default | Description | Frontend Field | Indexes |
|---|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | `loan.id` | PK |
| `loan_number` | `VARCHAR(30)` | No | — | Unique contract # (LN-2026-XXXXX) | `loan.loanId` | UNIQUE |
| `customer_id` | `BIGINT UNSIGNED` | No | — | FK to `customers.id` | `loan.customerId` | FK, INDEX |
| `branch_id` | `BIGINT UNSIGNED` | No | — | FK to `branches.id` | `loan.branchId` | FK, INDEX |
| `staff_id` | `BIGINT UNSIGNED` | No | — | FK to `users.id` | `loan.staffId` | FK, INDEX |
| `principal_amount` | `DECIMAL(15,2)` | No | — | Disbursed principal | `loan.principal` | — |
| `service_charge_amount` | `DECIMAL(15,2)` | No | `0.00` | Fixed charge / interest | `loan.serviceCharge` | — |
| `total_payable_amount` | `DECIMAL(15,2)` | No | — | Principal + service charge | `loan.totalPayable` | — |
| `installment_amount` | `DECIMAL(15,2)` | No | — | Base weekly installment | `loan.installmentAmount` | — |
| `number_of_installments` | `INT UNSIGNED` | No | `50` | Total cycle count | `loan.durationWeeks` | — |
| `frequency` | `ENUM('weekly','biweekly','monthly')` | No | `'weekly'` | Repayment frequency | `loan.frequency` | — |
| `start_date` | `DATE` | No | — | Cycle start date | `loan.startDate` | — |
| `end_date` | `DATE` | No | — | Expected maturity date | `loan.endDate` | — |
| `disbursed_at` | `TIMESTAMP` | Yes | NULL | Disbursement timestamp | `loan.disbursedAt` | — |
| `cached_outstanding` | `DECIMAL(15,2)` | No | — | Derived balance cache | `loan.outstanding` | INDEX |
| `cached_total_paid` | `DECIMAL(15,2)` | No | `0.00` | Repayment total cache | `loan.totalPaid` | — |
| `status` | `ENUM('pending','active','completed','overdue','cancelled')` | No | `'pending'` | Current loan status | `loan.status` | INDEX |
| `purpose` | `TEXT` | Yes | NULL | Loan utilization purpose | `loan.purpose` | — |
| `created_by` | `BIGINT UNSIGNED` | Yes | NULL | User who created loan | — | FK |
| `created_at` | `TIMESTAMP` | Yes | NULL | Creation timestamp | — | — |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — | — |

---

## 5. Table: `loan_installments`

| Column | Type | Nullable | Default | Description | Frontend Field | Indexes |
|---|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | `installment.id` | PK |
| `loan_id` | `BIGINT UNSIGNED` | No | — | FK to `loans.id` | `installment.loanId` | FK, INDEX |
| `installment_number` | `INT UNSIGNED` | No | — | Sequence (1..50) | `installment.installmentNo` | — |
| `due_date` | `DATE` | No | — | Scheduled repayment date | `installment.dueDate` | INDEX |
| `expected_amount` | `DECIMAL(15,2)` | No | — | Scheduled amount | `installment.expected` | — |
| `status` | `ENUM('pending','partial','paid','overdue')` | No | `'pending'` | Status cache | `installment.status` | INDEX |
| `paid_at` | `TIMESTAMP` | Yes | NULL | Full settlement time | `installment.paidAt` | — |
| `created_at` | `TIMESTAMP` | Yes | NULL | Creation timestamp | — | — |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — | — |

---

## 6. Table: `savings_accounts`

| Column | Type | Nullable | Default | Description | Frontend Field | Indexes |
|---|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | `savingsAccount.id` | PK |
| `customer_id` | `BIGINT UNSIGNED` | No | — | FK to `customers.id` | `savingsAccount.customerId` | FK, UNIQUE |
| `branch_id` | `BIGINT UNSIGNED` | No | — | FK to `branches.id` | `savingsAccount.branchId` | FK, INDEX |
| `account_number` | `VARCHAR(30)` | No | — | Unique account # (SAV-XXXX) | — | UNIQUE |
| `cached_balance` | `DECIMAL(15,2)` | No | `0.00` | Ledger balance cache | `savingsAccount.balance` | INDEX |
| `monthly_contribution` | `DECIMAL(15,2)` | No | `800.00` | Monthly target (৳200/wk) | `savingsAccount.monthlyContribution` | — |
| `status` | `ENUM('active','closed')` | No | `'active'` | Account status | — | INDEX |
| `opened_at` | `TIMESTAMP` | No | CURRENT_TIMESTAMP | Opening timestamp | `savingsAccount.openedAt` | — |
| `created_at` | `TIMESTAMP` | Yes | NULL | Creation timestamp | — | — |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — | — |

---

## 7. Table: `savings_transactions`

| Column | Type | Nullable | Default | Description | Frontend Field | Indexes |
|---|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | `transaction.id` | PK |
| `savings_account_id` | `BIGINT UNSIGNED` | No | — | FK to `savings_accounts.id` | `transaction.accountId` | FK, INDEX |
| `type` | `ENUM('deposit','withdrawal','adjustment')` | No | — | Transaction direction | `transaction.type` | INDEX |
| `amount` | `DECIMAL(15,2)` | No | — | Transaction amount | `transaction.amount` | — |
| `balance_before` | `DECIMAL(15,2)` | No | — | Account balance prior | — | — |
| `balance_after` | `DECIMAL(15,2)` | No | — | Account balance after | `transaction.balanceAfter` | — |
| `reference_type` | `VARCHAR(50)` | Yes | NULL | `'collection'`, `'counter'`, etc. | — | INDEX |
| `reference_id` | `BIGINT UNSIGNED` | Yes | NULL | FK to collection/receipt | `transaction.receiptId` | INDEX |
| `transaction_date` | `DATE` | No | — | Effective business date | — | INDEX |
| `note` | `TEXT` | Yes | NULL | Transaction remark / note | `transaction.note` | — |
| `created_by` | `BIGINT UNSIGNED` | No | — | User who executed post | — | FK |
| `created_at` | `TIMESTAMP` | Yes | NULL | Creation timestamp | `transaction.date` | INDEX |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — | — |

---

## 8. Table: `collections`

| Column | Type | Nullable | Default | Description | Frontend Field | Indexes |
|---|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | `collection.id` | PK |
| `receipt_number` | `VARCHAR(30)` | No | — | Unique receipt # (COL-YYYYMMDD-XXXXX) | `collection.receiptNo` | UNIQUE |
| `customer_id` | `BIGINT UNSIGNED` | No | — | FK to `customers.id` | `collection.customerId` | FK, INDEX |
| `branch_id` | `BIGINT UNSIGNED` | No | — | FK to `branches.id` | `collection.branchId` | FK, INDEX |
| `staff_id` | `BIGINT UNSIGNED` | No | — | FK to `users.id` (collector) | `collection.staffId` | FK, INDEX |
| `total_amount` | `DECIMAL(15,2)` | No | — | Backend computed sum | `collection.totalAmount` | — |
| `payment_method` | `ENUM('cash','mobile_banking','bank','other')` | No | `'cash'` | Payment method | `collection.paymentMethod` | — |
| `payment_reference` | `VARCHAR(100)` | Yes | NULL | Transaction / check ID | `collection.paymentReference` | — |
| `collection_date` | `DATE` | No | — | Business collection date | — | INDEX |
| `status` | `ENUM('completed','reversed')` | No | `'completed'` | Financial status | — | INDEX |
| `loan_balance_before` | `DECIMAL(15,2)` | Yes | NULL | Snapshot for receipt | `collection.loanBalanceBefore` | — |
| `loan_balance_after` | `DECIMAL(15,2)` | Yes | NULL | Snapshot for receipt | `collection.loanBalanceAfter` | — |
| `savings_balance_before` | `DECIMAL(15,2)` | Yes | NULL | Snapshot for receipt | `collection.savingsBalanceBefore` | — |
| `savings_balance_after` | `DECIMAL(15,2)` | Yes | NULL | Snapshot for receipt | `collection.savingsBalanceAfter` | — |
| `idempotency_key` | `VARCHAR(64)` | Yes | NULL | Unique client UUID | — | UNIQUE |
| `created_at` | `TIMESTAMP` | Yes | NULL | Posting timestamp | `collection.collectedAt` | INDEX |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — | — |

---

## 9. Table: `collection_allocations`

| Column | Type | Nullable | Default | Description | Indexes |
|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | PK |
| `collection_id` | `BIGINT UNSIGNED` | No | — | FK to `collections.id` | FK, INDEX |
| `type` | `ENUM('loan','savings')` | No | — | Allocation target category | INDEX |
| `amount` | `DECIMAL(15,2)` | No | — | Portion allocated | — |
| `loan_id` | `BIGINT UNSIGNED` | Yes | NULL | FK to `loans.id` | FK, INDEX |
| `loan_installment_id` | `BIGINT UNSIGNED` | Yes | NULL | FK to `loan_installments.id` | FK, INDEX |
| `savings_account_id` | `BIGINT UNSIGNED` | Yes | NULL | FK to `savings_accounts.id` | FK, INDEX |
| `created_at` | `TIMESTAMP` | Yes | NULL | Creation timestamp | — |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — |

---

## 10. Table: `audit_logs`

| Column | Type | Nullable | Default | Description | Indexes |
|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | PK |
| `user_id` | `BIGINT UNSIGNED` | Yes | NULL | Actor FK to `users.id` | FK, INDEX |
| `branch_id` | `BIGINT UNSIGNED` | Yes | NULL | Operating branch FK | FK, INDEX |
| `action` | `VARCHAR(100)` | No | — | e.g. `collection.created` | INDEX |
| `entity_type` | `VARCHAR(100)` | No | — | Target Eloquent Model class | INDEX |
| `entity_id` | `BIGINT UNSIGNED` | No | — | Target entity ID | INDEX |
| `old_values` | `JSON` | Yes | NULL | Pre-mutation state snapshot | — |
| `new_values` | `JSON` | Yes | NULL | Post-mutation state snapshot | — |
| `ip_address` | `VARCHAR(45)` | Yes | NULL | Client IP address | — |
| `user_agent` | `TEXT` | Yes | NULL | Client browser / device | — |
| `created_at` | `TIMESTAMP` | Yes | NULL | Timestamp | INDEX |

---

## 11. Table: `org_settings`

| Column | Type | Nullable | Default | Description | Frontend Field |
|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | AUTO_INCREMENT | Internal primary key | — |
| `name` | `VARCHAR(150)` | No | — | Organization name | `org.name` |
| `name_bn` | `VARCHAR(150)` | No | — | বাংলা নাম | `org.nameBn` |
| `tagline` | `VARCHAR(255)` | Yes | NULL | Tagline / motto | `org.tagline` |
| `registration_no` | `VARCHAR(100)` | No | — | MRA license number | `org.registrationNo` |
| `phone` | `VARCHAR(50)` | No | — | Helpline telephone | `org.phone` |
| `email` | `VARCHAR(100)` | No | — | Official email | `org.email` |
| `address` | `TEXT` | No | — | Head office address | `org.address` |
| `primary_color` | `VARCHAR(20)` | No | `'#0f766e'` | Primary brand color hex | `org.primaryColor` |
| `created_at` | `TIMESTAMP` | Yes | NULL | Creation timestamp | — |
| `updated_at` | `TIMESTAMP` | Yes | NULL | Update timestamp | — |
