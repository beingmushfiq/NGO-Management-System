# 15 — Architecture Decision Records (ADRs)

## ADR-001: Centralized Zustand Store with LocalStorage Persistence
- **Context**: Need a responsive, fully interactive client demo environment where transactions (loans, collections, savings) update across views instantly and survive page refreshes without needing a live backend database.
- **Decision**: Use Zustand with `persist` middleware and interconnected stores.
- **Consequence**: Full offline demo reliability with zero latency and realistic financial consistency.

## ADR-002: Single-Payment Dual-Account Allocation
- **Context**: Microfinance borrowers in Bangladesh typically repay both loan installments and mandatory weekly savings contributions in one transaction to the field collector.
- **Decision**: Model `Collection` as an atomic multi-store operation that updates both `Loan` and `SavingsAccount` ledgers simultaneously.
- **Consequence**: Matches real-world field operations and eliminates manual dual entries.
