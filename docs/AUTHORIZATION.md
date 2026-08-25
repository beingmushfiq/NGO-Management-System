# AUTHORIZATION & MULTI-BRANCH DATA ISOLATION

## 1. Role Definitions

1. **`admin` (Super Administrator / Head Office)**:
   - Global organizational visibility across all branches.
   - Can create branches, appoint staff, disburse loans, and configure organizational parameters.
2. **`staff` (Branch Manager / Field Officer)**:
   - Restricted strictly to customers, loans, and collections in their assigned `branch_id`.
   - Field officers can only record collections for customers assigned to them or their branch.
3. **`customer` (Borrower / Account Holder)**:
   - Self-service read-only access strictly to their own loan schedule, savings ledger, and receipts.

---

## 2. Laravel Policy Implementation

Every Eloquent model is governed by a dedicated Laravel Policy:

- `CustomerPolicy`: Enforces branch containment on `view`, `update`, and `create`.
- `LoanPolicy`: Enforces that field officers cannot approve/disburse loans without manager permissions.
- `CollectionPolicy`: Enforces that staff can only record collections for customers in their assigned branch.
- `SavingsPolicy`: Enforces withdrawal limits and authorized branch access.
