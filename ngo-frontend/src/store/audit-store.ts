import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";

// ─── AUDIT & ACTIVITY TYPES ────────────────────────────────────
export type AuditActionType =
  | "COLLECTION_PROCESSED"
  | "LOAN_DISBURSED"
  | "MEMBER_REGISTERED"
  | "SAVINGS_DEPOSIT"
  | "SAVINGS_WITHDRAWAL"
  | "STAFF_APPOINTED"
  | "BRANCH_CREATED"
  | "SETTINGS_UPDATED"
  | "USER_LOGIN"
  | "ROLE_SWITCHED";

export interface AuditLogEntry {
  id: string;
  action: AuditActionType;
  actionTitle: string;
  actionTitleBn: string;
  actorName: string;
  actorRole: "admin" | "staff" | "customer" | "system";
  branchName: string;
  targetEntity: string;
  targetId: string;
  details: string;
  amount?: number;
  ipAddress?: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  metadata?: Record<string, any>;
}

// ─── ERROR LOG TYPES ──────────────────────────────────────────
export type ErrorSeverity = "CRITICAL" | "API_ERROR" | "NETWORK_OFFLINE" | "VALIDATION" | "WARNING";

export interface ErrorLogEntry {
  id: string;
  severity: ErrorSeverity;
  endpoint?: string;
  statusCode?: number;
  errorCode?: string;
  message: string;
  stackTrace?: string;
  componentName?: string;
  userRole?: string;
  timestamp: string;
  resolved: boolean;
  context?: Record<string, any>;
}

// ─── INITIAL AUDIT SEED DATA ──────────────────────────────────
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    action: "COLLECTION_PROCESSED",
    actionTitle: "Combined Field Collection",
    actionTitleBn: "যৌথ কিস্তি ও সঞ্চয় আদায়",
    actorName: "Kamal Hossain (Officer)",
    actorRole: "staff",
    branchName: "Dhanmondi Main Branch",
    targetEntity: "Customer: Rahima Begum",
    targetId: "CUS-1024",
    details: "Collected ৳750 (Loan installment ৳550 + Weekly savings ৳200). Digital receipt #COL-20260825-00124 issued.",
    amount: 750,
    ipAddress: "103.205.180.45 (Mobile POS)",
    timestamp: "2026-08-25T14:30:00Z",
    status: "success",
  },
  {
    id: "aud-002",
    action: "LOAN_DISBURSED",
    actionTitle: "Weekly Microcredit Disbursed",
    actionTitleBn: "ক্ষুদ্রঋণ বিতরণ সম্পন্ন",
    actorName: "Nurul Islam (Director)",
    actorRole: "admin",
    branchName: "Mirpur Branch",
    targetEntity: "Customer: Jahanara Alam",
    targetId: "CUS-1027",
    details: "Disbursed ৳40,000 principal at 10% declining rate for 50 weeks. Weekly installment: ৳880.",
    amount: 40000,
    ipAddress: "192.168.1.10 (HQ Terminal)",
    timestamp: "2026-08-25T11:15:00Z",
    status: "success",
  },
  {
    id: "aud-003",
    action: "MEMBER_REGISTERED",
    actionTitle: "New Borrower KYC Enrolled",
    actionTitleBn: "নতুন গ্রাহক নিবন্ধন ও কেওয়াইসি",
    actorName: "Kamal Hossain (Officer)",
    actorRole: "staff",
    branchName: "Dhanmondi Main Branch",
    targetEntity: "Customer: Sultana Razia",
    targetId: "CUS-1028",
    details: "Registered with verified Smart NID (19882691234567) and guarantor documentation.",
    ipAddress: "103.205.180.45",
    timestamp: "2026-08-25T09:40:00Z",
    status: "success",
  },
  {
    id: "aud-004",
    action: "SAVINGS_WITHDRAWAL",
    actionTitle: "Member Savings Withdrawal",
    actionTitleBn: "গ্রাহক সঞ্চয় উত্তোলন",
    actorName: "Nurul Islam (Director)",
    actorRole: "admin",
    branchName: "Dhanmondi Main Branch",
    targetEntity: "Customer: Fatema Khatun",
    targetId: "CUS-1025",
    details: "Approved maturity withdrawal of ৳3,500. Account balance debited.",
    amount: 3500,
    ipAddress: "192.168.1.10",
    timestamp: "2026-08-24T16:20:00Z",
    status: "success",
  },
  {
    id: "aud-005",
    action: "SETTINGS_UPDATED",
    actionTitle: "Organization Profile Updated",
    actionTitleBn: "প্রাতিষ্ঠানিক সেটিংস হালনাগাদ",
    actorName: "Nurul Islam (Director)",
    actorRole: "admin",
    branchName: "Head Office",
    targetEntity: "System: Organization Settings",
    targetId: "ORG-01",
    details: "Updated Microcredit Regulatory Authority (MRA) registration details and hotline numbers.",
    ipAddress: "192.168.1.10",
    timestamp: "2026-08-24T10:00:00Z",
    status: "success",
  },
];

// ─── INITIAL ERROR SEED DATA ──────────────────────────────────
const INITIAL_ERROR_LOGS: ErrorLogEntry[] = [
  {
    id: "err-001",
    severity: "API_ERROR",
    endpoint: "POST /api/v1/collections",
    statusCode: 422,
    errorCode: "IDEMPOTENCY_RETRY_DETECTED",
    message: "Collection request with duplicate idempotency key rejected to prevent double billing.",
    stackTrace: "ProcessCollectionService.php:L84 -> IdempotencyCheckMiddleware -> DatabaseLockException",
    componentName: "CombinedCollectionModal",
    userRole: "staff",
    timestamp: "2026-08-25T14:28:10Z",
    resolved: true,
  },
  {
    id: "err-002",
    severity: "WARNING",
    endpoint: "GET /api/v1/installments/due",
    statusCode: 200,
    errorCode: "OFFLINE_CACHE_USED",
    message: "Fetched due installments from IndexedDB local storage during brief field connectivity switch.",
    stackTrace: "api.ts:L78 (request fallback) -> useDueItems hook",
    componentName: "StaffDuePage",
    userRole: "staff",
    timestamp: "2026-08-25T12:05:30Z",
    resolved: true,
  },
];

interface AuditStoreState {
  auditLogs: AuditLogEntry[];
  errorLogs: ErrorLogEntry[];
  isAuditModalOpen: boolean;
  isErrorModalOpen: boolean;
  
  // Actions
  logActivity: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  logError: (entry: Omit<ErrorLogEntry, "id" | "timestamp" | "resolved">) => void;
  markErrorResolved: (id: string) => void;
  clearErrorLogs: () => void;
  openAuditModal: () => void;
  closeAuditModal: () => void;
  openErrorModal: () => void;
  closeErrorModal: () => void;
}

export const useAuditStore = create<AuditStoreState>()(
  persist(
    (set) => ({
      auditLogs: INITIAL_AUDIT_LOGS,
      errorLogs: INITIAL_ERROR_LOGS,
      isAuditModalOpen: false,
      isErrorModalOpen: false,

      logActivity: (entry) => {
        const newLog: AuditLogEntry = {
          ...entry,
          id: `aud-${generateId()}`,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({ auditLogs: [newLog, ...s.auditLogs] }));
      },

      logError: (entry) => {
        const newError: ErrorLogEntry = {
          ...entry,
          id: `err-${generateId()}`,
          timestamp: new Date().toISOString(),
          resolved: false,
        };
        set((s) => ({ errorLogs: [newError, ...s.errorLogs] }));
      },

      markErrorResolved: (id) => {
        set((s) => ({
          errorLogs: s.errorLogs.map((e) => (e.id === id ? { ...e, resolved: true } : e)),
        }));
      },

      clearErrorLogs: () => set({ errorLogs: [] }),

      openAuditModal: () => set({ isAuditModalOpen: true }),
      closeAuditModal: () => set({ isAuditModalOpen: false }),

      openErrorModal: () => set({ isErrorModalOpen: true }),
      closeErrorModal: () => set({ isErrorModalOpen: false }),
    }),
    { name: "ngo-audit-storage" }
  )
);
