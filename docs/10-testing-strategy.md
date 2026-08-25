# 10 — Testing Strategy & QA Plan

## 1. Automated Verification
- **TypeScript Compiler (`tsc -b`)**: Static type soundness, interface compatibility, and null safety.
- **OxLint / ESLint (`oxlint`)**: Syntax validation and dead code elimination.
- **Vite Build Bundle (`vite build`)**: Rollup bundling validation, asset integrity, and chunk optimization.

## 2. Critical User Journey Manual QA Test Matrix
1. **Journey 1 (Admin Overview)**: Login -> Dashboard -> KPIs match sum of loans & savings -> Branch table accurately reflects branch sums.
2. **Journey 2 (Dual Collection)**: Staff Due page -> Click collect -> Verify combined calculation -> Confirm -> Verify receipt details.
3. **Journey 3 (Customer Verification)**: Customer Portal -> Confirm loan outstanding decreased and savings increased.
4. **Journey 4 (Reporting Audit)**: Reports page -> Verify daily collection sheet totals match latest collection.
