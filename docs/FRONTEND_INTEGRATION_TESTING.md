# FRONTEND INTEGRATION TESTING STRATEGY

This document outlines the validation rules and verification checkpoints required when integrating the React frontend with the Laravel API.

---

## 1. API Contract Verification Checkpoints

1. **Envelope Structure**: All responses must use standard JSON envelopes:
   - Success: `{ "success": true, "message": "...", "data": { ... } }`
   - Validation Error (HTTP 422): `{ "success": false, "message": "Validation failed.", "errors": { ... } }`
   - Business Error (HTTP 400/409): `{ "success": false, "message": "...", "code": "ERROR_CODE" }`
   - Unauthorized (HTTP 401): `{ "success": false, "message": "Unauthenticated." }`
   - Forbidden (HTTP 403): `{ "success": false, "message": "This action is unauthorized." }`

2. **Decimal Serialization**: All currency and financial amounts must be serialized as precision strings (e.g. `"1100.00"`) to avoid JavaScript floating point rounding artifacts.

3. **Date Format Compatibility**:
   - Timestamps: ISO-8601 UTC (`2026-08-25T14:32:00.000000Z`)
   - Calendar Dates: YYYY-MM-DD (`2026-08-25`)

---

## 2. Critical UI State Validation Matrix

| UI Component / Screen | Loading State | Empty State | Validation Error State | Success State |
|---|---|---|---|---|
| `CombinedCollectionModal` | Spinner on Submit button | N/A | Inline amber alert banner with message | Renders `ReceiptView` + Success Toast |
| `CustomersPage` Table | Skeleton loader rows | "No members found matching your search" | Form input red borders + text-rose-500 helper | Member added to table + modal closes |
| `LoansPage` Wizard | Wizard step transitions disabled | "No loans found" | Min/Max boundary alerts | Loan disbursed toast + schedule viewable |
| `SavingsPage` Modals | Button `isLoading` | "No transactions recorded yet" | Overdraw warning banner | Balance updated + ledger updated |
| `DuePage` Queue | Shimmer cards | "All scheduled collections completed" | Error toast | Instant removal of collected item |
