import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore, useOrgStore } from "@/store";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PiggyBank,
  CalendarCheck,
  Building2,
  UserCheck,
  FileText,
  Settings,
  Receipt,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  onOpenCollectionModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  onOpenCollectionModal,
}) => {
  const { user, logout } = useAuthStore();
  const org = useOrgStore((s) => s.settings);
  const location = useLocation();

  const role = user?.role || "admin";

  // Navigation Items per Role
  const adminNav = [
    { label: "Dashboard", labelBn: "ড্যাশবোর্ড", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Customers", labelBn: "গ্রাহকবৃন্দ", path: "/admin/customers", icon: Users },
    { label: "Loans", labelBn: "ঋণ ব্যবস্থাপনা", path: "/admin/loans", icon: CreditCard },
    { label: "Today's Due", labelBn: "আজকের বকেয়া", path: "/admin/due", icon: CalendarCheck },
    { label: "Savings", labelBn: "সঞ্চয় হিসাব", path: "/admin/savings", icon: PiggyBank },
    { label: "Branches", labelBn: "শাখা সমূহ", path: "/admin/branches", icon: Building2 },
    { label: "Staff & Roles", labelBn: "কর্মী ও রোলসমূহ", path: "/admin/staff", icon: UserCheck },
    { label: "Reports", labelBn: "অডিট ও রিপোর্ট", path: "/admin/reports", icon: FileText },
    { label: "Org Settings", labelBn: "সেটিংস", path: "/admin/settings", icon: Settings },
    { label: "User Profile", labelBn: "প্রোফাইল", path: "/admin/profile", icon: ShieldCheck },
  ];

  const staffNav = [
    { label: "Today's Work", labelBn: "আজকের কাজ", path: "/staff/dashboard", icon: LayoutDashboard },
    { label: "Due Collection", labelBn: "বকেয়া আদায়", path: "/staff/due", icon: CalendarCheck },
    { label: "Find Customer", labelBn: "গ্রাহক খুঁজুন", path: "/staff/customers", icon: Users },
    { label: "Collections", labelBn: "আদায় রশিদ", path: "/staff/collections", icon: Receipt },
    { label: "Officer Profile", labelBn: "প্রোফাইল", path: "/staff/profile", icon: ShieldCheck },
  ];

  const customerNav = [
    { label: "Overview", labelBn: "সারসংক্ষেপ", path: "/customer/overview", icon: LayoutDashboard },
    { label: "My Loan", labelBn: "আমার ঋণ", path: "/customer/loan", icon: CreditCard },
    { label: "My Savings", labelBn: "আমার সঞ্চয়", path: "/customer/savings", icon: PiggyBank },
    { label: "Receipts", labelBn: "রশিদ সমূহ", path: "/customer/receipts", icon: Receipt },
    { label: "Member Profile", labelBn: "প্রোফাইল", path: "/customer/profile", icon: ShieldCheck },
  ];

  const navItems = role === "admin" ? adminNav : role === "staff" ? staffNav : customerNav;

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 z-30",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
        {!isCollapsed ? (
          <NavLink
            to={role === "admin" ? "/admin/dashboard" : role === "staff" ? "/staff/dashboard" : "/customer/overview"}
            className="flex items-center gap-2.5 overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity"
            title={`Go to ${role} dashboard`}
          >
            <img src="/logo.svg" className="h-9 w-9 shrink-0 object-contain group-hover:scale-105 transition-transform" alt="NGO Logo" />
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                {org.name}
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium truncate">
                {org.nameBn || "NGO Microfinance"}
              </span>
            </div>
          </NavLink>
        ) : (
          <NavLink
            to={role === "admin" ? "/admin/dashboard" : role === "staff" ? "/staff/dashboard" : "/customer/overview"}
            className="mx-auto block group cursor-pointer"
            title={`Go to ${role} dashboard`}
          >
            <img src="/logo.svg" className="h-8 w-8 object-contain group-hover:scale-110 transition-transform" alt="NGO Logo" />
          </NavLink>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary Action Button (Admin/Staff only) */}
      {role !== "customer" && (
        <div className="p-3">
          <Button
            onClick={onOpenCollectionModal}
            className={cn(
              "w-full bg-teal-700 hover:bg-teal-800 text-white shadow-xs font-semibold gap-2 transition-all",
              isCollapsed ? "p-0 h-10 w-10 justify-center mx-auto" : "h-11 justify-start px-3.5"
            )}
            title="Collect Payment"
          >
            <HandCoins className="h-5 w-5 shrink-0 text-teal-200" />
            {!isCollapsed && (
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold">+ New Collection</span>
                <span className="text-[10px] text-teal-200 font-normal">নতুন কিস্তি আদায়</span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {!isCollapsed && (role === "admin" ? "Management" : role === "staff" ? "Field Operations" : "Self Service")}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 relative",
                isActive
                  ? "bg-teal-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? `${item.label} (${item.labelBn})` : undefined}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
              {!isCollapsed && (
                <div className="flex flex-col leading-tight truncate">
                  <span className="truncate">{item.label}</span>
                  <span className={cn("text-[10px] font-normal truncate", isActive ? "text-teal-100" : "text-slate-400")}>
                    {item.labelBn}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Persona Quick Switcher in Sidebar */}
      {!isCollapsed && (
        <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-1">
            Switch Persona (রোল পরিবর্তন)
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-800/40 p-1 rounded-xl">
            <button
              onClick={() => {
                useAuthStore.getState().login("admin");
              }}
              className={cn(
                "py-1 px-1.5 text-[11px] rounded-lg font-medium transition-colors text-center cursor-pointer",
                role === "admin"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700"
              )}
            >
              Admin
            </button>
            <button
              onClick={() => {
                useAuthStore.getState().login("staff");
              }}
              className={cn(
                "py-1 px-1.5 text-[11px] rounded-lg font-medium transition-colors text-center cursor-pointer",
                role === "staff"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700"
              )}
            >
              Staff
            </button>
            <button
              onClick={() => {
                useAuthStore.getState().login("customer", "CUS-1024");
              }}
              className={cn(
                "py-1 px-1.5 text-[11px] rounded-lg font-medium transition-colors text-center cursor-pointer",
                role === "customer"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-700"
              )}
            >
              Member
            </button>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl bg-slate-50 p-2 dark:bg-slate-800/50",
            isCollapsed && "justify-center p-1.5"
          )}
        >
          <NavLink
            to={`/${role}/profile`}
            className="flex items-center gap-2.5 flex-1 overflow-hidden group cursor-pointer"
            title="View User Profile"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold text-xs group-hover:bg-teal-700 group-hover:text-white transition-colors dark:bg-teal-950 dark:text-teal-300">
              {user?.name?.substring(0, 2).toUpperCase() || "U"}
            </div>

            {!isCollapsed && (
              <div className="flex flex-1 flex-col overflow-hidden leading-tight">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 truncate transition-colors">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {user?.role} portal
                </span>
              </div>
            )}
          </NavLink>

          {!isCollapsed && (
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
