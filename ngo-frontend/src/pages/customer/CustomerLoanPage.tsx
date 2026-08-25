import React from "react";
import { useAuthStore, useCustomerStore, useLoanStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ShieldCheck,
} from "lucide-react";

export const CustomerLoanPage: React.FC = () => {
  const currentUser = useAuthStore((s) => s.user);
  const { customers } = useCustomerStore();
  const { loans } = useLoanStore();

  const customerId = currentUser?.customerId || currentUser?.id || "cu-01";
  const customer = customers.find((c) => String(c.id) === String(customerId) || c.customerId === customerId) || customers[0];
  const custLoans = loans.filter((l) => String(l.customerId) === String(customer?.id));
  const activeLoan = custLoans.find((l) => l.status === "active" || l.status === "overdue") || custLoans[0];

  if (!activeLoan) {
    return (
      <div className="p-12 text-center text-slate-400">
        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">No Active Loan Record</h2>
        <p className="text-xs mt-1">You do not have an active microfinance loan with our organization at this time.</p>
      </div>
    );
  }

  const percentPaid = Math.round((activeLoan.totalPaid / activeLoan.totalPayable) * 100);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-16">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Loan Account / আমার ঋণ হিসাব
          </h1>
          <Badge variant={activeLoan.status === "active" ? "default" : "warning"} className="text-xs">
            {activeLoan.status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Loan ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeLoan.loanId}</span> • Disbursed on {formatDate(activeLoan.disbursedAt)}
        </p>
      </div>

      {/* Hero Progress Banner */}
      <Card className="rounded-3xl p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Outstanding Loan Balance
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-rose-700 dark:text-rose-400 financial-value mt-1">
              {formatCurrency(activeLoan.outstanding)}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Repayment Progress
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400 financial-value mt-1">
              {percentPaid}%
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
          <div
            className="bg-linear-to-r from-teal-600 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentPaid}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-medium text-slate-500 mt-2">
          <span>Paid: {formatCurrency(activeLoan.totalPaid)}</span>
          <span>Total Payable: {formatCurrency(activeLoan.totalPayable)}</span>
        </div>

        {/* Breakdown specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400 block uppercase">Principal Disbursed</span>
            <span className="font-bold text-slate-900 dark:text-white financial-value">{formatCurrency(activeLoan.principal)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400 block uppercase">Service Charge</span>
            <span className="font-bold text-slate-900 dark:text-white financial-value">{formatCurrency(activeLoan.serviceCharge)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400 block uppercase">Weekly Installment</span>
            <span className="font-bold text-teal-700 dark:text-teal-400 financial-value">{formatCurrency(activeLoan.installmentAmount)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
            <span className="font-bold text-slate-900 dark:text-white">{activeLoan.durationWeeks} Weeks</span>
          </div>
        </div>
      </Card>

      {/* Full Installment Repayment Schedule */}
      <Card className="rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>Repayment Schedule ({activeLoan.installments.length} Installments)</span>
            <span className="text-xs text-slate-400 font-normal">Weekly Due Dates</span>
          </CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider text-left bg-slate-50/60 dark:bg-slate-900/50">
                <th className="py-3 px-4 font-medium">Installment #</th>
                <th className="py-3 px-4 font-medium">Scheduled Due Date</th>
                <th className="py-3 px-4 font-medium">Installment Amount</th>
                <th className="py-3 px-4 font-medium">Paid Amount</th>
                <th className="py-3 px-4 font-medium">Outstanding</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeLoan.installments.map((inst) => (
                <tr
                  key={inst.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                    inst.status === "paid" ? "opacity-75" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    Week #{inst.installmentNo}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {formatDate(inst.dueDate)}
                  </td>
                  <td className="py-3 px-4 font-semibold financial-value text-slate-800 dark:text-slate-200">
                    {formatCurrency(inst.expected)}
                  </td>
                  <td className="py-3 px-4 font-semibold financial-value text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(inst.paid)}
                  </td>
                  <td className="py-3 px-4 font-semibold financial-value text-slate-700 dark:text-slate-300">
                    {formatCurrency(inst.outstanding)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={inst.status === "paid" ? "default" : inst.status === "overdue" ? "destructive" : "warning"}>
                      {inst.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
