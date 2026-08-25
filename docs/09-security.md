# 09 — Security & Financial Integrity Controls

## 1. Core Security Guarantees
- **Double-Submission Prevention**: Collection modal disables action buttons and renders an active spinner upon initiation.
- **Ledger Invariance**: Outstanding debt calculations are protected against negative underflow (`Math.max(0, loan.outstanding - amount)`).
- **Role Isolation**: Protected layout checks user role against permitted routes (`admin`, `staff`, `customer`).
- **Audit Logging**: Every collection and disbursement transaction generates an immutable receipt identifier with timestamp and staff metadata.
