# SYSTEM ARCHITECTURE & INTEGRATION

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph "Presentation Layer (React 19 + TypeScript + Vite)"
        AP[Admin Portal]
        SP[Staff Field Portal]
        CP[Customer Portal]
        ZS[Zustand Local State]
        RQ[TanStack Query]
    end

    subgraph "API Gateway & Security Layer"
        CORS[CORS Middleware]
        SANCTUM[Laravel Sanctum Auth]
        RATELIMIT[Rate Limiting]
        ROLES[Role & Policy Authorization]
    end

    subgraph "Backend Application Services (Laravel 11+)"
        AUTH_SVC[AuthService]
        CUST_SVC[CustomerService]
        LOAN_SVC[LoanService & ScheduleGenerator]
        COLL_SVC[ProcessCollectionService]
        SAV_SVC[SavingsService]
        REP_SVC[ReportService]
        BAL_SVC[LoanBalanceService & SavingsBalanceService]
    end

    subgraph "Database & Storage (MySQL 8.0+ InnoDB)"
        DB_SCHEMA[(Relational Schema)]
        DB_LOCKS[Pessimistic Row Locks]
        DB_TX[ACID Transactions]
    end

    AP & SP & CP --> ZS & RQ
    RQ -->|HTTP / JSON Bearer| CORS
    CORS --> SANCTUM --> RATELIMIT --> ROLES
    ROLES --> AUTH_SVC & CUST_SVC & LOAN_SVC & COLL_SVC & SAV_SVC & REP_SVC
    COLL_SVC --> BAL_SVC
    AUTH_SVC & CUST_SVC & LOAN_SVC & COLL_SVC & SAV_SVC & REP_SVC --> DB_TX
    DB_TX --> DB_LOCKS --> DB_SCHEMA
```

---

## 2. Directory & Namespace Structure

```
ngo-backend/
├── app/
│   ├── DTO/
│   │   ├── CollectionDTO.php
│   │   ├── LoanDisbursementDTO.php
│   │   └── CustomerRegistrationDTO.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           ├── AuthController.php
│   │   │           ├── DashboardController.php
│   │   │           ├── CustomerController.php
│   │   │           ├── LoanController.php
│   │   │           ├── DueController.php
│   │   │           ├── CollectionController.php
│   │   │           ├── SavingsController.php
│   │   │           ├── BranchController.php
│   │   │           ├── StaffController.php
│   │   │           ├── ReportController.php
│   │   │           └── SettingsController.php
│   │   ├── Requests/
│   │   │   ├── StoreCollectionRequest.php
│   │   │   ├── StoreCustomerRequest.php
│   │   │   └── StoreLoanRequest.php
│   │   └── Resources/
│   │       ├── CustomerResource.php
│   │       ├── LoanResource.php
│   │       ├── CollectionResource.php
│   │       └── SavingsAccountResource.php
│   ├── Models/
│   │   ├── Branch.php
│   │   ├── User.php
│   │   ├── Customer.php
│   │   ├── Loan.php
│   │   ├── LoanInstallment.php
│   │   ├── SavingsAccount.php
│   │   ├── SavingsTransaction.php
│   │   ├── Collection.php
│   │   ├── CollectionAllocation.php
│   │   ├── AuditLog.php
│   │   └── OrgSetting.php
│   ├── Policies/
│   │   ├── CustomerPolicy.php
│   │   ├── LoanPolicy.php
│   │   └── CollectionPolicy.php
│   └── Services/
│       ├── ProcessCollectionService.php
│       ├── LoanScheduleGenerator.php
│       ├── LoanBalanceService.php
│       ├── SavingsBalanceService.php
│       └── ReceiptNumberService.php
```
