import React, { useState, useEffect } from "react";
import { useCustomerStore, useLoanStore, useSavingsStore, useBranchStore, useDueItems } from "@/store";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CalendarCheck,
  Search,
  Filter,
  HandCoins,
  AlertTriangle,
  Clock,
  CheckCircle,
  Building,
} from "lucide-react";
import { CombinedCollectionModal } from "@/components/collection/CombinedCollectionModal";
import { TableSkeleton, CardSkeleton } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-state";

export const DuePage: React.FC = () => {
  const { branches } = useBranchStore();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCustomerIdForCollect, setSelectedCustomerIdForCollect] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const dueItems = useDueItems(selectedBranch === "all" ? null : selectedBranch);

  const filteredDueItems = dueItems.filter((item) => {
    return (
      item.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      item.customer.customerId.toLowerCase().includes(search.toLowerCase()) ||
      item.customer.phone.includes(search)
    );
  });

  const totalDueAmount = dueItems.reduce((s, i) => s + Number(i.totalDue || 0), 0);
  const totalLoanDue = dueItems.reduce((s, i) => s + Number(i.installment.expected || 0), 0);
  const totalSavingsDue = dueItems.length * 200;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={7} />
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Due Installments Error">
      <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Today's Due Installments / আজকের বকেয়া কিস্তি
            </h1>
            <Badge variant="warning" className="text-xs font-semibold">
              Action Required
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time tracking of scheduled loan installment and savings recoveries for today.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Total Due Amount Today (সর্বমোট বকেয়া)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-100 financial-value mt-1">
            {formatCurrency(totalDueAmount)}
          </div>
          <span className="text-xs text-amber-700/80 mt-1 block">
            {dueItems.length} borrower accounts pending recovery
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Expected Loan Installments
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white financial-value mt-1">
            {formatCurrency(totalLoanDue)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Principal & Service Charge</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Expected Savings Deposits
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 financial-value mt-1">
            {formatCurrency(totalSavingsDue)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Weekly mandatory savings</span>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search due customer by name, ID (CUS-1024), or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="all">All Branches (সকল শাখা)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.nameBn})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Due List Table */}
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>Pending Due Recoveries ({filteredDueItems.length})</span>
            <span className="text-xs text-slate-400 font-normal">
              Click 'Collect' to open dual account settlement modal
            </span>
          </CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider text-left bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-4 font-medium">Customer Profile</th>
                <th className="py-3 px-4 font-medium">Installment #</th>
                <th className="py-3 px-4 font-medium">Loan Due</th>
                <th className="py-3 px-4 font-medium">Savings Due</th>
                <th className="py-3 px-4 font-medium">Total Due</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDueItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-2">
                    <EmptyState
                      variant="collections"
                      title={search ? "No Due Installments Match Search" : "All Dues Collected for Today!"}
                      titleBn="আজকের সকল কিস্তি আদায় সম্পন্ন হয়েছে!"
                      description={
                        search
                          ? `No pending recovery found for "${search}". Try searching with another name or ID.`
                          : "Great work! There are no outstanding member dues pending recovery for today."
                      }
                      actionText={search ? "Clear Search" : undefined}
                      onAction={search ? () => setSearch("") : undefined}
                      className="border-none bg-transparent shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                filteredDueItems.map((item) => (
                  <tr key={item.installment.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.customer.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.customer.customerId} • {item.customer.phone}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      Week #{item.installment.installmentNo}
                    </td>

                    <td className="py-3 px-4 font-semibold financial-value text-slate-800 dark:text-slate-200">
                      {formatCurrency(item.installment.expected)}
                    </td>

                    <td className="py-3 px-4 font-semibold financial-value text-emerald-700 dark:text-emerald-400">
                      ৳200
                    </td>

                    <td className="py-3 px-4 font-bold financial-value text-teal-800 dark:text-teal-300 text-sm">
                      {formatCurrency(item.totalDue)}
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={item.installment.status === "overdue" ? "destructive" : "warning"}>
                        {item.installment.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-teal-700 hover:bg-teal-800 text-white font-semibold h-8 text-xs gap-1.5"
                        onClick={() => setSelectedCustomerIdForCollect(item.customer.id)}
                      >
                        <HandCoins className="h-3.5 w-3.5" /> Collect ৳{item.totalDue}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Collection Modal Trigger */}
      <CombinedCollectionModal
        isOpen={!!selectedCustomerIdForCollect}
        onClose={() => setSelectedCustomerIdForCollect(null)}
        preselectedCustomerId={selectedCustomerIdForCollect || undefined}
      />
    </div>
    </ErrorBoundary>
  );
};
