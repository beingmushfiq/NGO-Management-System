# 07 — UI/UX Design System & Typography

## 1. Visual Identity & Color Tokens
- **Primary Color**: Deep Professional Teal (`#0f766e` / `#115e59` / `--color-primary-700`) conveying institutional stability and microfinance trustworthiness.
- **Semantic Colors**:
  - Success: `#15803d` (Paid installments, active loans)
  - Warning: `#b45309` (Today's due, pending verification)
  - Destructive: `#b91c1c` (Overdue installments, cancelled loans)
  - Info: `#0369a1` (Completed loans, system logs)
- **Neutral Surfaces**: Warm slate (`#f8fafc` / `#f1f5f9`) for desktop background, pure white (`#ffffff`) for elevated cards, subtle borders (`#e2e8f0`).

## 2. Typography & Bilingual Strategy
- **Font Stack**: `Inter` paired with `Noto Sans Bengali` for bilingual clarity.
- **Financial Numbers**: Tabular figures (`font-variant-numeric: tabular-nums`) ensuring financial columns align precisely without jitter during real-time recalculations.
- **Currency Symbols**: Native `৳` prefixed formatting with full Lacs/Crores conversion support (`formatCurrencyFull`).

## 3. Responsive Patterns
- **Desktop**: Collapsible sidebar, fixed topbar, dense multi-column operational tables.
- **Mobile / Field Tablet**: Responsive card transformations, touch-friendly collection bottom sheets, sticky primary CTAs.
