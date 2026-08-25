import React, { useState } from "react";
import {
  useAuthStore,
  useCustomerStore,
  useLoanStore,
  useSavingsStore,
  useCollectionStore,
  useBranchStore,
  useDueItems,
} from "@/store";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HandCoins,
  CalendarCheck,
  Users,
  Receipt,
  Building2,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CombinedCollectionModal } from "@/components/collection/CombinedCollectionModal";

export const StaffDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { branches } = useBranchStore();
  const { customers } = useCustomerStore();
  const { collections } = useCollectionStore();

  const userBranch = branches.find((b) => String(b.id) === String(currentUser?.branchId)) || branches[0];
  const dueItems = useDueItems(userBranch?.id);

  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedCustomerIdForCollect, setSelectedCustomerIdForCollect] = useState<string | null>(null);

  const staffCollections = collections.filter((c) => String(c.branchId) === String(userBranch?.id));
  const todayStaffTotal = staffCollections.reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);
  const todayDueTotal = dueItems.reduce((sum, i) => sum + Number(i.totalDue || 0), 0);

  const handleCollectCustomer = (customerId: string) => {
    setSelectedCustomerIdForCollect(customerId);
    setIsCollectModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Banner with Field Context */}
      <div className="rounded-3xl bg-linear-to-r from-teal-800 to-teal-900 text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-teal-700/80 text-teal-100 border-teal-500/30 text-xs">
                Field Operations Unit
              </Badge>
              <span className="text-xs text-teal-200 font-medium">
                {userBranch?.name} ({userBranch?.nameBn})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Today's Field Work / আজকের মাঠ কার্যক্রম
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-xl">
              Good day, <span className="font-bold text-white">{currentUser?.name}</span>. Track scheduled borrower visits, dual-account recoveries, and issue instant printable receipts.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => {
              setSelectedCustomerIdForCollect(null);
              setIsCollectModalOpen(true);
            }}
            className="h-12 bg-white hover:bg-teal-50 text-teal-900 font-bold px-6 shadow-md gap-2 shrink-0 text-sm"
          >
            <HandCoins className="h-5 w-5 text-teal-700" />
            + Collect Payment (টাকা আদায়)
          </Button>
        </div>
      </div>

      {/* Field KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Pending Today's Due
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-100 financial-value mt-1">
            {formatCurrency(todayDueTotal)}
          </div>
          <span className="text-[11px] text-amber-700/80 mt-0.5 block">{dueItems.length} accounts to visit</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Collected Today
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-100 financial-value mt-1">
            {formatCurrency(todayStaffTotal)}
          </div>
          <span className="text-[11px] text-emerald-700/80 mt-0.5 block">{staffCollections.length} receipts issued</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Borrowers
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white financial-value mt-1">
            {customers.filter((c) => c.branchId === userBranch?.id).length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Branch territory</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Recovery Rate
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-700 dark:text-teal-400 financial-value mt-1">
            {todayDueTotal > 0 ? Math.min(100, Math.round((todayStaffTotal / (todayStaffTotal + todayDueTotal)) * 100)) : 100}%
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Daily efficiency</span>
        </div>
      </div>

      {/* Immediate Action Route List */}
      <Card className="rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-teal-700" />
              Assigned Due Recovery Queue ({dueItems.length})
            </CardTitle>
            <p className="text-xs text-slate-400">Borrowers with scheduled installments for today</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/staff/due")}
            className="text-xs gap-1"
          >
            View Full Queue <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {dueItems.slice(0, 5).map((item) => (
            <div
              key={item.installment.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {item.customer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {item.customer.name}
                    <span className="text-xs text-slate-400 font-normal">({item.customer.customerId})</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {item.customer.phone}</span>
                    <span>• Week #{item.installment.installmentNo}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300 financial-value block">
                    {formatCurrency(item.totalDue)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Loan {formatCurrency(item.installment.expected)} + Sav ৳200
                  </span>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleCollectCustomer(item.customer.id)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 h-8"
                >
                  <HandCoins className="h-3.5 w-3.5" /> Collect
                </Button>
              </div>
            </div>
          ))}

          {dueItems.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              All scheduled collections for your route have been completed!
            </div>
          )}
        </div>
      </Card>

      {/* Collection Modal */}
      <CombinedCollectionModal
        isOpen={isCollectModalOpen}
        onClose={() => {
          setIsCollectModalOpen(false);
          setSelectedCustomerIdForCollect(null);
        }}
        preselectedCustomerId={selectedCustomerIdForCollect || undefined}
      />
    </div>
  );
};
