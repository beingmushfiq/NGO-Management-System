# API ERROR CODES & EXCEPTIONS SPECIFICATION

All error responses return standard JSON envelopes with machine-readable error codes:

```json
{
  "success": false,
  "message": "Human-readable explanation of error.",
  "code": "SPECIFIC_ERROR_CODE",
  "errors": {}
}
```

---

## 1. Domain Error Code Registry

| HTTP Status | Error Code | Description / Trigger Scenario | Client UI Action |
|---|---|---|---|
| `422` | `VALIDATION_FAILED` | Form request validation failed (e.g. invalid phone, missing required fields) | Highlight form fields in red |
| `401` | `UNAUTHENTICATED` | Missing, expired, or invalid Bearer token | Redirect to `/login` |
| `403` | `UNAUTHORIZED_BRANCH_ACCESS` | Staff attempting to record collection for customer in another branch | Show permission error alert |
| `400` | `INVALID_COLLECTION_AMOUNTS` | Both `loan_amount` and `savings_amount` are 0 or negative | Prompt user to enter valid amount |
| `409` | `INSTALLMENT_ALREADY_PAID` | Installment has already been settled in full by concurrent collector | Refresh due queue |
| `400` | `PAYMENT_EXCEEDS_INSTALLMENT` | Repayment amount exceeds remaining installment balance | Cap input to remaining balance |
| `400` | `PAYMENT_EXCEEDS_LOAN_OUTSTANDING` | Loan repayment exceeds total loan outstanding balance | Cap input to total outstanding |
| `400` | `INSUFFICIENT_SAVINGS_BALANCE` | Requested withdrawal amount exceeds available ledger balance (FI-02) | Display available balance warning |
| `404` | `CUSTOMER_NOT_FOUND` | Customer ID does not exist | Show empty state |
| `404` | `NO_ACTIVE_LOAN` | Loan allocation attempted on customer without active loan | Prompt to disburse loan first |
| `500` | `COLLECTION_PROCESSING_FAILED` | Database transaction rolled back due to unexpected internal exception | Display retry prompt |
