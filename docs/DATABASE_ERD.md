# DATABASE ENTITY RELATIONSHIP DIAGRAM (ERD)

```mermaid
erDiagram
    BRANCHES {
        bigint id PK
        string code UK
        string name
        string name_bn
        string address
        string phone
        string email
        enum status "active, inactive"
        timestamp created_at
        timestamp updated_at
    }

    USERS {
        bigint id PK
        string name
        string email UK
        string phone UK
        string password
        bigint branch_id FK "nullable for superadmin"
        enum role "admin, staff, customer"
        string staff_code UK "nullable"
        enum status "active, inactive"
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    CUSTOMERS {
        bigint id PK
        string customer_code UK "CUS-XXXX"
        string name
        string name_bn "nullable"
        string phone
        string alternate_phone "nullable"
        string nid
        text address
        bigint branch_id FK
        bigint staff_id FK
        enum status "active, inactive, blacklisted"
        string occupation "nullable"
        string emergency_contact "nullable"
        timestamp registered_at
        timestamp created_at
        timestamp updated_at
    }

    LOANS {
        bigint id PK
        string loan_number UK "LN-YYYY-XXXXX"
        bigint customer_id FK
        bigint branch_id FK
        bigint staff_id FK
        decimal principal_amount
        decimal service_charge_amount
        decimal total_payable_amount
        decimal installment_amount
        int number_of_installments
        enum frequency "weekly, biweekly, monthly"
        date start_date
        date end_date
        timestamp disbursed_at
        decimal cached_outstanding
        decimal cached_total_paid
        enum status "pending, active, completed, overdue, cancelled"
        text purpose "nullable"
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    LOAN_INSTALLMENTS {
        bigint id PK
        bigint loan_id FK
        int installment_number
        date due_date
        decimal expected_amount
        enum status "pending, partial, paid, overdue"
        timestamp paid_at "nullable"
        timestamp created_at
        timestamp updated_at
    }

    SAVINGS_ACCOUNTS {
        bigint id PK
        bigint customer_id FK UK
        bigint branch_id FK
        string account_number UK "SAV-XXXX"
        decimal cached_balance
        decimal monthly_contribution
        enum status "active, closed"
        timestamp opened_at
        timestamp created_at
        timestamp updated_at
    }

    SAVINGS_TRANSACTIONS {
        bigint id PK
        bigint savings_account_id FK
        enum type "deposit, withdrawal, adjustment"
        decimal amount
        decimal balance_before
        decimal balance_after
        string reference_type "nullable"
        bigint reference_id "nullable"
        date transaction_date
        text note "nullable"
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    COLLECTIONS {
        bigint id PK
        string receipt_number UK "COL-YYYYMMDD-XXXXX"
        bigint customer_id FK
        bigint branch_id FK
        bigint staff_id FK
        decimal total_amount
        enum payment_method "cash, mobile_banking, bank, other"
        string payment_reference "nullable"
        date collection_date
        enum status "completed, reversed"
        decimal loan_balance_before
        decimal loan_balance_after
        decimal savings_balance_before
        decimal savings_balance_after
        string idempotency_key UK "nullable"
        timestamp created_at
        timestamp updated_at
    }

    COLLECTION_ALLOCATIONS {
        bigint id PK
        bigint collection_id FK
        enum type "loan, savings"
        decimal amount
        bigint loan_id FK "nullable"
        bigint loan_installment_id FK "nullable"
        bigint savings_account_id FK "nullable"
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_LOGS {
        bigint id PK
        bigint user_id FK "nullable"
        bigint branch_id FK "nullable"
        string action
        string entity_type
        bigint entity_id
        json old_values "nullable"
        json new_values "nullable"
        string ip_address "nullable"
        string user_agent "nullable"
        timestamp created_at
    }

    ORG_SETTINGS {
        bigint id PK
        string name
        string name_bn
        string tagline "nullable"
        string registration_no
        string phone
        string email
        text address
        string primary_color
        timestamp created_at
        timestamp updated_at
    }

    BRANCHES ||--o{ USERS : employs
    BRANCHES ||--o{ CUSTOMERS : serves
    BRANCHES ||--o{ LOANS : originates
    BRANCHES ||--o{ SAVINGS_ACCOUNTS : holds
    BRANCHES ||--o{ COLLECTIONS : receives

    USERS ||--o{ CUSTOMERS : assigned_to
    USERS ||--o{ LOANS : manages
    USERS ||--o{ COLLECTIONS : collects

    CUSTOMERS ||--o{ LOANS : borrows
    CUSTOMERS ||--|| SAVINGS_ACCOUNTS : owns
    CUSTOMERS ||--o{ COLLECTIONS : pays

    LOANS ||--o{ LOAN_INSTALLMENTS : contains
    LOANS ||--o{ COLLECTION_ALLOCATIONS : receives_allocations

    LOAN_INSTALLMENTS ||--o{ COLLECTION_ALLOCATIONS : settles

    SAVINGS_ACCOUNTS ||--o{ SAVINGS_TRANSACTIONS : logs
    SAVINGS_ACCOUNTS ||--o{ COLLECTION_ALLOCATIONS : receives_allocations

    COLLECTIONS ||--o{ COLLECTION_ALLOCATIONS : allocates
```
