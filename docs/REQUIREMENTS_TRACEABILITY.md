# REQUIREMENTS TRACEABILITY MATRIX

| Feature Requirement | Database Table(s) | Service / Layer | API Endpoint | Test Name | Frontend Screen | Implementation Status |
|---|---|---|---|---|---|---|
| User Authentication & RBAC | `users`, `personal_access_tokens` | `AuthService` | `POST /api/v1/auth/login` | `test_user_can_login` | `LoginPage.tsx` | Ready for Scaffold |
| Member KYC Registration | `customers`, `savings_accounts` | `CustomerService` | `POST /api/v1/customers` | `test_customer_registration_creates_savings_vault` | `CustomersPage.tsx` | Ready for Scaffold |
| Loan Origination & Schedule | `loans`, `loan_installments` | `LoanScheduleGenerator` | `POST /api/v1/loans` | `test_loan_schedule_generation_50_weeks` | `LoansPage.tsx` | Ready for Scaffold |
| Atomic Combined Collection | `collections`, `collection_allocations`, `savings_transactions` | `ProcessCollectionService` | `POST /api/v1/collections` | `test_combined_collection_atomic_settlement` | `CombinedCollectionModal.tsx` | Ready for Scaffold |
| Partial Installment Payment | `collection_allocations`, `loan_installments` | `ProcessCollectionService` | `POST /api/v1/collections` | `test_partial_installment_payment_behavior` | `CombinedCollectionModal.tsx` | Ready for Scaffold |
| Savings-Only Collection | `collection_allocations`, `savings_transactions` | `ProcessCollectionService` | `POST /api/v1/collections` | `test_savings_only_collection` | `CombinedCollectionModal.tsx` | Ready for Scaffold |
| Loan-Only Collection | `collection_allocations`, `loan_installments` | `ProcessCollectionService` | `POST /api/v1/collections` | `test_loan_only_collection` | `CombinedCollectionModal.tsx` | Ready for Scaffold |
| Counter Savings Deposit | `savings_transactions`, `savings_accounts` | `SavingsService` | `POST /api/v1/savings/{id}/deposit` | `test_direct_savings_deposit` | `SavingsPage.tsx` | Ready for Scaffold |
| Member Savings Withdrawal | `savings_transactions`, `savings_accounts` | `SavingsService` | `POST /api/v1/savings/{id}/withdraw` | `test_savings_withdrawal_cannot_exceed_balance` | `SavingsPage.tsx` | Ready for Scaffold |
| Due Installments Recovery Queue | `loan_installments`, `loans`, `customers` | `InstallmentDueService` | `GET /api/v1/installments/due` | `test_due_installments_calculation` | `DuePage.tsx` | Ready for Scaffold |
| Multi-Branch Operations | `branches`, `users` | `BranchService` | `GET /api/v1/branches` | `test_branch_management` | `BranchesPage.tsx` | Ready for Scaffold |
| Field Officer Appoint & Assign | `users`, `branches` | `StaffService` | `POST /api/v1/staff` | `test_staff_appointment` | `StaffPage.tsx` | Ready for Scaffold |
| Institutional Audit Reports | All tables | `ReportService` | `GET /api/v1/reports/*` | `test_daily_collection_report_reconciliation` | `ReportsPage.tsx` | Ready for Scaffold |
| Idempotency Protection | `collections.idempotency_key` | `ProcessCollectionService` | `POST /api/v1/collections` | `test_duplicate_idempotency_key_returns_original` | `CombinedCollectionModal.tsx` | Ready for Scaffold |
| System Identity Settings | `org_settings` | `SettingsService` | `PUT /api/v1/settings` | `test_settings_update` | `SettingsPage.tsx` | Ready for Scaffold |
