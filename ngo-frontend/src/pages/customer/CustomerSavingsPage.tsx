import React from "react";
import { useAuthStore, useCustomerStore, useSavingsStore } from "@/store";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PiggyBank,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export const CustomerSavingsPage: React.FC = () => {
  const currentUser = useAuthStore((s) => s.user);
  const { customers } = useCustomerStore();
  const { accounts } = useSavingsStore();

  const customerId = currentUser?.customerId || currentUser?.id || "cu-01";
  const customer = customers.find((c) => String(c.id) === String(customerId) || c.customerId === customerId) || customers[0];
  const savings = accounts.find((a) => String(a.customerId) === String(customer?.id)) || accounts[0];

  if (!savings) {
    return (
      <div className="p-12 text-center text-slate-400">
        <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">No Savings Account Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-16">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Savings Vault / আমার সঞ্চয় হিসাব
          </h1>
          <Badge variant="default" className="text-xs bg-emerald-700 text-white">
            Active Member Vault
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Account opened on {formatDate(savings.openedAt)} • Weekly savings contributions build financial security.
        </p>
      </div>

      {/* Hero Balance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-2 rounded-3xl p-6 sm:p-8 border-emerald-200 bg-linear-to-br from-emerald-800 to-teal-900 text-white shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Total Accumulated Savings Balance
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold financial-value mt-2">
            {formatCurrency(savings.balance)}
          </div>
          <p className="text-xs text-emerald-100/80 mt-2">
            Compounded weekly with dual-account loan installment contributions.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-emerald-700/60 text-xs">
            <div>
              <span className="text-emerald-200/80 block">Lifetime Deposited:</span>
              <span className="font-bold text-white text-sm financial-value">
                {formatCurrency(savings.totalDeposited)}
              </span>
            </div>
            <div>
              <span className="text-emerald-200/80 block">Lifetime Withdrawn:</span>
              <span className="font-bold text-rose-200 text-sm financial-value">
                {formatCurrency(savings.totalWithdrawn)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl p-6 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contribution Rule
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              ৳200 / Week
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monthly target: ৳{savings.monthlyContribution}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 space-y-1 mt-4">
            <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-semibold">
              <ShieldCheck className="h-4 w-4" /> MRA Guaranteed
            </div>
            <p className="text-[11px]">Protected member reserve fund withdrawable upon maturity.</p>
          </div>
        </Card>
      </div>

      {/* Transactions History Ledger */}
      <Card className="rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>Savings Transaction Ledger ({savings.transactions.length} Entries)</span>
            <span className="text-xs text-slate-400 font-normal">Chronological History</span>
          </CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider text-left bg-slate-50/60 dark:bg-slate-900/50">
                <th className="py-3 px-4 font-medium">Transaction Date</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
                <th className="py-3 px-4 text-right font-bold">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {savings.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {formatDateTime(tx.date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={tx.type === "deposit" ? "default" : "destructive"}>
                      {tx.type === "deposit" ? "+ Deposit" : "- Withdrawal"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {tx.note}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-bold financial-value ${
                      tx.type === "deposit" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"
                    }`}
                  >
                    {tx.type === "deposit" ? `+ ${formatCurrency(tx.amount)}` : `- ${formatCurrency(tx.amount)}`}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold financial-value text-slate-900 dark:text-white">
                    {formatCurrency(tx.balanceAfter)}
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
