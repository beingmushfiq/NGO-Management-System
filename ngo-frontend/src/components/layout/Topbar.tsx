import React, { useState, useEffect } from "react";
import {
  useAuthStore,
  useBranchStore,
  useNotificationStore,
  useOrgStore,
  useAuditStore,
  syncAllDataFromBackend,
} from "@/store";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Building,
  ChevronDown,
  Menu,
  Sparkles,
  HandCoins,
  Server,
  RefreshCw,
  FileCheck2,
  ShieldAlert,
} from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { ActivityLogModal } from "@/components/admin/ActivityLogModal";
import { ErrorLogInspectorModal } from "@/components/admin/ErrorLogInspectorModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast-system";

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
  onOpenCollectionModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSearch,
  onOpenMobileMenu,
  onOpenCollectionModal,
}) => {
  const navigate = useNavigate();
  const { user, login, loginWithCredentials, isLive, backendOnline, checkHealth, setMode } = useAuthStore();
  const { branches, selectedBranchId, setSelectedBranch } = useBranchStore();
  const unreadCount = useNotificationStore((s) => s.getUnreadCount());
  const org = useOrgStore((s) => s.settings);

  const { openAuditModal, openErrorModal, errorLogs } = useAuditStore();
  const unresolvedErrorCount = errorLogs.filter((e) => !e.resolved).length;

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize theme from localStorage or document
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("ngo_theme") === "dark" ||
      document.documentElement.classList.contains("dark")
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ngo_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ngo_theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSyncBackend = async () => {
    setIsSyncing(true);
    const online = await checkHealth();
    if (online) {
      await syncAllDataFromBackend();
      toast.success("Synchronized with MySQL", "Fetched latest branches, customers, loans, and ledgers from Laravel backend.");
    } else {
      toast.warning("Live Backend Offline", "Running on local demo dataset.");
    }
    setIsSyncing(false);
  };

  const handleRoleSwitch = (role: "admin" | "staff" | "customer", customerId?: string) => {
    // Immediately set active user in local state
    login(role, customerId);

    if (role === "admin") {
      toast.info("Switched to System Administrator", "Executive overview, multi-branch audits, and credit governance.");
      navigate("/admin/dashboard");
    } else if (role === "staff") {
      toast.info("Switched to Field Officer (Kamal Hossain)", "Today's field recovery queue, route visits, and mobile collections.");
      navigate("/staff/dashboard");
    } else {
      toast.info("Switched to Member (Rahima Begum)", "Borrower 360 overview, weekly installment tracker, and digital receipts.");
      navigate("/customer/overview");
    }
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left side: Mobile menu toggle + Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search trigger bar */}
        <button
          onClick={onOpenSearch}
          className="flex h-10 w-44 sm:w-64 md:w-80 items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-slate-400 hover:border-slate-300 hover:bg-slate-100/70 transition-all dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">Search customer, loan, receipt...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side: Quick Actions + Backend Badge + Branch Selector + Role Switcher + Audit & Error Tools + Theme + Notifications */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Backend Live / Demo Status Pill */}
        <button
          onClick={handleSyncBackend}
          disabled={isSyncing}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            backendOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          }`}
          title="Click to sync with Laravel MySQL API"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{backendOnline ? "Live API (MySQL)" : "Demo Mode"}</span>
        </button>

        {/* Quick Collection CTA on desktop */}
        {user?.role !== "customer" && (
          <Button
            size="sm"
            onClick={onOpenCollectionModal}
            className="hidden xl:flex h-9 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <HandCoins className="h-4 w-4 text-teal-200" />
            + New Collection
          </Button>
        )}

        {/* Branch Context Selector (Admin only) */}
        {user?.role === "admin" && (
          <div className="relative">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 cursor-pointer"
            >
              <Building className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">
                {selectedBranch ? selectedBranch.name : "All Branches"}
              </span>
              <span className="sm:hidden">
                {selectedBranch ? selectedBranch.name.split(" ")[0] : "All"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in-0 zoom-in-95">
                <div
                  onClick={() => {
                    setSelectedBranch(null);
                    setIsBranchDropdownOpen(false);
                  }}
                  className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                    selectedBranchId === null
                      ? "bg-teal-50 text-teal-800 font-semibold dark:bg-teal-950/40 dark:text-teal-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  All Branches (সর্বমোট)
                </div>
                {branches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBranch(b.id);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                      selectedBranchId === b.id
                        ? "bg-teal-50 text-teal-800 font-semibold dark:bg-teal-950/40 dark:text-teal-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {b.name} ({b.nameBn})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fast Persona Switcher Badge */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl text-[11px]">
          <span className="text-slate-400 px-1 text-[10px] uppercase font-semibold">Persona:</span>
          <button
            onClick={() => handleRoleSwitch("admin")}
            className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              user?.role === "admin"
                ? "bg-teal-700 text-white font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => handleRoleSwitch("staff")}
            className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              user?.role === "staff"
                ? "bg-teal-700 text-white font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => handleRoleSwitch("customer", "CUS-1024")}
            className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              user?.role === "customer"
                ? "bg-teal-700 text-white font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Customer
          </button>
        </div>

        {/* Activity Audit Trail Trigger */}
        <button
          onClick={openAuditModal}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-teal-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-teal-300 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title="Activity Log & Audit Trail (কার্যক্রম লগ)"
          aria-label="Open Activity Audit Trail"
        >
          <FileCheck2 className="h-4 w-4" />
        </button>

        {/* Error Inspector Trigger */}
        <button
          onClick={openErrorModal}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title="Error Log & System Inspector (ত্রুটি পরিদর্শক)"
          aria-label="Open Error Log Inspector"
        >
          <ShieldAlert className="h-4 w-4" />
          {unresolvedErrorCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
              {unresolvedErrorCount}
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-180 duration-200" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600 animate-in spin-in-180 duration-200" />
          )}
        </button>

        {/* Notifications Icon + Center */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationCenter
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
          />
        </div>

        {/* User Profile Avatar Trigger */}
        <button
          onClick={() => navigate(`/${user?.role || "admin"}/profile`)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs hover:bg-teal-700 hover:text-white dark:hover:bg-teal-700 dark:hover:text-white transition-colors cursor-pointer shadow-xs border border-teal-200/50 dark:border-teal-800"
          title={`My Profile (${user?.name})`}
        >
          {user?.name?.substring(0, 2).toUpperCase() || "U"}
        </button>
      </div>

      {/* Audit & Error Modals */}
      <ActivityLogModal />
      <ErrorLogInspectorModal />
    </header>
  );
};
