// ============================================================
// Granular Role-Based Access Control (RBAC) & Permission Engine
// ============================================================

export type SystemModule =
  | "customers"
  | "loans"
  | "savings"
  | "collections"
  | "branches"
  | "staff"
  | "reports"
  | "settings"
  | "audit";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve" | "export" | "reverse";

export interface RolePermission {
  module: SystemModule;
  actions: PermissionAction[];
}

export interface CustomRole {
  id: string;
  name: string;
  nameBn?: string;
  description: string;
  isSystemRole?: boolean;
  permissions: RolePermission[];
  createdAt: string;
}

// ─── PRE-CONFIGURED DEFAULT SYSTEM ROLES ─────────────────────
export const DEFAULT_SYSTEM_ROLES: CustomRole[] = [
  {
    id: "role-admin",
    name: "Super Administrator / Executive Director",
    nameBn: "নির্বাহী পরিচালক / প্রধান প্রশাসক",
    description: "Complete unconstrained governance across all financial ledgers, audit trails, and staff appointments.",
    isSystemRole: true,
    createdAt: "2026-01-01T00:00:00Z",
    permissions: [
      { module: "customers", actions: ["view", "create", "edit", "delete"] },
      { module: "loans", actions: ["view", "create", "edit", "delete", "approve"] },
      { module: "savings", actions: ["view", "create", "edit", "delete"] },
      { module: "collections", actions: ["view", "create", "edit", "delete", "reverse"] },
      { module: "branches", actions: ["view", "create", "edit", "delete"] },
      { module: "staff", actions: ["view", "create", "edit", "delete"] },
      { module: "reports", actions: ["view", "export"] },
      { module: "settings", actions: ["view", "edit"] },
      { module: "audit", actions: ["view", "export"] },
    ],
  },
  {
    id: "role-manager",
    name: "Branch Manager",
    nameBn: "শাখা ব্যবস্থাপক",
    description: "Oversees branch credit disbursements, approvals, customer portfolios, and staff monitoring.",
    isSystemRole: true,
    createdAt: "2026-01-01T00:00:00Z",
    permissions: [
      { module: "customers", actions: ["view", "create", "edit"] },
      { module: "loans", actions: ["view", "create", "edit", "approve"] },
      { module: "savings", actions: ["view", "create", "edit"] },
      { module: "collections", actions: ["view", "create", "edit", "reverse"] },
      { module: "branches", actions: ["view"] },
      { module: "staff", actions: ["view"] },
      { module: "reports", actions: ["view", "export"] },
      { module: "settings", actions: ["view"] },
      { module: "audit", actions: ["view"] },
    ],
  },
  {
    id: "role-officer",
    name: "Field Credit Officer",
    nameBn: "মাঠ ঋণ কর্মকর্তা",
    description: "Performs daily route collections, member KYC registrations, and loan applications.",
    isSystemRole: true,
    createdAt: "2026-01-01T00:00:00Z",
    permissions: [
      { module: "customers", actions: ["view", "create", "edit"] },
      { module: "loans", actions: ["view", "create"] },
      { module: "savings", actions: ["view", "create"] },
      { module: "collections", actions: ["view", "create"] },
      { module: "reports", actions: ["view"] },
    ],
  },
  {
    id: "role-cashier",
    name: "Branch Cashier & Accountant",
    nameBn: "শাখা ক্যাশিয়ার ও হিসাবরক্ষক",
    description: "Counter deposits, voluntary savings withdrawals, and daily cash reconciliations.",
    isSystemRole: true,
    createdAt: "2026-01-01T00:00:00Z",
    permissions: [
      { module: "customers", actions: ["view"] },
      { module: "loans", actions: ["view"] },
      { module: "savings", actions: ["view", "create", "edit"] },
      { module: "collections", actions: ["view", "create"] },
      { module: "reports", actions: ["view", "export"] },
    ],
  },
  {
    id: "role-auditor",
    name: "Compliance & MRA Auditor",
    nameBn: "কমপ্লায়েন্স ও নিরীক্ষক",
    description: "Read-only access to all institutional ledgers, audit trails, and regulatory export reports.",
    isSystemRole: true,
    createdAt: "2026-01-01T00:00:00Z",
    permissions: [
      { module: "customers", actions: ["view"] },
      { module: "loans", actions: ["view"] },
      { module: "savings", actions: ["view"] },
      { module: "collections", actions: ["view"] },
      { module: "branches", actions: ["view"] },
      { module: "staff", actions: ["view"] },
      { module: "reports", actions: ["view", "export"] },
      { module: "settings", actions: ["view"] },
      { module: "audit", actions: ["view", "export"] },
    ],
  },
  {
    id: "role-customer",
    name: "Borrower Member",
    nameBn: "ঋণগ্রহীতা সদস্য",
    description: "Self-service viewing of active loans, weekly installment schedules, savings balance, and receipts.",
    isSystemRole: true,
    createdAt: "2026-01-01T00:00:00Z",
    permissions: [
      { module: "customers", actions: ["view"] },
      { module: "loans", actions: ["view"] },
      { module: "savings", actions: ["view"] },
      { module: "collections", actions: ["view"] },
    ],
  },
];

// ─── MODULE LABELS & ACTION METADATA ──────────────────────────
export const MODULE_METADATA: Record<
  SystemModule,
  { label: string; labelBn: string; availableActions: PermissionAction[] }
> = {
  customers: {
    label: "Members & KYC",
    labelBn: "সদস্য ও কেওয়াইসি",
    availableActions: ["view", "create", "edit", "delete"],
  },
  loans: {
    label: "Loan Portfolio",
    labelBn: "ঋণ হিসাব",
    availableActions: ["view", "create", "edit", "delete", "approve"],
  },
  savings: {
    label: "Savings Vault",
    labelBn: "সঞ্চয় ভল্ট",
    availableActions: ["view", "create", "edit", "delete"],
  },
  collections: {
    label: "Collections & Receipts",
    labelBn: "আদায় ও রসিদ",
    availableActions: ["view", "create", "edit", "delete", "reverse"],
  },
  branches: {
    label: "Branches",
    labelBn: "শাখা ব্যবস্থাপনা",
    availableActions: ["view", "create", "edit", "delete"],
  },
  staff: {
    label: "Staff & Officers",
    labelBn: "কর্মী ও কর্মকর্তা",
    availableActions: ["view", "create", "edit", "delete"],
  },
  reports: {
    label: "Reports & Analytics",
    labelBn: "প্রতিবেদন ও বিশ্লেষণ",
    availableActions: ["view", "export"],
  },
  settings: {
    label: "System Settings",
    labelBn: "সিস্টেম সেটিংস",
    availableActions: ["view", "edit"],
  },
  audit: {
    label: "Activity & Error Audit",
    labelBn: "কার্যক্রম ও ত্রুটি অডিট",
    availableActions: ["view", "export"],
  },
};

export const ACTION_LABELS: Record<PermissionAction, { label: string; labelBn: string }> = {
  view: { label: "View / তালিকা দর্শন", labelBn: "দর্শন" },
  create: { label: "Create / যোগ করা", labelBn: "যোগ" },
  edit: { label: "Edit / সংশোধন", labelBn: "সংশোধন" },
  delete: { label: "Delete / মুছে ফেলা", labelBn: "মুছে ফেলা" },
  approve: { label: "Approve / অনুমোদন", labelBn: "অনুমোদন" },
  export: { label: "Export / ডাউনলোড", labelBn: "রপ্তানি" },
  reverse: { label: "Reverse / বাতিলকরণ", labelBn: "বাতিলকরণ" },
};
