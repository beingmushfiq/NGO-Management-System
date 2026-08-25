# 08 — Business Workflows & Execution Cycles

## 1. The Signature Combined Collection Workflow

```text
Field Officer Opens "Today's Due"
               │
               ▼
Clicks "Collect" on Customer (e.g. Rahim Ahmed)
               │
               ▼
Combined Collection Modal Opens (Prefilled)
 ├── Loan Installment Amount: ৳1,100 (Editable)
 └── Savings Contribution:   ৳200   (Editable)
               │
               ▼
Live Reactive Allocation Preview Updates
 ├── Visual split: ৳1,300 Total
 ├── Loan Account: ৳1,100 applied -> Outstanding decreases from ৳42,500 to ৳41,400
 └── Savings Account: ৳200 deposited -> Balance increases from ৳8,750 to ৳8,950
               │
               ▼
Submit Collection Button Clicked
 ├── Multi-store transactional mutation
 ├── Receipt COL-20260825-XXXXX generated
 ├── Audit notification dispatched
 └── Dashboard collection KPI increases
               │
               ▼
Thermal Receipt Modal Displayed (Print / Download / Close)
```

## 2. Loan Origination Workflow
1. Select registered customer.
2. Define principal amount, service charge percentage, and duration in weeks.
3. Automatically compute total payable, weekly installment, and full schedule.
4. Confirm disbursement -> Appends new loan to customer and updates branch portfolio.
