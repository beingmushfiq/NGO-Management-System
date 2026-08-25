import React, { useState, useEffect } from "react";
import { useSavingsStore, useCustomerStore, useBranchStore } from "@/store";
import { TableSkeleton, CardSkeleton } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-state";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/toast-system";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PiggyBank,
  Search,
  Plus,
  Minus,
  TrendingUp,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Banknote,
} from "lucide-react";

export const SavingsPage: React.FC = () => {
  const { accounts, deposit, withdraw } = useSavingsStore();
  const { customers } = useCustomerStore();
  const { branches } = useBranchStore();

  const [search, setSearch] = useState("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const [amount, setAmount] = useState<number>(500);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");

  const totalSavingsBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalLifetimeDeposited = accounts.reduce((sum, a) => sum + Number(a.totalDeposited || 0), 0);
  const totalWithdrawn = accounts.reduce((sum, a) => sum + Number(a.totalWithdrawn || 0), 0);

  const filteredAccounts = accounts.filter((acc) => {
    const cust = customers.find((c) => String(c.id) === String(acc.customerId) || c.customerId === acc.customerId);
    return (
      cust?.name.toLowerCase().includes(search.toLowerCase()) ||
      cust?.customerId.toLowerCase().includes(search.toLowerCase()) ||
      cust?.phone.includes(search)
    );
  });

  const selectedAccount = accounts.find((a) => String(a.id) === String(selectedAccountId)) || accounts[0];
  const selectedCust = selectedAccount
    ? customers.find((c) => String(c.id) === String(selectedAccount.customerId) || c.customerId === selectedAccount.customerId)
    : null;

  const numAmount = Math.max(0, Number(amount) || 0);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    if (numAmount <= 0) {
      setFormError("Please enter an amount greater than 0.");
      return;
    }

    if (numAmount > selectedAccount.balance) {
      setFormError(
        `Withdrawal amount of ${formatCurrency(numAmount)} exceeds current account balance of ${formatCurrency(selectedAccount.balance)}.`
      );
      return;
    }

    withdraw(selectedAccount.id, numAmount, note.trim() || "Member Savings Withdrawal");
    setIsWithdrawModalOpen(false);
    toast.success(
      `Withdrawal of ${formatCurrency(numAmount)} Approved`,
      `Account #${selectedAccount.id} debited. New balance: ${formatCurrency(selectedAccount.balance - numAmount)}.`
    );
    setAmount(500);
    setNote("");
    setFormError("");
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    if (numAmount <= 0) {
      setFormError("Please enter an amount greater than 0.");
      return;
    }

    deposit(selectedAccount.id, numAmount, note.trim() || "Member Counter Savings Deposit");
    setIsDepositModalOpen(false);
    toast.success(
      `Deposit of ${formatCurrency(numAmount)} Recorded!`,
      `Account #${selectedAccount.id} credited. New balance: ${formatCurrency(selectedAccount.balance + numAmount)}.`
    );
    setAmount(500);
    setNote("");
    setFormError("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="h-8 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Savings Ledger Render Error">
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Savings & Member Deposits / সঞ্চয় ব্যবস্থাপনা
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Weekly member savings contributions, ledger balances, withdrawals, and interest accumulation.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (accounts.length > 0 && !selectedAccountId) setSelectedAccountId(accounts[0].id);
              setAmount(500);
              setNote("Emergency Withdrawal / জরুরী সঞ্চয় উত্তোলন");
              setFormError("");
              setIsWithdrawModalOpen(true);
            }}
            className="gap-1.5 border-slate-300 dark:border-slate-700 text-rose-700 dark:text-rose-400 hover:bg-rose-50"
          >
            <Minus className="h-4 w-4" />
            Record Withdrawal
          </Button>

          <Button
            variant="default"
            onClick={() => {
              if (accounts.length > 0 && !selectedAccountId) setSelectedAccountId(accounts[0].id);
              setAmount(500);
              setNote("Counter Deposit / কাউন্টারে সঞ্চয় জমা");
              setFormError("");
              setIsDepositModalOpen(true);
            }}
            className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            + Direct Deposit
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Total Member Savings Vault (মোট সঞ্চয় ব্যালেন্স)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 financial-value mt-1">
            {formatCurrency(totalSavingsBalance)}
          </div>
          <span className="text-xs text-emerald-700/80 mt-1 block font-medium">
            {accounts.length} Active Member Savings Vaults
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Lifetime Deposited
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white financial-value mt-1">
            {formatCurrency(totalLifetimeDeposited)}
          </div>
          <span className="text-xs text-teal-700 dark:text-teal-400 mt-1 block font-medium">
            Accumulated Member Equity
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Withdrawn
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white financial-value mt-1">
            {formatCurrency(totalWithdrawn)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Approved Member Disbursals
          </span>
        </div>
      </div>

      {/* Member Accounts List & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Accounts List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl p-4">
            <Input
              placeholder="Search member name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </Card>

          <Card className="rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 text-[11px] uppercase tracking-wider text-left">
                    <th className="py-3 px-4 font-semibold">Member</th>
                    <th className="py-3 px-4 font-semibold">Weekly Target</th>
                    <th className="py-3 px-4 font-semibold">Total Deposited</th>
                    <th className="py-3 px-4 font-semibold">Withdrawn</th>
                    <th className="py-3 px-4 font-semibold text-right">Vault Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-2">
                        <EmptyState
                          variant="savings"
                          title={search ? "No Accounts Match Search" : "No Savings Accounts"}
                          titleBn="কোনো সঞ্চয় হিসাব পাওয়া যায়নি"
                          description={
                            search
                              ? `No savings account found for "${search}". Try searching by customer name or phone.`
                              : "Member savings accounts are automatically generated upon KYC registration."
                          }
                          actionText={search ? "Clear Search" : undefined}
                          onAction={search ? () => setSearch("") : undefined}
                          className="border-none bg-transparent shadow-none"
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const cust = customers.find((c) => c.id === acc.customerId);
                      return (
                        <tr
                          key={acc.id}
                          onClick={() => setSelectedAccountId(acc.id)}
                          className={`cursor-pointer transition-colors ${
                            selectedAccountId === acc.id
                              ? "bg-teal-50/70 dark:bg-teal-950/40 font-semibold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {cust?.name || "Member"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cust?.customerId} • {cust?.phone}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-500">
                            ৳200 / week
                          </td>

                          <td className="py-3 px-4 financial-value text-slate-700 dark:text-slate-300">
                            {formatCurrency(acc.totalDeposited)}
                          </td>

                          <td className="py-3 px-4 financial-value text-rose-600 dark:text-rose-400">
                            {formatCurrency(acc.totalWithdrawn)}
                          </td>

                          <td className="py-3 px-4 text-right financial-value font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                            {formatCurrency(acc.balance)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Selected Member Recent Ledger */}
        <div>
          <Card className="rounded-2xl p-5 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Selected Member Ledger
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedCust?.name || "Member"} ({selectedCust?.customerId})
              </h3>
              <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 financial-value mt-1">
                Vault Balance: {formatCurrency(selectedAccount?.balance || 0)}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transaction History
              </span>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {selectedAccount?.transactions.length === 0 ? (
                  <p className="text-xs text-slate-400">No transactions recorded yet.</p>
                ) : (
                  selectedAccount?.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={tx.type === "deposit" ? "success" : "destructive"}
                            className="text-[9px] uppercase"
                          >
                            {tx.type}
                          </Badge>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{tx.note}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">
                          {formatDateTime(tx.date).split(",")[0]}
                        </div>
                        <div className="font-bold financial-value text-slate-700 dark:text-slate-300 text-[11px]">
                          Bal: {formatCurrency(tx.balanceAfter)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Record Withdrawal Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-rose-600" />
              <span>Member Savings Withdrawal / সঞ্চয় উত্তোলন</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleWithdrawSubmit} className="space-y-3.5 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Select Member Account *
              </label>
              <select
                value={selectedAccountId || ""}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  setFormError("");
                }}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
              >
                {accounts.map((a) => {
                  const cust = customers.find((c) => c.id === a.customerId);
                  return (
                    <option key={a.id} value={a.id}>
                      {cust?.name} ({cust?.customerId}) — Balance: {formatCurrency(a.balance)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Withdrawal Amount (৳) *
                </label>
                <span className="text-[11px] text-slate-500">
                  Available: {formatCurrency(selectedAccount?.balance || 0)}
                </span>
              </div>
              <Input
                type="number"
                min="50"
                step="50"
                value={amount || ""}
                onChange={(e) => {
                  setAmount(Number(e.target.value) || 0);
                  setFormError("");
                }}
                className="font-bold financial-value mt-1"
                required
              />
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>Remaining Balance:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(Math.max(0, (selectedAccount?.balance || 0) - numAmount))}
                </span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Reason / Note *
              </label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Medical Expense, Festival, Business"
                className="mt-1"
              />
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Disburse Withdrawal {formatCurrency(numAmount)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Deposit Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Banknote className="h-5 w-5" />
              Member Voluntary Deposit / ঐচ্ছিক সঞ্চয় জমা
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleDepositSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Member Savings Account
              </label>
              <select
                value={selectedAccountId || ""}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-teal-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {accounts.map((acc) => {
                  const cust = customers.find((c) => c.id === acc.customerId);
                  return (
                    <option key={acc.id} value={acc.id}>
                      {cust?.name} ({cust?.customerId}) • Current: {formatCurrency(acc.balance)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Deposit Amount (BDT)
              </label>
              <Input
                type="number"
                min="50"
                step="50"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1"
                placeholder="Enter deposit amount..."
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Deposit Note / Reference
              </label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 text-xs"
                placeholder="e.g. Monthly voluntary installment"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsDepositModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
              >
                Confirm Deposit {formatCurrency(numAmount)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </ErrorBoundary>
  );
};
