import React from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownRight, ArrowDownLeft, Landmark, PiggyBank, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface AccountAllocationVizProps {
  loanAmount: number;
  savingsAmount: number;
  totalAmount: number;
  loanBalanceBefore?: number;
  savingsBalanceBefore?: number;
}

export const AccountAllocationViz: React.FC<AccountAllocationVizProps> = ({
  loanAmount,
  savingsAmount,
  totalAmount,
  loanBalanceBefore = 0,
  savingsBalanceBefore = 0,
}) => {
  const loanAfter = Math.max(0, loanBalanceBefore - loanAmount);
  const savingsAfter = savingsBalanceBefore + savingsAmount;

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-linear-to-b from-teal-50/70 to-slate-50/50 p-4 dark:border-teal-900/50 dark:from-teal-950/30 dark:to-slate-900/40">
      <div className="text-center mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300">
          Account Allocation Preview / হিসাব বণ্টন
        </span>
        <div className="text-xl font-bold financial-value text-slate-900 dark:text-white mt-0.5">
          {formatCurrency(totalAmount)}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          One payment distributed into two accounts
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* Loan Account Flow */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <Landmark className="h-3.5 w-3.5" />
            </div>
            <span>Loan Account</span>
          </div>

          <div className="text-sm font-bold text-teal-700 dark:text-teal-400 financial-value">
            +{formatCurrency(loanAmount)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-col gap-0.5">
            <span>Outstanding before: {formatCurrency(loanBalanceBefore)}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              After: {formatCurrency(loanAfter)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Installment Reduced
          </div>
        </motion.div>

        {/* Savings Account Flow */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <PiggyBank className="h-3.5 w-3.5" />
            </div>
            <span>Savings Account</span>
          </div>

          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 financial-value">
            +{formatCurrency(savingsAmount)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-col gap-0.5">
            <span>Balance before: {formatCurrency(savingsBalanceBefore)}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              After: {formatCurrency(savingsAfter)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Balance Credited
          </div>
        </motion.div>
      </div>
    </div>
  );
};
