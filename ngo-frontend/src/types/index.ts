// ============================================================
// AGENT-STORE: All type definitions for the NGO system
// ============================================================

export type UserRole = "admin" | "staff" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId?: string;
  customerId?: string;
  staffCode?: string;
  avatar?: string;
}

export interface Branch {
  id: string;
  name: string;
  nameBn: string;
  address: string;
  managerId: string;
  phone: string;
  createdAt: string;
  status: "active" | "inactive";
}

export interface Staff {
  id: string;
  name: string;
  staffCode: string;
  phone: string;
  email: string;
  branchId: string;
  role: "manager" | "officer" | "collector";
  status: "active" | "inactive";
  joinedAt: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  customerId: string; // CUS-XXXX
  name: string;
  nameBn?: string;
  phone: string;
  alternatePhone?: string;
  nid: string;
  address: string;
  branchId: string;
  staffId: string;
  status: "active" | "inactive" | "blacklisted";
  registeredAt: string;
  avatar?: string;
  occupation?: string;
  guarantorName?: string;
  guarantorPhone?: string;
}

export type LoanStatus = "active" | "completed" | "overdue" | "pending" | "cancelled";
export type InstallmentFrequency = "weekly" | "biweekly" | "monthly";

export interface Installment {
  id: string;
  loanId: string;
  installmentNo: number;
  dueDate: string;
  expected: number;
  paid: number;
  outstanding: number;
  status: "pending" | "paid" | "overdue" | "partial";
  paidAt?: string;
  receiptId?: string;
}

export interface Loan {
  id: string;
  loanId: string; // LN-2026-XXXXX
  customerId: string;
  branchId: string;
  staffId: string;
  principal: number;
  serviceCharge: number;
  totalPayable: number;
  installmentAmount: number;
  frequency: InstallmentFrequency;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  disbursedAt: string;
  outstanding: number;
  totalPaid: number;
  status: LoanStatus;
  purpose?: string;
  installments: Installment[];
}

export interface SavingsTransaction {
  id: string;
  accountId: string;
  type: "deposit" | "withdrawal";
  amount: number;
  balanceAfter: number;
  date: string;
  note: string;
  receiptId?: string;
}

export interface SavingsAccount {
  id: string;
  customerId: string;
  branchId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  monthlyContribution: number;
  openedAt: string;
  lastDepositAt: string;
  transactions: SavingsTransaction[];
}

export type PaymentMethod = "cash" | "mobile_banking" | "bank" | "other";

export interface Collection {
  id: string;
  receiptNo: string; // COL-YYYYMMDD-XXXXX
  customerId: string;
  loanId: string;
  savingsAccountId: string;
  branchId: string;
  staffId: string;
  loanAmount: number;
  savingsAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  loanBalanceBefore: number;
  loanBalanceAfter: number;
  savingsBalanceBefore: number;
  savingsBalanceAfter: number;
  collectedAt: string;
  installmentNo: number;
}

export interface Notification {
  id: string;
  type: "collection" | "overdue" | "new_loan" | "new_customer" | "system" | "alert";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface OrgSettings {
  name: string;
  nameBn: string;
  tagline: string;
  logoUrl?: string;
  primaryColor: string;
  phone: string;
  email: string;
  address: string;
  registrationNo: string;
}

export interface DueItem {
  customer: Customer;
  loan: Loan;
  installment: Installment;
  savingsAccount: SavingsAccount;
  totalDue: number;
}
