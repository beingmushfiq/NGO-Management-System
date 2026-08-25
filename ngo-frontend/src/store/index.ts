// ============================================================
// AGENT-STORE: All Zustand stores with Live Backend + Demo Fallback
// ============================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User, OrgSettings, Branch, Staff, Customer,
  Loan, Installment, SavingsAccount, SavingsTransaction,
  Collection, Notification, DueItem, PaymentMethod
} from "../types";
import {
  defaultOrg, BRANCHES, STAFF, CUSTOMERS, LOANS,
  SAVINGS_ACCOUNTS, COLLECTIONS, NOTIFICATIONS
} from "../data/seed";
import { generateId, generateReceiptNo, generateLoanId } from "../lib/utils";
import { api, getAuthToken, setAuthToken, clearAuthToken, checkBackendHealth, setApiMode } from "../lib/api";
import { useAuditStore } from "./audit-store";
export * from "./audit-store";
export * from "./permission-store";

// ─── AUTH STORE ───────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLive: boolean;
  backendOnline: boolean;
  checkHealth: () => Promise<boolean>;
  setMode: (mode: "live" | "demo") => void;
  login: (role: "admin" | "staff" | "customer", customerId?: string) => void;
  loginWithCredentials: (phone: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const DEMO_USERS: Record<string, User> = {
  admin: { id: "1", name: "Nurul Islam (Admin)", email: "admin@asha.org", phone: "01711-000001", role: "admin" },
  staff: { id: "2", name: "Kamal Hossain (Officer)", email: "kamal@asha.org", phone: "01711-000002", role: "staff", branchId: "1" },
  customer: { id: "1", name: "Rahima Begum", email: "rahima@gmail.com", phone: "01712-345678", role: "customer", customerId: "CUS-1024" },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: getAuthToken(),
      isAuthenticated: false,
      isLive: true,
      backendOnline: true,

      checkHealth: async () => {
        const isOnline = await checkBackendHealth();
        set({ backendOnline: isOnline });
        return isOnline;
      },

      setMode: (mode: "live" | "demo") => {
        setApiMode(mode);
        set({ isLive: mode === "live" });
      },

      loginWithCredentials: async (phone: string, pass: string) => {
        try {
          const res = await api.auth.login(phone, pass);
          if (res.success && res.data) {
            setAuthToken(res.data.token);
            set({
              user: {
                id: String(res.data.user.id),
                name: res.data.user.name,
                email: res.data.user.email,
                phone: res.data.user.phone,
                role: res.data.user.role,
                branchId: res.data.user.branchId ? String(res.data.user.branchId) : undefined,
                staffCode: res.data.user.staffCode,
              },
              token: res.data.token,
              isAuthenticated: true,
              isLive: true,
              backendOnline: true,
            });
            // Synchronize master data
            syncAllDataFromBackend();
            return { success: true };
          }
          return { success: false, message: res.message || "Invalid credentials." };
        } catch (err: any) {
          // If network error, fallback option
          return { success: false, message: err.message || "Failed to reach backend." };
        }
      },

      login: (role, customerId) => {
        // Quick 1-click launcher: if phone matches standard seeded users, try live first
        const user = role === "customer" && customerId
          ? { ...DEMO_USERS.customer, customerId }
          : DEMO_USERS[role];

        set({ user, isAuthenticated: true });
        // Attempt background live login
        api.auth.login(user.phone, "password123")
          .then((res) => {
            if (res.success && res.data) {
              setAuthToken(res.data.token);
              set({ token: res.data.token, isLive: true, backendOnline: true });
              syncAllDataFromBackend();
            }
          })
          .catch(() => {
            set({ isLive: false, backendOnline: false });
          });
      },

      logout: () => {
        clearAuthToken();
        api.auth.logout().catch(() => {});
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "ngo-auth" }
  )
);

// ─── MASTER BACKEND SYNCHRONIZER ───────────────────────────────
export async function syncAllDataFromBackend() {
  try {
    const branchesRes = await api.branches.list().catch(() => null);
    if (branchesRes?.success && branchesRes.data) {
      useBranchStore.setState({ branches: branchesRes.data });
    }

    const customersRes = await api.customers.list().catch(() => null);
    if (customersRes?.success && customersRes.data) {
      useCustomerStore.setState({ customers: customersRes.data });
    }

    const loansRes = await api.loans.list().catch(() => null);
    if (loansRes?.success && loansRes.data) {
      useLoanStore.setState({ loans: loansRes.data });
    }

    const savingsRes = await api.savings.list().catch(() => null);
    if (savingsRes?.success && savingsRes.data) {
      useSavingsStore.setState({ accounts: savingsRes.data });
    }

    const collectionsRes = await api.collections.list().catch(() => null);
    if (collectionsRes?.success && collectionsRes.data) {
      useCollectionStore.setState({ collections: collectionsRes.data });
    }
  } catch (err) {
    console.warn("Backend sync failed, maintaining local cache:", err);
  }
}

// ─── ORG STORE ────────────────────────────────────────────────
interface OrgState {
  settings: OrgSettings;
  updateSettings: (updates: Partial<OrgSettings>) => Promise<void>;
  fetchSettings: () => Promise<void>;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      settings: defaultOrg,
      fetchSettings: async () => {
        try {
          const res = await api.settings.get();
          if (res.success && res.data) {
            set({ settings: res.data });
          }
        } catch {}
      },
      updateSettings: async (updates) => {
        set((s) => ({ settings: { ...s.settings, ...updates } }));
        try {
          await api.settings.update(updates);
        } catch {}
      },
    }),
    { name: "ngo-org" }
  )
);

// ─── BRANCH STORE ─────────────────────────────────────────────
interface BranchState {
  branches: Branch[];
  selectedBranchId: string | null;
  setSelectedBranch: (id: string | null) => void;
  addBranch: (branch: Omit<Branch, "id">) => Promise<void>;
  updateBranch: (id: string, updates: Partial<Branch>) => Promise<void>;
  fetchBranches: () => Promise<void>;
}

export const useBranchStore = create<BranchState>()((set) => ({
  branches: BRANCHES,
  selectedBranchId: null,
  setSelectedBranch: (id) => set({ selectedBranchId: id }),
  fetchBranches: async () => {
    try {
      const res = await api.branches.list();
      if (res.success && res.data) set({ branches: res.data });
    } catch {}
  },
  addBranch: async (branch) => {
    const tempId = generateId();
    set((s) => ({ branches: [...s.branches, { ...branch, id: tempId }] }));
    try {
      const res = await api.branches.create(branch);
      if (res.success && res.data) {
        set((s) => ({
          branches: s.branches.map((b) => (b.id === tempId ? res.data : b)),
        }));
      }
    } catch {}
  },
  updateBranch: async (id, updates) => {
    set((s) => ({ branches: s.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)) }));
    try {
      await api.branches.update(id, updates);
    } catch {}
  },
}));

// ─── STAFF STORE ─────────────────────────────────────────────
interface StaffState {
  staff: Staff[];
  addStaff: (staff: Omit<Staff, "id">) => Promise<void>;
  updateStaff: (id: string, updates: Partial<Staff>) => Promise<void>;
  fetchStaff: () => Promise<void>;
}

export const useStaffStore = create<StaffState>()((set) => ({
  staff: STAFF,
  fetchStaff: async () => {
    try {
      const res = await api.staff.list();
      if (res.success && res.data) set({ staff: res.data });
    } catch {}
  },
  addStaff: async (staffMember) => {
    const tempId = generateId();
    set((s) => ({ staff: [...s.staff, { ...staffMember, id: tempId }] }));
    try {
      const res = await api.staff.create(staffMember);
      if (res.success && res.data) {
        set((s) => ({ staff: s.staff.map((st) => (st.id === tempId ? res.data : st)) }));
      }
    } catch {}
  },
  updateStaff: async (id, updates) => {
    set((s) => ({ staff: s.staff.map((st) => (st.id === id ? { ...st, ...updates } : st)) }));
    try {
      await api.staff.update(id, updates);
    } catch {}
  },
}));

// ─── CUSTOMER STORE ───────────────────────────────────────────
interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "customerId" | "registeredAt">) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  getCustomer: (id: string) => Customer | undefined;
  fetchCustomers: () => Promise<void>;
}

let custCodeCounter = 1036;
export const useCustomerStore = create<CustomerState>()((set, get) => ({
  customers: CUSTOMERS,
  fetchCustomers: async () => {
    try {
      const res = await api.customers.list();
      if (res.success && res.data) set({ customers: res.data });
    } catch {}
  },
  addCustomer: async (customerData) => {
    const newCustomer: Customer = {
      ...customerData,
      id: generateId(),
      customerId: `CUS-${custCodeCounter++}`,
      registeredAt: new Date().toISOString(),
    };
    set((s) => ({ customers: [...s.customers, newCustomer] }));

    try {
      const res = await api.customers.create({
        name: customerData.name,
        name_bn: customerData.nameBn,
        phone: customerData.phone,
        alternate_phone: customerData.alternatePhone,
        nid: customerData.nid,
        address: customerData.address,
        branch_id: customerData.branchId,
        staff_id: customerData.staffId,
        occupation: customerData.occupation,
      });
      if (res.success && res.data) {
        set((s) => ({
          customers: s.customers.map((c) => (c.id === newCustomer.id ? res.data : c)),
        }));
        return res.data;
      }
    } catch {}

    useAuditStore.getState().logActivity({
      action: "MEMBER_REGISTERED",
      actionTitle: "New Member Enrolled",
      actionTitleBn: "নতুন গ্রাহক নিবন্ধন সম্পন্ন",
      actorName: "System Officer",
      actorRole: "staff",
      branchName: "Assigned Branch",
      targetEntity: `Customer: ${customerData.name}`,
      targetId: newCustomer.customerId,
      details: `Enrolled new borrower ${customerData.name} (${customerData.phone}) with verified NID ${customerData.nid}.`,
      status: "success",
    });

    return newCustomer;
  },
  updateCustomer: async (id, updates) => {
    set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
    try {
      await api.customers.update(id, updates);
    } catch {}
  },
  getCustomer: (id) => get().customers.find((c) => String(c.id) === String(id) || c.customerId === id),
}));

// ─── LOAN STORE ───────────────────────────────────────────────
interface LoanState {
  loans: Loan[];
  createLoan: (data: Omit<Loan, "id" | "loanId" | "outstanding" | "totalPaid" | "status" | "installments">) => Promise<Loan>;
  applyInstallment: (loanId: string, installmentId: string, amount: number, receiptId: string) => void;
  getLoansByCustomer: (customerId: string) => Loan[];
  fetchLoans: () => Promise<void>;
}

function buildInstallmentsForNewLoan(loanId: string, amount: number, count: number, startDate: string): Installment[] {
  const installments: Installment[] = [];
  for (let i = 1; i <= count; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + i * 7);
    installments.push({
      id: `ins-${loanId}-${i}`,
      loanId,
      installmentNo: i,
      dueDate: dueDate.toISOString().split("T")[0],
      expected: amount,
      paid: 0,
      outstanding: amount,
      status: "pending",
    });
  }
  return installments;
}

export const useLoanStore = create<LoanState>()((set, get) => ({
  loans: LOANS,
  fetchLoans: async () => {
    try {
      const res = await api.loans.list();
      if (res.success && res.data) set({ loans: res.data });
    } catch {}
  },
  createLoan: async (data) => {
    const id = generateId();
    const loanId = generateLoanId();
    const installments = buildInstallmentsForNewLoan(id, data.installmentAmount, data.durationWeeks, data.startDate);
    const newLoan: Loan = {
      ...data,
      id,
      loanId,
      outstanding: data.totalPayable,
      totalPaid: 0,
      status: "active",
      installments,
    };
    set((s) => ({ loans: [...s.loans, newLoan] }));

    try {
      const res = await api.loans.create({
        customer_id: data.customerId,
        principal_amount: data.principal,
        service_charge_pct: (data.serviceCharge / data.principal) * 100,
        duration_weeks: data.durationWeeks,
        start_date: data.startDate,
        purpose: data.purpose,
      });
      if (res.success && res.data) {
        set((s) => ({
          loans: s.loans.map((l) => (l.id === id ? res.data : l)),
        }));
        return res.data;
      }
    } catch {}

    useAuditStore.getState().logActivity({
      action: "LOAN_DISBURSED",
      actionTitle: "Loan Disbursed",
      actionTitleBn: "ঋণ বিতরণ সম্পন্ন",
      actorName: "Credit Manager",
      actorRole: "admin",
      branchName: "Branch",
      targetEntity: `Loan: ${loanId}`,
      targetId: id,
      amount: data.principal,
      details: `Disbursed ৳${data.principal.toLocaleString()} (Total payable ৳${data.totalPayable.toLocaleString()} across ${data.durationWeeks} weeks). Installment: ৳${data.installmentAmount.toLocaleString()}/wk.`,
      status: "success",
    });

    return newLoan;
  },
  applyInstallment: (loanId, installmentId, amount, receiptId) => {
    set((s) => ({
      loans: s.loans.map((loan) => {
        if (String(loan.id) !== String(loanId) && loan.loanId !== loanId) return loan;
        const updatedInstallments = loan.installments.map((inst) =>
          String(inst.id) === String(installmentId)
            ? { ...inst, paid: amount, outstanding: Math.max(0, inst.expected - amount), status: (amount >= inst.expected ? "paid" : "partial") as any, paidAt: new Date().toISOString(), receiptId }
            : inst
        );
        const newOutstanding = Math.max(0, loan.outstanding - amount);
        const newTotalPaid = loan.totalPaid + amount;
        return {
          ...loan,
          installments: updatedInstallments,
          outstanding: newOutstanding,
          totalPaid: newTotalPaid,
          status: newOutstanding === 0 ? "completed" : loan.status,
        };
      }),
    }));
  },
  getLoansByCustomer: (customerId) => get().loans.filter((l) => String(l.customerId) === String(customerId)),
}));

// ─── SAVINGS STORE ────────────────────────────────────────────
interface SavingsState {
  accounts: SavingsAccount[];
  deposit: (accountId: string, amount: number, receiptId?: string, note?: string) => Promise<void>;
  withdraw: (accountId: string, amount: number, note: string) => Promise<void>;
  getAccountByCustomer: (customerId: string) => SavingsAccount | undefined;
  fetchAccounts: () => Promise<void>;
}

export const useSavingsStore = create<SavingsState>()((set, get) => ({
  accounts: SAVINGS_ACCOUNTS,
  fetchAccounts: async () => {
    try {
      const res = await api.savings.list();
      if (res.success && res.data) set({ accounts: res.data });
    } catch {}
  },
  deposit: async (accountId, amount, receiptId, note) => {
    set((s) => ({
      accounts: s.accounts.map((acc) => {
        if (String(acc.id) !== String(accountId)) return acc;
        const newBalance = Number(acc.balance) + Number(amount);
        const newTransaction: SavingsTransaction = {
          id: generateId(),
          accountId,
          type: "deposit",
          amount: Number(amount),
          balanceAfter: newBalance,
          date: new Date().toISOString(),
          note: note || "Savings Collection",
          receiptId,
        };
        return {
          ...acc,
          balance: newBalance,
          totalDeposited: Number(acc.totalDeposited || 0) + Number(amount),
          lastDepositAt: new Date().toISOString(),
          transactions: [newTransaction, ...(acc.transactions || [])],
        };
      }),
    }));

    try {
      await api.savings.deposit(accountId, amount, note);
    } catch {}
  },
  withdraw: async (accountId, amount, note) => {
    set((s) => ({
      accounts: s.accounts.map((acc) => {
        if (String(acc.id) !== String(accountId)) return acc;
        const newBalance = Math.max(0, Number(acc.balance) - Number(amount));
        const newTransaction: SavingsTransaction = {
          id: generateId(),
          accountId,
          type: "withdrawal",
          amount: Number(amount),
          balanceAfter: newBalance,
          date: new Date().toISOString(),
          note,
        };
        return {
          ...acc,
          balance: newBalance,
          totalWithdrawn: Number(acc.totalWithdrawn || 0) + Number(amount),
          transactions: [newTransaction, ...(acc.transactions || [])],
        };
      }),
    }));

    try {
      await api.savings.withdraw(accountId, amount, note);
    } catch {}
  },
  getAccountByCustomer: (customerId) => get().accounts.find((a) => String(a.customerId) === String(customerId)),
}));

// ─── COLLECTION STORE (Atomic & Fallback) ─────────────────────
interface CollectionState {
  collections: Collection[];
  submitCollection: (params: {
    customerId: string;
    loanId: string;
    installmentId: string;
    savingsAccountId: string;
    branchId: string;
    staffId: string;
    loanAmount: number;
    savingsAmount: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    loanBalanceBefore: number;
    savingsBalanceBefore: number;
    installmentNo: number;
  }) => Promise<Collection>;
  getCollectionsByCustomer: (customerId: string) => Collection[];
  getTodayCollections: () => Collection[];
  fetchCollections: () => Promise<void>;
}

export const useCollectionStore = create<CollectionState>()((set, get) => ({
  collections: COLLECTIONS,
  fetchCollections: async () => {
    try {
      const res = await api.collections.list();
      if (res.success && res.data) set({ collections: res.data });
    } catch {}
  },
  submitCollection: async (params) => {
    const { applyInstallment } = useLoanStore.getState();
    const { deposit } = useSavingsStore.getState();
    const { add: addNotification } = useNotificationStore.getState();

    const receiptNo = generateReceiptNo();
    const id = generateId();

    const newCollection: Collection = {
      id,
      receiptNo,
      customerId: params.customerId,
      loanId: params.loanId,
      savingsAccountId: params.savingsAccountId,
      branchId: params.branchId,
      staffId: params.staffId,
      loanAmount: params.loanAmount,
      savingsAmount: params.savingsAmount,
      totalAmount: params.loanAmount + params.savingsAmount,
      paymentMethod: params.paymentMethod,
      paymentReference: params.paymentReference,
      loanBalanceBefore: params.loanBalanceBefore,
      loanBalanceAfter: params.loanBalanceBefore - params.loanAmount,
      savingsBalanceBefore: params.savingsBalanceBefore,
      savingsBalanceAfter: params.savingsBalanceBefore + params.savingsAmount,
      collectedAt: new Date().toISOString(),
      installmentNo: params.installmentNo,
    };

    // Mutate local state immediately for snappy UI
    if (params.loanAmount > 0 && params.loanId && params.installmentId) {
      applyInstallment(params.loanId, params.installmentId, params.loanAmount, id);
    }
    if (params.savingsAmount > 0 && params.savingsAccountId) {
      deposit(params.savingsAccountId, params.savingsAmount, id);
    }

    const customers = useCustomerStore.getState().customers;
    const customer = customers.find((c) => String(c.id) === String(params.customerId));
    addNotification({
      type: "collection",
      title: "Collection Recorded",
      message: `৳${(params.loanAmount + params.savingsAmount).toLocaleString()} collected from ${customer?.name || "Customer"}`,
      link: `/admin/customers/${params.customerId}`,
    });

    useAuditStore.getState().logActivity({
      action: "COLLECTION_PROCESSED",
      actionTitle: "Combined Collection Processed",
      actionTitleBn: "যৌথ কিস্তি ও সঞ্চয় আদায় সম্পন্ন",
      actorName: "Field Officer",
      actorRole: "staff",
      branchName: "Branch",
      targetEntity: `Customer: ${customer?.name || "Member"}`,
      targetId: params.customerId,
      amount: params.loanAmount + params.savingsAmount,
      details: `Collected ৳${(params.loanAmount + params.savingsAmount).toLocaleString()} (Loan ৳${params.loanAmount.toLocaleString()} + Savings ৳${params.savingsAmount.toLocaleString()}). Receipt #${receiptNo} issued.`,
      status: "success",
    });

    set((s) => ({ collections: [newCollection, ...s.collections] }));

    // Dispatch to Live Laravel API asynchronously
    try {
      const liveRes = await api.collections.create({
        customer_id: params.customerId,
        loan_id: params.loanId,
        installment_id: params.installmentId,
        loan_amount: params.loanAmount,
        savings_amount: params.savingsAmount,
        payment_method: params.paymentMethod,
        payment_reference: params.paymentReference,
        idempotency_key: `FE-${id}-${Date.now()}`,
      });

      if (liveRes.success && liveRes.data) {
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? liveRes.data : c)),
        }));
        return liveRes.data;
      }
    } catch (err) {
      console.warn("Live collection request failed, preserved in local demo ledger:", err);
    }

    return newCollection;
  },
  getCollectionsByCustomer: (customerId) =>
    get().collections.filter((c) => String(c.customerId) === String(customerId)),
  getTodayCollections: () => {
    const today = new Date().toDateString();
    return get().collections.filter(
      (c) => new Date(c.collectedAt).toDateString() === today
    );
  },
}));

// ─── NOTIFICATION STORE ───────────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  add: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: NOTIFICATIONS,
  add: (notification) => {
    set((s) => ({
      notifications: [
        { ...notification, id: generateId(), read: false, createdAt: new Date().toISOString() },
        ...s.notifications,
      ],
    }));
  },
  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
}));

// ─── DUE STORE (computed) ─────────────────────────────────────
export function useDueItems(branchId?: string | null): DueItem[] {
  const customers = useCustomerStore((s) => s.customers);
  const loans = useLoanStore((s) => s.loans);
  const accounts = useSavingsStore((s) => s.accounts);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items: DueItem[] = [];

  for (const loan of loans) {
    if (loan.status !== "active" && loan.status !== "overdue") continue;
    if (branchId && String(loan.branchId) !== String(branchId)) continue;

    if (!loan.installments) continue;

    for (const installment of loan.installments) {
      if (installment.status === "paid") continue;
      const dueDate = new Date(installment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate > today) continue; // only due or overdue

      const customer = customers.find((c) => String(c.id) === String(loan.customerId));
      const account = accounts.find((a) => String(a.customerId) === String(loan.customerId));
      if (!customer || !account) continue;

      items.push({
        customer,
        loan,
        installment,
        savingsAccount: account,
        totalDue: Number(installment.outstanding ?? installment.expected) + Number(account.monthlyContribution ?? 800) / 4,
      });
      break;
    }
  }

  return items;
}
