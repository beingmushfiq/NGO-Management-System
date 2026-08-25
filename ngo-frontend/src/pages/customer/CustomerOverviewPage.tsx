import React from "react";
import {
  useAuthStore,
  useCustomerStore,
  useLoanStore,
  useSavingsStore,
  useCollectionStore,
  useBranchStore,
} from "@/store";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  PiggyBank,
  Receipt,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CustomerOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { customers } = useCustomerStore();
  const { loans } = useLoanStore();
  const { accounts } = useSavingsStore();
  const { collections } = useCollectionStore();
  const { branches } = useBranchStore();

  // Find customer matching user customerId or first customer
  const customerId = currentUser?.customerId || currentUser?.id || "cu-01";
  const customer = customers.find((c) => String(c.id) === String(customerId) || c.customerId === customerId) || customers[0];
  const branch = branches.find((b) => String(b.id) === String(customer?.branchId)) || branches[0];

  const custLoans = loans.filter((l) => String(l.customerId) === String(customer?.id));
  const activeLoan = custLoans.find((l) => l.status === "active" || l.status === "overdue") || custLoans[0];
  const savings = accounts.find((a) => String(a.customerId) === String(customer?.id)) || accounts[0];
  const custCollections = collections.filter((c) => String(c.customerId) === String(customer?.id));

  // Next installment
  const nextInstallment = activeLoan?.installments?.find((i) => i.status === "pending" || i.status === "overdue");

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-16">
      {/* Customer Hero Banner */}
      <div className="rounded-3xl bg-linear-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white text-teal-900 flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
              {customer.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-teal-700 text-teal-100 border-teal-500/30 text-xs">
                  Member Portal
                </Badge>
                <span className="text-xs text-teal-200">{customer.customerId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {customer.name} {customer.nameBn && <span className="text-lg font-normal text-teal-200">({customer.nameBn})</span>}
              </h1>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Member at {branch?.name} • Member Since {formatDate(customer.registeredAt)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/customer/receipts")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs gap-1.5"
            >
              <Receipt className="h-4 w-4 text-teal-300" /> View Payment Receipts
            </Button>
          </div>
        </div>
      </div>

      {/* Main Financial Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Loan Outstanding */}
        <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Loan Outstanding (বকেয়া ঋণ)
            </span>
            <CreditCard className="h-5 w-5 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white financial-value mt-2">
            {activeLoan ? formatCurrency(activeLoan.outstanding) : "৳0"}
          </div>

          {activeLoan && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Paid:</span>
              <span className="font-bold text-emerald-600 financial-value">
                {formatCurrency(activeLoan.totalPaid)}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/customer/loan")}
            className="w-full mt-3 text-xs text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 justify-between"
          >
            <span>Loan Schedule Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        {/* Savings Balance */}
        <Card className="rounded-3xl p-6 border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Savings Balance (মোট সঞ্চয়)
            </span>
            <PiggyBank className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 financial-value mt-2">
            {savings ? formatCurrency(savings.balance) : "৳0"}
          </div>

          {savings && (
            <div className="mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between text-xs">
              <span className="text-emerald-800/80 dark:text-emerald-300">Lifetime Saved:</span>
              <span className="font-bold text-emerald-900 dark:text-emerald-200 financial-value">
                {formatCurrency(savings.totalDeposited)}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/customer/savings")}
            className="w-full mt-3 text-xs text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 justify-between"
          >
            <span>Savings History Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        {/* Next Scheduled Installment */}
        <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Next Due Installment
            </span>
            <CalendarCheck className="h-5 w-5 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-800 dark:text-teal-300 financial-value mt-2">
            {nextInstallment ? formatCurrency(nextInstallment.expected + 200) : "৳0"}
          </div>

          {nextInstallment ? (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDate(nextInstallment.dueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Installment:</span>
                <span>Week #{nextInstallment.installmentNo} (Loan ৳{nextInstallment.expected} + Sav ৳200)</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              All installments up to date!
            </div>
          )}
        </Card>
      </div>

      {/* Recent Receipts Section */}
      <Card className="rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-teal-700" />
            Recent Payment Receipts ({custCollections.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/customer/receipts")}
            className="text-xs"
          >
            All Receipts
          </Button>
        </CardHeader>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {custCollections.slice(0, 4).map((col) => (
            <div key={col.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <div>
                <span className="font-mono font-bold text-teal-800 dark:text-teal-400 text-xs block">
                  {col.receiptNo}
                </span>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  {formatDateTime(col.collectedAt)} • Paid via {col.paymentMethod}
                </span>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white financial-value block">
                  {formatCurrency(col.totalAmount)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Loan ৳{col.loanAmount} | Sav ৳{col.savingsAmount}
                </span>
              </div>
            </div>
          ))}

          {custCollections.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No payment transactions recorded yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
