// ============================================================
// AGENT-STORE: Complete mock seed data — Bangladesh NGO context
// ============================================================
import type {
  Branch, Staff, Customer, Loan, Installment,
  SavingsAccount, SavingsTransaction, Collection, Notification, OrgSettings
} from "../types";
import { generateId, addWeeks } from "../lib/utils";

// ─── ORG ────────────────────────────────────────────────────
export const defaultOrg: OrgSettings = {
  name: "Asha Foundation",
  nameBn: "আশা ফাউন্ডেশন",
  tagline: "Empowering Communities Through Microfinance",
  primaryColor: "#0f766e",
  phone: "02-9876543",
  email: "info@ashafoundation.org.bd",
  address: "House 12, Road 4, Dhanmondi, Dhaka-1205",
  registrationNo: "S-11745/Dhaka",
};

// ─── BRANCHES ────────────────────────────────────────────────
export const BRANCHES: Branch[] = [
  { id: "br-01", name: "Dhaka Central", nameBn: "ঢাকা সেন্ট্রাল", address: "Motijheel, Dhaka", managerId: "st-01", phone: "02-9123456", createdAt: "2020-01-15", status: "active" },
  { id: "br-02", name: "Mirpur", nameBn: "মিরপুর", address: "Mirpur-10, Dhaka", managerId: "st-03", phone: "02-9234567", createdAt: "2020-03-10", status: "active" },
  { id: "br-03", name: "Uttara", nameBn: "উত্তরা", address: "Sector 7, Uttara, Dhaka", managerId: "st-05", phone: "02-9345678", createdAt: "2021-06-01", status: "active" },
  { id: "br-04", name: "Narayanganj", nameBn: "নারায়ণগঞ্জ", address: "Tanbazar, Narayanganj", managerId: "st-07", phone: "0671-712345", createdAt: "2022-01-20", status: "active" },
];

// ─── STAFF ───────────────────────────────────────────────────
export const STAFF: Staff[] = [
  { id: "st-01", name: "Mizanur Rahman", staffCode: "STF-001", phone: "01711-234567", email: "mizan@asha.org", branchId: "br-01", role: "manager", status: "active", joinedAt: "2020-01-15" },
  { id: "st-02", name: "Farhana Akter", staffCode: "STF-002", phone: "01811-345678", email: "farhana@asha.org", branchId: "br-01", role: "officer", status: "active", joinedAt: "2020-02-01" },
  { id: "st-03", name: "Jahangir Alam", staffCode: "STF-003", phone: "01911-456789", email: "jahangir@asha.org", branchId: "br-02", role: "manager", status: "active", joinedAt: "2020-03-10" },
  { id: "st-04", name: "Shahanara Begum", staffCode: "STF-004", phone: "01611-567890", email: "shahanara@asha.org", branchId: "br-02", role: "collector", status: "active", joinedAt: "2021-01-05" },
  { id: "st-05", name: "Rafiqul Islam", staffCode: "STF-005", phone: "01511-678901", email: "rafiq@asha.org", branchId: "br-03", role: "manager", status: "active", joinedAt: "2021-06-01" },
  { id: "st-06", name: "Lutfunnesa Khatun", staffCode: "STF-006", phone: "01411-789012", email: "lutfun@asha.org", branchId: "br-03", role: "officer", status: "active", joinedAt: "2021-08-15" },
  { id: "st-07", name: "Abul Kalam Azad", staffCode: "STF-007", phone: "01311-890123", email: "azad@asha.org", branchId: "br-04", role: "manager", status: "active", joinedAt: "2022-01-20" },
  { id: "st-08", name: "Nasima Khatun", staffCode: "STF-008", phone: "01711-901234", email: "nasima@asha.org", branchId: "br-04", role: "collector", status: "active", joinedAt: "2022-03-01" },
];

// ─── CUSTOMERS ───────────────────────────────────────────────
export const CUSTOMERS: Customer[] = [
  { id: "cu-01", customerId: "CUS-1024", name: "Rahim Ahmed", nameBn: "রহিম আহমেদ", phone: "01712-345678", nid: "1234567890", address: "Lane 3, Motijheel, Dhaka", branchId: "br-01", staffId: "st-02", status: "active", registeredAt: "2023-03-15", occupation: "Small Trader" },
  { id: "cu-02", customerId: "CUS-1025", name: "Karim Uddin", nameBn: "করিম উদ্দিন", phone: "01812-456789", nid: "2345678901", address: "Mirpur-1, Dhaka", branchId: "br-02", staffId: "st-04", status: "active", registeredAt: "2023-04-10", occupation: "Rickshaw Puller" },
  { id: "cu-03", customerId: "CUS-1026", name: "Salma Akter", nameBn: "সালমা আক্তার", phone: "01912-567890", nid: "3456789012", address: "Sector 11, Uttara, Dhaka", branchId: "br-03", staffId: "st-06", status: "active", registeredAt: "2023-05-20", occupation: "Garments Worker" },
  { id: "cu-04", customerId: "CUS-1027", name: "Nasrin Begum", nameBn: "নাসরিন বেগম", phone: "01612-678901", nid: "4567890123", address: "Tanbazar, Narayanganj", branchId: "br-04", staffId: "st-08", status: "active", registeredAt: "2023-06-05", occupation: "Homemaker" },
  { id: "cu-05", customerId: "CUS-1028", name: "Abdul Matin", nameBn: "আব্দুল মতিন", phone: "01512-789012", nid: "5678901234", address: "Shyamoli, Dhaka", branchId: "br-01", staffId: "st-02", status: "active", registeredAt: "2023-07-12", occupation: "Vegetable Vendor" },
  { id: "cu-06", customerId: "CUS-1029", name: "রোকেয়া খাতুন", nameBn: "রোকেয়া খাতুন", phone: "01412-890123", nid: "6789012345", address: "Mirpur-6, Dhaka", branchId: "br-02", staffId: "st-04", status: "active", registeredAt: "2023-08-01", occupation: "Tailor" },
  { id: "cu-07", customerId: "CUS-1030", name: "Shahidul Islam", nameBn: "শহিদুল ইসলাম", phone: "01312-901234", nid: "7890123456", address: "Sector 3, Uttara, Dhaka", branchId: "br-03", staffId: "st-06", status: "active", registeredAt: "2023-09-14", occupation: "Tea Stall Owner" },
  { id: "cu-08", customerId: "CUS-1031", name: "Mosammat Renu", nameBn: "মোসাম্মত রেনু", phone: "01712-012345", nid: "8901234567", address: "Fatullah, Narayanganj", branchId: "br-04", staffId: "st-08", status: "active", registeredAt: "2023-10-25", occupation: "Poultry Farmer" },
  { id: "cu-09", customerId: "CUS-1032", name: "Fazlur Rahman", nameBn: "ফজলুর রহমান", phone: "01812-123456", nid: "9012345678", address: "Rayer Bazar, Dhaka", branchId: "br-01", staffId: "st-02", status: "active", registeredAt: "2024-01-08", occupation: "Carpenter" },
  { id: "cu-10", customerId: "CUS-1033", name: "Layla Begum", nameBn: "লায়লা বেগম", phone: "01912-234567", nid: "0123456789", address: "Mirpur-10, Dhaka", branchId: "br-02", staffId: "st-04", status: "active", registeredAt: "2024-02-20", occupation: "Bidi Worker" },
  { id: "cu-11", customerId: "CUS-1034", name: "Mokhlesur Rahman", phone: "01612-345678", nid: "1234509876", address: "Azimpur, Dhaka", branchId: "br-01", staffId: "st-02", status: "overdue" as any, registeredAt: "2024-03-10", occupation: "Flower Vendor" },
  { id: "cu-12", customerId: "CUS-1035", name: "Halima Khatun", phone: "01512-456789", nid: "2345610987", address: "Sector 9, Uttara", branchId: "br-03", staffId: "st-06", status: "active", registeredAt: "2024-04-15", occupation: "Grocery Shop Owner" },
];

// ─── HELPER: Build Installments ───────────────────────────────
function buildInstallments(
  loanId: string,
  amount: number,
  count: number,
  startDate: string,
  paidCount: number
): Installment[] {
  const installments: Installment[] = [];
  for (let i = 1; i <= count; i++) {
    const dueDate = addWeeks(startDate, i);
    const isPaid = i <= paidCount;
    const isOverdue = !isPaid && new Date(dueDate) < new Date();
    installments.push({
      id: `ins-${loanId}-${i}`,
      loanId,
      installmentNo: i,
      dueDate,
      expected: amount,
      paid: isPaid ? amount : 0,
      outstanding: isPaid ? 0 : amount,
      status: isPaid ? "paid" : isOverdue ? "overdue" : "pending",
      paidAt: isPaid ? addWeeks(startDate, i) : undefined,
    });
  }
  return installments;
}

// ─── LOANS ───────────────────────────────────────────────────
export const LOANS: Loan[] = [
  {
    id: "ln-01", loanId: "LN-2026-00452", customerId: "cu-01", branchId: "br-01", staffId: "st-02",
    principal: 50000, serviceCharge: 5000, totalPayable: 55000, installmentAmount: 1100,
    frequency: "weekly", durationWeeks: 50, startDate: "2026-01-06", endDate: "2026-12-29",
    disbursedAt: "2026-01-06", outstanding: 42500, totalPaid: 12500, status: "active",
    purpose: "Small business expansion",
    installments: buildInstallments("ln-01", 1100, 50, "2026-01-06", 11),
  },
  {
    id: "ln-02", loanId: "LN-2026-00389", customerId: "cu-02", branchId: "br-02", staffId: "st-04",
    principal: 30000, serviceCharge: 3000, totalPayable: 33000, installmentAmount: 660,
    frequency: "weekly", durationWeeks: 50, startDate: "2025-10-01", endDate: "2026-09-30",
    disbursedAt: "2025-10-01", outstanding: 15840, totalPaid: 17160, status: "active",
    purpose: "Rickshaw repair & maintenance",
    installments: buildInstallments("ln-02", 660, 50, "2025-10-01", 26),
  },
  {
    id: "ln-03", loanId: "LN-2025-00201", customerId: "cu-03", branchId: "br-03", staffId: "st-06",
    principal: 20000, serviceCharge: 2000, totalPayable: 22000, installmentAmount: 440,
    frequency: "weekly", durationWeeks: 50, startDate: "2025-03-15", endDate: "2026-03-15",
    disbursedAt: "2025-03-15", outstanding: 0, totalPaid: 22000, status: "completed",
    purpose: "Sewing machine purchase",
    installments: buildInstallments("ln-03", 440, 50, "2025-03-15", 50),
  },
  {
    id: "ln-04", loanId: "LN-2026-00445", customerId: "cu-04", branchId: "br-04", staffId: "st-08",
    principal: 25000, serviceCharge: 2500, totalPayable: 27500, installmentAmount: 550,
    frequency: "weekly", durationWeeks: 50, startDate: "2026-02-01", endDate: "2027-01-31",
    disbursedAt: "2026-02-01", outstanding: 19800, totalPaid: 7700, status: "active",
    purpose: "Home renovation",
    installments: buildInstallments("ln-04", 550, 50, "2026-02-01", 14),
  },
  {
    id: "ln-05", loanId: "LN-2026-00312", customerId: "cu-05", branchId: "br-01", staffId: "st-02",
    principal: 40000, serviceCharge: 4000, totalPayable: 44000, installmentAmount: 880,
    frequency: "weekly", durationWeeks: 50, startDate: "2025-12-15", endDate: "2026-12-14",
    disbursedAt: "2025-12-15", outstanding: 28160, totalPaid: 15840, status: "active",
    purpose: "Vegetable cart purchase",
    installments: buildInstallments("ln-05", 880, 50, "2025-12-15", 18),
  },
  {
    id: "ln-06", loanId: "LN-2026-00401", customerId: "cu-06", branchId: "br-02", staffId: "st-04",
    principal: 15000, serviceCharge: 1500, totalPayable: 16500, installmentAmount: 330,
    frequency: "weekly", durationWeeks: 50, startDate: "2026-01-20", endDate: "2027-01-19",
    disbursedAt: "2026-01-20", outstanding: 11880, totalPaid: 4620, status: "active",
    purpose: "Sewing materials",
    installments: buildInstallments("ln-06", 330, 50, "2026-01-20", 14),
  },
  {
    id: "ln-07", loanId: "LN-2026-00429", customerId: "cu-07", branchId: "br-03", staffId: "st-06",
    principal: 35000, serviceCharge: 3500, totalPayable: 38500, installmentAmount: 770,
    frequency: "weekly", durationWeeks: 50, startDate: "2026-03-01", endDate: "2027-02-28",
    disbursedAt: "2026-03-01", outstanding: 32340, totalPaid: 6160, status: "active",
    purpose: "Tea stall equipment",
    installments: buildInstallments("ln-07", 770, 50, "2026-03-01", 8),
  },
  {
    id: "ln-08", loanId: "LN-2025-00341", customerId: "cu-11", branchId: "br-01", staffId: "st-02",
    principal: 20000, serviceCharge: 2000, totalPayable: 22000, installmentAmount: 440,
    frequency: "weekly", durationWeeks: 50, startDate: "2025-08-01", endDate: "2026-07-31",
    disbursedAt: "2025-08-01", outstanding: 8800, totalPaid: 13200, status: "overdue",
    purpose: "Flower business",
    installments: buildInstallments("ln-08", 440, 50, "2025-08-01", 30),
  },
];

// ─── SAVINGS ACCOUNTS ──────────────────────────────────────────
function buildSavingsTransactions(accountId: string, weeklyAmt: number, weeks: number): SavingsTransaction[] {
  const txns: SavingsTransaction[] = [];
  let balance = 0;
  for (let i = weeks; i >= 1; i--) {
    balance += weeklyAmt;
    const date = addWeeks("2026-01-06", i - weeks);
    txns.unshift({
      id: `stx-${accountId}-${i}`,
      accountId,
      type: "deposit",
      amount: weeklyAmt,
      balanceAfter: balance,
      date,
      note: "Savings Collection",
    });
  }
  return txns.slice(-20); // Last 20 for display
}

export const SAVINGS_ACCOUNTS: SavingsAccount[] = [
  { id: "sv-01", customerId: "cu-01", branchId: "br-01", balance: 8750, totalDeposited: 8750, totalWithdrawn: 0, monthlyContribution: 800, openedAt: "2023-03-15", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-01", 200, 43) },
  { id: "sv-02", customerId: "cu-02", branchId: "br-02", balance: 5200, totalDeposited: 5200, totalWithdrawn: 0, monthlyContribution: 600, openedAt: "2023-04-10", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-02", 200, 26) },
  { id: "sv-03", customerId: "cu-03", branchId: "br-03", balance: 12400, totalDeposited: 14900, totalWithdrawn: 2500, monthlyContribution: 800, openedAt: "2023-05-20", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-03", 300, 41) },
  { id: "sv-04", customerId: "cu-04", branchId: "br-04", balance: 3850, totalDeposited: 3850, totalWithdrawn: 0, monthlyContribution: 600, openedAt: "2023-06-05", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-04", 275, 14) },
  { id: "sv-05", customerId: "cu-05", branchId: "br-01", balance: 7200, totalDeposited: 8200, totalWithdrawn: 1000, monthlyContribution: 800, openedAt: "2023-07-12", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-05", 200, 36) },
  { id: "sv-06", customerId: "cu-06", branchId: "br-02", balance: 2800, totalDeposited: 2800, totalWithdrawn: 0, monthlyContribution: 600, openedAt: "2023-08-01", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-06", 200, 14) },
  { id: "sv-07", customerId: "cu-07", branchId: "br-03", balance: 1600, totalDeposited: 1600, totalWithdrawn: 0, monthlyContribution: 600, openedAt: "2023-09-14", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-07", 200, 8) },
  { id: "sv-08", customerId: "cu-08", branchId: "br-04", balance: 4500, totalDeposited: 5000, totalWithdrawn: 500, monthlyContribution: 600, openedAt: "2023-10-25", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-08", 250, 18) },
  { id: "sv-09", customerId: "cu-09", branchId: "br-01", balance: 2000, totalDeposited: 2000, totalWithdrawn: 0, monthlyContribution: 600, openedAt: "2024-01-08", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-09", 200, 10) },
  { id: "sv-10", customerId: "cu-10", branchId: "br-02", balance: 1500, totalDeposited: 1500, totalWithdrawn: 0, monthlyContribution: 600, openedAt: "2024-02-20", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-10", 200, 7) },
  { id: "sv-11", customerId: "cu-11", branchId: "br-01", balance: 6000, totalDeposited: 7200, totalWithdrawn: 1200, monthlyContribution: 600, openedAt: "2024-03-10", lastDepositAt: "2026-07-28", transactions: buildSavingsTransactions("sv-11", 200, 30) },
  { id: "sv-12", customerId: "cu-12", branchId: "br-03", balance: 2200, totalDeposited: 2200, totalWithdrawn: 0, monthlyContribution: 600, openedAt: "2024-04-15", lastDepositAt: "2026-08-18", transactions: buildSavingsTransactions("sv-12", 200, 11) },
];

// ─── COLLECTIONS ─────────────────────────────────────────────
export const COLLECTIONS: Collection[] = [
  { id: "co-01", receiptNo: "COL-20260825-00123", customerId: "cu-01", loanId: "ln-01", savingsAccountId: "sv-01", branchId: "br-01", staffId: "st-02", loanAmount: 1100, savingsAmount: 200, totalAmount: 1300, paymentMethod: "cash", loanBalanceBefore: 43600, loanBalanceAfter: 42500, savingsBalanceBefore: 8550, savingsBalanceAfter: 8750, collectedAt: "2026-08-18T10:32:00", installmentNo: 11 },
  { id: "co-02", receiptNo: "COL-20260825-00122", customerId: "cu-02", loanId: "ln-02", savingsAccountId: "sv-02", branchId: "br-02", staffId: "st-04", loanAmount: 660, savingsAmount: 200, totalAmount: 860, paymentMethod: "cash", loanBalanceBefore: 16500, loanBalanceAfter: 15840, savingsBalanceBefore: 5000, savingsBalanceAfter: 5200, collectedAt: "2026-08-18T09:15:00", installmentNo: 26 },
  { id: "co-03", receiptNo: "COL-20260825-00121", customerId: "cu-05", loanId: "ln-05", savingsAccountId: "sv-05", branchId: "br-01", staffId: "st-02", loanAmount: 880, savingsAmount: 200, totalAmount: 1080, paymentMethod: "mobile_banking", paymentReference: "bKash-XY123", loanBalanceBefore: 29040, loanBalanceAfter: 28160, savingsBalanceBefore: 7000, savingsBalanceAfter: 7200, collectedAt: "2026-08-18T11:45:00", installmentNo: 18 },
  { id: "co-04", receiptNo: "COL-20260825-00120", customerId: "cu-04", loanId: "ln-04", savingsAccountId: "sv-04", branchId: "br-04", staffId: "st-08", loanAmount: 550, savingsAmount: 200, totalAmount: 750, paymentMethod: "cash", loanBalanceBefore: 20350, loanBalanceAfter: 19800, savingsBalanceBefore: 3650, savingsBalanceAfter: 3850, collectedAt: "2026-08-18T14:20:00", installmentNo: 14 },
  { id: "co-05", receiptNo: "COL-20260824-00119", customerId: "cu-06", loanId: "ln-06", savingsAccountId: "sv-06", branchId: "br-02", staffId: "st-04", loanAmount: 330, savingsAmount: 200, totalAmount: 530, paymentMethod: "cash", loanBalanceBefore: 12210, loanBalanceAfter: 11880, savingsBalanceBefore: 2600, savingsBalanceAfter: 2800, collectedAt: "2026-08-17T09:00:00", installmentNo: 14 },
  { id: "co-06", receiptNo: "COL-20260824-00118", customerId: "cu-07", loanId: "ln-07", savingsAccountId: "sv-07", branchId: "br-03", staffId: "st-06", loanAmount: 770, savingsAmount: 200, totalAmount: 970, paymentMethod: "cash", loanBalanceBefore: 33110, loanBalanceAfter: 32340, savingsBalanceBefore: 1400, savingsBalanceAfter: 1600, collectedAt: "2026-08-17T10:30:00", installmentNo: 8 },
];

// ─── NOTIFICATIONS ─────────────────────────────────────────────
export const NOTIFICATIONS: Notification[] = [
  { id: "n-01", type: "collection", title: "Collection Recorded", message: "৳1,300 collected from Rahim Ahmed (CUS-1024)", read: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString(), link: "/admin/customers/cu-01" },
  { id: "n-02", type: "overdue", title: "Overdue Alert", message: "Mokhlesur Rahman (CUS-1034) has 2 overdue installments", read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), link: "/admin/customers/cu-11" },
  { id: "n-03", type: "collection", title: "Collection Recorded", message: "৳860 collected from Karim Uddin (CUS-1025)", read: true, createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "n-04", type: "new_loan", title: "New Loan Disbursed", message: "LN-2026-00452 disbursed to Rahim Ahmed — ৳50,000", read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: "n-05", type: "system", title: "Daily Report Ready", message: "Today's collection report for 25 Aug 2026 is ready", read: true, createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), link: "/admin/reports" },
];
