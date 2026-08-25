# MASTER DEVELOPMENT PROMPT
## NGO Loan & Savings Management System — Premium Client Demo Frontend

You are a **senior product designer, UI/UX architect, frontend engineer, interaction designer, and design-system specialist**.

Build a **fully functional, client-demo-ready frontend** for an **NGO Loan & Savings Management System**.

This is NOT a generic admin dashboard project.

The final product must feel like a **real, professionally designed financial operations platform** that an established NGO could actually use. The interface must be visually distinctive, premium, trustworthy, highly usable, responsive, and polished enough to present directly to a paying client.

---

# 1. PRIMARY OBJECTIVE

Create a complete frontend experience covering:

- Admin Portal
- Staff Portal
- Customer Portal
- Customer Management
- Loan Management
- Installment Scheduling
- Combined Loan + Savings Collection
- Savings Management
- Due Management
- Receipt Management
- Branch Management
- Staff Management
- Collection Monitoring
- Reports

The frontend must be **fully interactive using realistic mock/local data** if an API is unavailable.

Do NOT create static mockup pages.

Every important interaction must work.

---

# 2. DESIGN PHILOSOPHY

## DO NOT BUILD:

- Generic AI SaaS dashboard
- Template-looking sidebar
- Random gradient cards
- Excessive rounded cards
- Giant meaningless charts
- Stock illustrations
- Generic purple/blue AI aesthetic
- Excessive glassmorphism
- Huge empty whitespace
- Dashboard copied from common admin templates
- Fake-looking data
- Decorative UI with no functional purpose

## BUILD:

A sophisticated **NGO financial operations platform** inspired by the best parts of:

- modern fintech products
- professional banking interfaces
- enterprise financial software
- modern operational dashboards
- premium data-heavy business applications

But DO NOT directly copy any existing product.

Create an original visual identity.

The design should communicate:

**Trust + Financial Accuracy + Human Usability + Operational Efficiency + Modern Technology**

---

# 3. UI/UX PRO MAX APPROACH

Before implementation, internally establish a proper design system.

Use the project's available **UI/UX Pro Max methodology/skill** wherever available for:

- visual hierarchy
- typography pairing
- spacing system
- color system
- component design
- responsive behavior
- accessibility
- interaction patterns
- dashboard information architecture
- form UX
- table UX
- empty/loading/error states

Do not blindly follow a template.

Make deliberate design decisions.

Every major screen should have a clear:

**Primary Action → Supporting Information → Secondary Actions → Context**

---

# 4. VISUAL IDENTITY

Create a fresh, premium visual system.

Recommended direction:

### Primary character

Professional + warm + trustworthy.

Avoid making it look like a cryptocurrency platform or flashy startup.

### Color system

Use a restrained financial palette.

Primary:
- Deep professional green/teal or another carefully selected trustworthy primary

Supporting:
- Neutral off-white / warm white
- Deep charcoal
- Soft slate
- Muted green
- Amber
- Red

Use semantic colors:

Green → successful / paid / healthy  
Amber → due / pending / warning  
Red → overdue / failed / critical  
Neutral → informational

Do not use many unrelated accent colors.

### Background

Prefer subtle layered neutrals instead of plain white everywhere.

Example:

- Main background: warm/soft neutral
- Cards: clean white
- Secondary surfaces: slightly tinted neutral
- Borders: extremely subtle
- Dark mode: deep charcoal rather than pure black

---

# 5. TYPOGRAPHY

Typography must feel premium.

Use a professional modern font system supporting:

- English
- Bangla
- Numbers
- Financial values

Use strong hierarchy:

Display → KPI values  
Heading → section titles  
Body → information  
Caption → metadata

Financial numbers should have excellent readability.

Do NOT use excessively bold text everywhere.

---

# 6. LAYOUT SYSTEM

Create a consistent application shell.

Desktop:

```text
┌────────────────────────────────────────────────────┐
│ Topbar / Branch / Search / Notifications / User   │
├────────────┬───────────────────────────────────────┤
│            │                                       │
│ Sidebar    │ Main Content                          │
│            │                                       │
│            │                                       │
└────────────┴───────────────────────────────────────┘
```

But make the sidebar visually refined.

It should not dominate the screen.

Include:

- collapsible navigation
- active state
- contextual sections
- tooltips when collapsed
- responsive mobile drawer

---

# 7. RESPONSIVE DESIGN

This is mandatory.

Support:

- 320px mobile
- 375px
- 390px
- 430px
- tablets
- laptops
- 1366px
- 1440px
- 1920px
- large displays

Do NOT simply shrink desktop.

Mobile should have a deliberately designed workflow.

Especially optimize:

**Customer Search → Due → Collection → Receipt**

for one-handed/mobile operation.

Use:

- bottom sheets
- sticky actions
- mobile navigation
- touch-friendly controls
- horizontal scrolling only when appropriate
- responsive tables
- card transformation where necessary

---

# 8. APPLICATION SHELL

Build:

### Global Topbar

Include:

- Global search
- Branch selector
- Notifications
- Quick collection
- Theme toggle
- User profile

Branch selector:

```text
All Branches
Dhaka Branch
Mirpur Branch
Uttara Branch
...
```

For staff, show their assigned branch context.

---

# 9. ADMIN DASHBOARD

Design a visually impressive but operational dashboard.

Header:

**Good Morning, Admin**

Subtext:

**Here's what is happening across your organization today.**

Primary CTA:

**+ New Collection**

Secondary:

**View Reports**

---

## KPI Area

Use meaningful financial cards:

### Today's Collection
৳125,500

### Loan Collection
৳105,000

### Savings Collection
৳20,500

### Outstanding
৳18.4M

Additional operational metrics:

- Today's Due
- Active Loans
- Active Customers
- Total Savings

Do not make every card identical.

Create subtle visual differentiation.

---

# 10. COLLECTION ANALYTICS

Create a premium chart section.

Title:

**Collection Performance**

Controls:

`7 Days | 30 Days | 3 Months | Custom`

Chart should show:

- Loan Collection
- Savings Collection
- Total Collection

Use elegant interaction:

Hover → contextual tooltip.

Click → drill down if appropriate.

Below chart:

- Total
- Average daily collection
- Highest collection day
- Collection growth

---

# 11. BRANCH PERFORMANCE

Create a visually strong operational comparison.

Columns:

Branch  
Customers  
Active Loans  
Today's Collection  
Savings  
Outstanding  
Collection Rate

Use subtle progress indicators.

Example:

```text
Dhaka Branch
Collection Rate
████████████████░░ 91%
```

Do not turn this into a rainbow dashboard.

---

# 12. TODAY'S DUE

Create a prominent operational section.

Show:

Customer  
Customer ID  
Installment  
Savings  
Total Due  
Due Date  
Status  
Action

Actions:

**Collect**

Clicking Collect must open the **Combined Collection workflow** with customer information prefilled.

---

# 13. RECENT COLLECTIONS

Show:

Receipt No.  
Customer  
Branch  
Staff  
Loan  
Savings  
Total  
Time

Clicking a row opens a transaction detail drawer.

---

# 14. CUSTOMER MANAGEMENT

Create a premium customer management interface.

Header:

**Customers**

Description:

**Manage customer profiles, loans, savings and collection history.**

Primary action:

**+ Add Customer**

Search:

```text
Search name, customer ID or phone...
```

Filters:

- Branch
- Status
- Loan status
- Savings status
- Registration date

---

# 15. CUSTOMER LIST

Do not create a boring CRUD table.

Use:

- meaningful customer avatars/initials
- customer ID
- financial status
- loan indicator
- savings indicator
- due indicator
- contextual actions

Example:

```text
Rahim Ahmed
CUS-1024
017XXXXXXXX

Loan
৳42,500 outstanding

Savings
৳8,950

Due
৳1,300

● Active
```

On mobile, convert rows into intelligent cards.

---

# 16. CUSTOMER PROFILE

This must be one of the best-looking screens.

Hero section:

Customer avatar  
Name  
Customer ID  
Phone  
Branch  
Status  
Registration date

Financial summary:

### Loan Outstanding
৳42,500

### Savings Balance
৳8,950

### Today's Due
৳1,300

### Total Collected
৳67,500

Tabs:

```text
Overview
Loan
Savings
Collections
Documents
```

---

# 17. CUSTOMER OVERVIEW

Include:

- financial snapshot
- current loan
- next installment
- savings balance
- recent transactions
- collection timeline

Create a visual financial journey instead of merely stacking cards.

---

# 18. LOAN MANAGEMENT

Create:

### Loan List

Columns:

Loan ID  
Customer  
Principal  
Payable  
Installment  
Duration  
Paid  
Outstanding  
Status

Statuses:

- Active
- Completed
- Overdue
- Pending
- Cancelled

Use meaningful visual status treatment.

---

# 19. CREATE LOAN

Do NOT use one massive form.

Create a guided multi-step flow.

### Step 1
Select Customer

### Step 2
Loan Details

- Loan Amount
- Interest / Service Charge
- Duration
- Frequency
- Start Date
- First Due Date

### Step 3
Review

Display:

```text
Principal
৳50,000

Service Charge
৳5,000

Total Payable
৳55,000

Duration
50 Weeks

Installment
৳1,100
```

Then show installment schedule preview.

---

# 20. INSTALLMENT SCHEDULE

Create a professional schedule.

Columns:

No.  
Due Date  
Expected  
Paid  
Outstanding  
Status

Use timeline-like visual cues where appropriate.

Allow:

- filter
- search
- overdue filter
- paid filter

---

# 21. ⭐ COMBINED COLLECTION

THIS IS THE MOST IMPORTANT WORKFLOW.

Design it as the signature feature of the system.

The user must immediately understand:

> One payment entry updates two financial accounts.

---

## Collection Screen

Header:

**Collect Payment**

Search/select customer.

Customer card:

```text
Rahim Ahmed
CUS-1024

Loan Outstanding
৳42,500

Savings Balance
৳8,750
```

---

## COLLECTION INPUT

### Loan Installment

Input:

```text
৳1,100
```

Show:

Remaining installment  
Outstanding after payment

### Savings Contribution

Input:

```text
৳200
```

---

## LIVE TOTAL

Create a visually prominent transaction summary:

```text
LOAN INSTALLMENT       ৳1,100
SAVINGS CONTRIBUTION   ৳  200
─────────────────────────────
TOTAL COLLECTION       ৳1,300
```

The total must update instantly.

---

# 22. ACCOUNT ALLOCATION VISUALIZATION

Make the financial flow visually obvious.

```text
                 ৳1,300
                   │
          ┌────────┴────────┐
          ↓                 ↓
      Loan Account      Savings Account
       ৳1,100              ৳200
          │                 │
          ✓                 ✓
```

This is a major visual selling point for the client demo.

---

# 23. PAYMENT METHOD

Options:

- Cash
- Mobile Banking
- Bank
- Other

Allow payment reference where appropriate.

---

# 24. COLLECTION CONFIRMATION

Before submission:

```text
Confirm Collection

Customer
Rahim Ahmed

Loan
৳1,100

Savings
৳200

Total
৳1,300
```

Primary button:

**Collect ৳1,300**

Secondary:

Cancel

Do not allow accidental double submission.

Show processing state.

---

# 25. SUCCESS EXPERIENCE

After successful collection:

Create a polished success state.

```text
✓ Collection Successful

৳1,300

Loan Account
Updated ✓

Savings Account
Updated ✓

Receipt
COL-20260825-00124
```

Actions:

**View Receipt**

**Print Receipt**

**New Collection**

Use subtle motion, not excessive animation.

---

# 26. RECEIPT

Create a professional printable receipt.

It must look like a real NGO financial receipt.

Include:

- NGO logo
- NGO name
- Branch
- Receipt number
- Date/time
- Customer
- Staff
- Loan installment
- Savings contribution
- Total
- Loan balance before/after
- Savings balance before/after
- Payment method
- Signature area
- QR/barcode placeholder if useful

Support:

- Print
- Download
- Reprint

Ensure print CSS is excellent.

---

# 27. DUE LIST

Create:

**Today's Due**

Summary:

- Total Due
- Collected
- Remaining
- Overdue

Filters:

- Branch
- Staff
- Due date
- Status

Each customer should have a prominent:

**Collect**

button.

Clicking it opens a prefilled Combined Collection.

---

# 28. SAVINGS MODULE

Create:

### Savings Overview

Customer balance:

# ৳8,950

Supporting:

Total Deposited  
Total Withdrawn  
Last Deposit  
Monthly Deposit

Then:

### Transaction History

Use a clean financial timeline.

Example:

```text
25 Aug 2026
+ ৳200
Savings Collection
Balance ৳8,950

18 Aug 2026
+ ৳200
Savings Collection
Balance ৳8,750
```

---

# 29. STAFF PORTAL

Staff dashboard should be more operational than analytical.

Primary focus:

### Today's Work

- Today's Due
- Today's Collection
- Customers Served
- Pending Collections

Large primary action:

**+ Collect Payment**

Quick actions:

- Add Customer
- View Due
- Find Customer
- View Collections

Show branch context clearly.

---

# 30. ADMIN BRANCH MANAGEMENT

Create a premium branch management screen.

Each branch can show:

Branch name  
Manager  
Customers  
Active Loans  
Today's Collection  
Savings  
Outstanding  
Collection Rate

Branch detail should provide:

- customer list
- staff
- loans
- collections
- performance

---

# 31. STAFF MANAGEMENT

Include:

- Staff profile
- Staff ID
- Role
- Branch
- Phone
- Status
- Collection performance

Staff detail:

Today's collection  
Monthly collection  
Customers served  
Collections count

---

# 32. REPORTS

Create a professional reporting center.

Report categories:

### Daily Collection

### Loan Report

### Savings Report

### Customer Report

### Branch Report

Each report must support:

- Date range
- Branch
- Staff where applicable
- Search
- Filter
- Export UI
- Print
- Summary metrics

---

# 33. REPORT VISUAL DESIGN

Reports should look like business documents.

Example:

```text
DAILY COLLECTION REPORT
25 August 2026

Total Collection       ৳125,500
Loan Collection        ৳105,000
Savings Collection     ৳20,500

────────────────────────────

Branch Performance
...
```

Provide both:

**Analytics View**

and

**Detailed Table View**

---

# 34. CUSTOMER PORTAL

Create a completely different but related experience.

The customer should see:

### My Financial Overview

Loan Outstanding  
Next Installment  
Savings Balance  
Last Payment

Navigation:

```text
Home
My Loan
Installments
Savings
Payments
Receipts
Profile
```

Keep it simple.

Do not expose unnecessary administrative complexity.

---

# 35. CUSTOMER LOAN PAGE

Hero:

**Current Loan**

৳42,500 Outstanding

Progress:

```text
৳12,500 Paid
██████░░░░░░░░
৳42,500 Remaining
```

Show:

- original amount
- total payable
- installment
- next due
- remaining installments
- schedule

---

# 36. CUSTOMER SAVINGS PAGE

Large balance:

# ৳8,950

Show:

- balance
- monthly contribution
- transaction history
- account information

---

# 37. GLOBAL SEARCH

Implement a powerful search experience.

Search:

- Customer
- Customer ID
- Phone
- Loan ID
- Receipt ID

Use keyboard-friendly interaction.

Example:

```text
Search anything...

Customers
Rahim Ahmed
CUS-1024

Loans
LN-2026-00452

Receipts
COL-001245
```

---

# 38. NOTIFICATIONS

Create meaningful notifications:

- Payment successful
- Collection failed
- Overdue customer
- New loan
- Staff update
- System alert

Use notification center.

---

# 39. LOADING STATES

Every major screen needs polished skeleton states.

Never show blank screens.

---

# 40. EMPTY STATES

Create useful empty states.

Example:

**No collections today**

> Collections recorded today will appear here.

CTA:

**Start Collection**

---

# 41. ERROR STATES

Create professional error experiences.

Examples:

**Something went wrong**

> We couldn't load the collection data.

Actions:

**Retry**

**Go to Dashboard**

---

# 42. NETWORK STATE

If network fails:

Show a subtle but obvious banner:

> Connection lost. Some information may be outdated.

When restored:

> Connection restored ✓

---

# 43. FORM UX

All forms must have:

- inline validation
- clear labels
- helper text
- required indicators
- sensible defaults
- keyboard navigation
- proper error states
- success states

Do not rely solely on toast messages for validation.

---

# 44. MICRO-INTERACTIONS

Use motion intentionally.

Recommended:

- page transitions
- modal transitions
- drawer transitions
- button feedback
- loading indicators
- number count-up
- progress animation
- success animation
- hover states
- row highlighting
- tab transitions

Use **GSAP / Framer Motion** where suitable.

Do NOT over-animate financial data.

Motion should communicate state and hierarchy.

---

# 45. DEMO DATA

Create realistic Bangladesh/NGO-style demo data.

Examples:

Customers:

- Rahim Ahmed
- Karim Uddin
- Salma Akter
- Nasrin Begum
- Abdul Matin

Branches:

- Dhaka Central
- Mirpur
- Uttara
- Narayanganj

Use realistic:

- Bangladeshi phone numbers
- ৳ currency
- customer IDs
- loan IDs
- receipt numbers
- dates
- installment values

Do NOT use meaningless:

`John Doe`, `$10,000`, `Lorem Ipsum`.

---

# 46. BANGLA SUPPORT

The application should be ready for bilingual usage.

Support:

**English + Bangla**

Examples:

`Today's Collection / আজকের আদায়`

`Savings Balance / সঞ্চয়ের ব্যালেন্স`

`Installment Due / কিস্তি বকেয়া`

Do not force Bangla everywhere.

Use bilingual labels strategically where it improves usability.

---

# 47. DATA INTERACTION

Mock data must behave realistically.

Examples:

When collection is submitted:

```text
Loan outstanding decreases
Savings balance increases
Collection history updates
Receipt is generated
Dashboard collection increases
Due status changes
Installment becomes paid
```

When creating a loan:

```text
Customer loan count increases
Outstanding updates
Installment schedule generated
Dashboard metrics update
```

When adding a customer:

```text
Customer list updates
Customer profile becomes accessible
Dashboard customer count updates
```

This is essential for the client demo.

---

# 48. FRONTEND ARCHITECTURE

Use a scalable architecture.

Recommended:

- React
- TypeScript
- Vite or Next.js
- Tailwind CSS
- shadcn/ui or carefully customized equivalent
- React Hook Form
- Zod
- TanStack Query
- Zustand where global client state is needed
- Recharts or another suitable charting library
- Framer Motion / GSAP

Do not install unnecessary libraries.

Keep components reusable.

---

# 49. DESIGN SYSTEM

Create reusable components:

```text
Button
Input
Select
Combobox
DatePicker
Modal
Drawer
Sheet
Tabs
Badge
Tooltip
Toast
Dropdown
DataTable
Pagination
Skeleton
EmptyState
ErrorState
StatCard
ChartCard
FinancialSummary
CustomerCard
LoanCard
CollectionSummary
ReceiptPreview
```

All components must share the same visual language.

---

# 50. FINANCIAL UX SAFETY

Because this is a financial application:

Never make destructive/financial actions ambiguous.

Before important transactions:

- show summary
- show total
- show allocation
- confirm
- prevent duplicate submission
- show processing
- show success/failure

Never silently mutate financial data.

---

# 51. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- appropriate contrast
- aria labels where required
- accessible modals
- focus trapping
- screen-reader-friendly status messages

---

# 52. DARK MODE

Create a polished dark mode.

Do not simply invert colors.

Maintain:

- readable financial values
- proper semantic colors
- subtle borders
- correct contrast
- charts optimized for dark mode

---

# 53. MOBILE COLLECTION UX

On mobile, the collection screen should prioritize:

```text
Customer
   ↓
Loan Installment
   ↓
Savings
   ↓
TOTAL
   ↓
Payment Method
   ↓
COLLECT
```

The CTA should remain easily accessible.

Avoid excessive scrolling.

---

# 54. VISUAL DETAILS THAT MAKE IT FEEL HUMAN-DESIGNED

Pay attention to:

- optical alignment
- consistent spacing
- realistic content
- meaningful hierarchy
- carefully designed empty states
- subtle borders
- excellent table density
- polished hover states
- appropriate icon usage
- intentional whitespace
- consistent corner radius
- refined shadows
- proper responsive transitions

Do not blindly use rounded cards everywhere.

Use cards only when they establish meaningful grouping.

---

# 55. ICONOGRAPHY

Use one consistent icon family.

Prefer:

Lucide or another clean professional icon system.

Do not mix random icon libraries.

Do not use emojis as UI icons.

---

# 56. NO PLACEHOLDER FEEL

Avoid:

```text
Lorem ipsum
Test User
Sample Data
$10,000
Chart goes here
Coming soon
```

Everything visible in the demo should look production-ready.

---

# 57. CLIENT DEMO FLOW

The application must be designed so I can demonstrate the entire business workflow in approximately 5–10 minutes.

Prepare this exact demo journey:

### DEMO 01

Login as Admin

↓

Dashboard

↓

Show today's collection

↓

Open Branch Performance

↓

Open Customers

↓

Open Rahim Ahmed

↓

Show Loan + Savings

---

### DEMO 02

Switch to Staff Portal

↓

Today's Due

↓

Select Rahim Ahmed

↓

Click Collect

↓

Enter:

Loan = ৳1,100

Savings = ৳200

↓

Show automatic total:

**৳1,300**

↓

Show account allocation

↓

Confirm

↓

Show success

↓

Open Receipt

---

### DEMO 03

Return to Customer

↓

Show updated Loan Outstanding

↓

Show updated Savings Balance

↓

Show new Payment History

---

### DEMO 04

Open Reports

↓

Daily Collection

↓

Show updated collection

↓

Filter by branch

↓

Show branch performance

This flow must work flawlessly.

---

# 58. PREMIUM DEMO PRESENTATION

Add subtle premium touches specifically useful for client presentation:

- polished login screen
- professional logo placeholder
- animated application loading screen
- smooth transitions
- realistic notification activity
- realistic financial metrics
- elegant receipt
- polished charts
- responsive mobile preview
- beautiful confirmation states

Do not turn these into gimmicks.

---

# 59. LOGIN EXPERIENCE

Create a premium login screen.

Layout:

Left:

NGO branding / short statement / subtle visual system.

Right:

Login form.

Fields:

Mobile / Email  
Password

Actions:

Login

Remember me

Forgot password

Use a subtle animated visual background or abstract financial pattern.

No stock photo.

---

# 60. GLOBAL UX RULE

Every screen should answer:

1. Where am I?
2. What information am I seeing?
3. What should I do next?
4. What happens if I click this?
5. Did my action succeed?

If the answer is unclear, redesign the screen.

---

# 61. QUALITY BAR

Before considering the project complete, audit every screen for:

### Visual
- Is it premium?
- Is it original?
- Does it feel human-designed?
- Is hierarchy clear?
- Are spacing and typography consistent?

### UX
- Is the workflow obvious?
- Are primary actions obvious?
- Are forms easy?
- Are tables usable?
- Are errors understandable?

### Responsive
- Does mobile feel intentionally designed?
- Does tablet work?
- Does desktop look balanced?
- Does large screen use space properly?

### Functional
- Do buttons work?
- Do forms work?
- Do filters work?
- Does search work?
- Does data update?
- Does collection update loan + savings?
- Does receipt update?
- Do dashboards reflect changes?

---

# 62. FINAL NON-NEGOTIABLE INSTRUCTION

Do NOT stop after creating the dashboard.

Build the **entire connected frontend experience**.

The application must feel like a real working product.

The most important business workflow is:

**Customer → Loan → Installment → Combined Collection → Loan Allocation + Savings Allocation → Automatic Account Update → Receipt → History → Reports**

Everything should visually and functionally support this workflow.

---

# FINAL DESIGN STANDARD

The finished product should make a client think:

> **“This is an actual software product, not an AI-generated prototype.”**

Prioritize:

**Premium visual design**
+
**Exceptional UX**
+
**Realistic financial workflows**
+
**Interactive demo behavior**
+
**Responsive implementation**
+
**Professional information architecture**

Build with restraint, precision and originality.

Do not add features merely to make the application look bigger.

Every component must have a reason to exist.

Every animation must have a purpose.

Every screen must support a real user task.

**Build the product, not the mockup.**