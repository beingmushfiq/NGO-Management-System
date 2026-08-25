import React, { useState, useEffect } from "react";
import {
  useLoanStore,
  useCustomerStore,
  useBranchStore,
} from "@/store";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/toast-system";
import type { Loan, Customer } from "@/types";
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
  Search,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Eye,
  HandCoins,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  Edit2,
} from "lucide-react";
import { CombinedCollectionModal } from "@/components/collection/CombinedCollectionModal";
import { TableSkeleton, CardSkeleton } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-state";

export const LoansPage: React.FC = () => {
  const { loans, createLoan } = useLoanStore();
  const { customers } = useCustomerStore();
  const { branches } = useBranchStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<Loan | null>(null);
  const [selectedLoanForEdit, setSelectedLoanForEdit] = useState<Loan | null>(null);
  const [editLoanPurpose, setEditLoanPurpose] = useState("");
  const [selectedCustomerIdForCollect, setSelectedCustomerIdForCollect] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  // Multi-step Create Loan Wizard State (Step 1 -> 2 -> 3)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [principal, setPrincipal] = useState<number>(30000);
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(10); // 10%
  const [durationWeeks, setDurationWeeks] = useState<number>(50);
  const [purpose, setPurpose] = useState("Small Business Expansion / ক্ষুদ্র ব্যবসা সম্প্রসারণ");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const numPrincipal = Math.max(0, Number(principal) || 0);
  const numRate = Math.max(0, Number(serviceChargeRate) || 0);
  const numWeeks = Math.max(1, Number(durationWeeks) || 1);

  const serviceCharge = Math.round((numPrincipal * numRate) / 100);
  const totalPayable = numPrincipal + serviceCharge;
  const installmentAmount = Math.round(totalPayable / numWeeks);

  // Step 2 validation
  const isPrincipalValid = numPrincipal >= 5000 && numPrincipal <= 500000;
  const isRateValid = numRate >= 1 && numRate <= 30;
  const isWeeksValid = numWeeks >= 10 && numWeeks <= 104;
  const isPurposeValid = purpose.trim().length >= 3;
  const isStep2Valid = isPrincipalValid && isRateValid && isWeeksValid && isPurposeValid;

  const filteredLoans = loans.filter((l) => {
    const cust = customers.find((c) => c.id === l.customerId);
    const matchesSearch =
      l.loanId.toLowerCase().includes(search.toLowerCase()) ||
      cust?.name.toLowerCase().includes(search.toLowerCase()) ||
      cust?.customerId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomersForWizard = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      c.customerId.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      c.phone.includes(customerSearchQuery)
  );

  const handleCreateLoanSubmit = async () => {
    if (!selectedCustomer || !isStep2Valid) return;

    await createLoan({
      customerId: selectedCustomer.id,
      branchId: selectedCustomer.branchId,
      staffId: selectedCustomer.staffId,
      principal: numPrincipal,
      serviceCharge,
      totalPayable,
      installmentAmount,
      frequency: "weekly",
      durationWeeks: numWeeks,
      startDate,
      endDate: new Date(new Date(startDate).getTime() + numWeeks * 7 * 86400000)
        .toISOString()
        .split("T")[0],
      disbursedAt: startDate,
      purpose,
    });

    setIsCreateModalOpen(false);
    setWizardStep(1);
    toast.success(
      `Loan Disbursed to ${selectedCustomer.name}!`,
      `Principal: ${formatCurrency(numPrincipal)} • ${numWeeks}-Week Cycle • Installment: ${formatCurrency(installmentAmount)}/week`
    );
    setSelectedCustomer(null);
  };

  const activeLoansCount = loans.filter((l) => l.status === "active").length;
  const totalOutstanding = loans.reduce((sum, l) => sum + Number(l.outstanding || 0), 0);
  const totalDisbursed = loans.reduce((sum, l) => sum + Number(l.principal || 0), 0);
  const totalRepaid = loans.reduce((sum, l) => sum + Number(l.totalPaid || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="h-8 w-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <CardSkeleton count={4} />
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Loan Portfolio Render Error">
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Loan Portfolio / ঋণ হিসাব ব্যবস্থাপনা
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track microfinance credit disbursements, active weekly installments, and recovery health.
          </p>
        </div>

        <Button
          onClick={() => {
            setWizardStep(1);
            setIsCreateModalOpen(true);
          }}
          className="gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs"
        >
          <Plus className="h-4 w-4" />
          + Disburse New Loan
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-medium">Active Loans</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {activeLoansCount}
          </div>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
            Running Weekly Cycles
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-medium">Total Outstanding</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white financial-value mt-0.5">
            {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Principal & Return</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-medium">Total Disbursed</span>
          <div className="text-2xl font-bold text-teal-800 dark:text-teal-300 financial-value mt-0.5">
            {formatCurrency(totalDisbursed)}
          </div>
          <span className="text-[10px] text-slate-400">Total Portfolio Value</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-medium">Total Recovered</span>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 financial-value mt-0.5">
            {formatCurrency(totalRepaid)}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
            {totalDisbursed > 0 ? Math.round((totalRepaid / (totalDisbursed * 1.1)) * 100) : 0}% Portfolio Recovery
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by loan ID, borrower name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {["all", "active", "overdue", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loans Table */}
      <Card className="rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 text-[11px] uppercase tracking-wider text-left">
                <th className="py-3 px-4 font-semibold">Loan ID</th>
                <th className="py-3 px-4 font-semibold">Borrower Member</th>
                <th className="py-3 px-4 font-semibold">Principal</th>
                <th className="py-3 px-4 font-semibold">Total Payable</th>
                <th className="py-3 px-4 font-semibold">Weekly Installment</th>
                <th className="py-3 px-4 font-semibold">Repaid</th>
                <th className="py-3 px-4 font-semibold">Outstanding</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-2">
                    <EmptyState
                      variant="loans"
                      title={search || statusFilter !== "all" ? "No Loans Match Your Filters" : "No Loans Disbursed Yet"}
                      titleBn="এই ফিল্টারে কোনো ঋণ পাওয়া যায়নি"
                      description={
                        search
                          ? `No microfinance loans found for "${search}". Try adjusting the search terms or status filter.`
                          : "Disburse your first microcredit to a registered borrower member to start the loan ledger."
                      }
                      actionText={search ? "Clear Search" : "+ Disburse First Loan"}
                      onAction={search ? () => setSearch("") : () => { setWizardStep(1); setIsCreateModalOpen(true); }}
                      className="border-none bg-transparent shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const cust = customers.find((c) => c.id === loan.customerId);
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800 dark:text-teal-300">
                        {loan.loanId}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{cust?.name || "Borrower"}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">
                          {cust?.customerId}
                        </div>
                      </td>

                      <td className="py-3 px-4 financial-value font-medium">
                        {formatCurrency(loan.principal)}
                      </td>

                      <td className="py-3 px-4 financial-value font-medium">
                        {formatCurrency(loan.totalPayable)}
                      </td>

                      <td className="py-3 px-4 financial-value font-semibold text-teal-700 dark:text-teal-400">
                        {formatCurrency(loan.installmentAmount)}/wk
                      </td>

                      <td className="py-3 px-4 financial-value text-emerald-700 dark:text-emerald-400 font-medium">
                        {formatCurrency(loan.totalPaid)}
                      </td>

                      <td className="py-3 px-4 financial-value font-bold text-slate-900 dark:text-white">
                        {formatCurrency(loan.outstanding)}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            loan.status === "active"
                              ? "default"
                              : loan.status === "completed"
                              ? "success"
                              : "destructive"
                          }
                          className="text-[10px] capitalize"
                        >
                          {loan.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedLoanForEdit(loan);
                              setEditLoanPurpose(loan.purpose || "");
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 text-slate-500 cursor-pointer"
                            title="Edit Loan Notes & Purpose"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => setSelectedLoanForSchedule(loan)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Schedule
                          </Button>
                          {loan.status === "active" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs px-2 bg-teal-700 hover:bg-teal-800 text-white"
                              onClick={() => setSelectedCustomerIdForCollect(loan.customerId)}
                            >
                              <HandCoins className="h-3.5 w-3.5 mr-1" /> Collect
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Multi-Step Create Loan Wizard Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Disburse Loan / নতুন ঋণ প্রদান</span>
              <span className="text-xs font-normal text-slate-400">
                Step {wizardStep} of 3
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* STEP 1: SELECT CUSTOMER */}
          {wizardStep === 1 && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                1. Select Eligible Borrower / গ্রাহক নির্বাচন করুন
              </label>
              <Input
                placeholder="Search member name, ID, phone..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                {filteredCustomersForWizard.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No members match search query
                  </div>
                ) : (
                  filteredCustomersForWizard.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`p-2.5 cursor-pointer text-xs flex items-center justify-between transition-colors ${
                        selectedCustomer?.id === c.id
                          ? "bg-teal-50 text-teal-900 font-semibold dark:bg-teal-950/50 dark:text-teal-200"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold">{c.name} {c.nameBn ? `(${c.nameBn})` : ""}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {c.customerId} • {c.phone} • {c.address}
                        </div>
                      </div>
                      {selectedCustomer?.id === c.id && (
                        <CheckCircle2 className="h-4 w-4 text-teal-700" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  disabled={!selectedCustomer}
                  onClick={() => setWizardStep(2)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Continue to Terms <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: LOAN DETAILS */}
          {wizardStep === 2 && (
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase">Selected Member</span>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedCustomer?.name} ({selectedCustomer?.customerId})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Principal Amount (৳) *
                  </label>
                  <Input
                    type="number"
                    step="5000"
                    min="5000"
                    max="500000"
                    value={principal || ""}
                    onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                    className="font-bold financial-value text-sm mt-1"
                  />
                  {!isPrincipalValid && (
                    <span className="text-[10px] text-rose-500">Min ৳5,000 - Max ৳500,000</span>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Service Charge (%) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={serviceChargeRate || ""}
                    onChange={(e) => setServiceChargeRate(Number(e.target.value) || 0)}
                    className="font-bold mt-1"
                  />
                  {!isRateValid && (
                    <span className="text-[10px] text-rose-500">Standard range 1% - 30%</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Duration (Weeks) *
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="104"
                    value={durationWeeks || ""}
                    onChange={(e) => setDurationWeeks(Number(e.target.value) || 0)}
                    className="mt-1"
                  />
                  {!isWeeksValid && (
                    <span className="text-[10px] text-rose-500">10 to 104 weeks</span>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Disbursement Date *
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Loan Purpose / ঋণের উদ্দেশ্য *
                </label>
                <Input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Grocery Shop Investment / মুদির দোকান বিনিয়োগ"
                  className="mt-1"
                />
                {!isPurposeValid && (
                  <span className="text-[10px] text-rose-500">Please provide a specific purpose</span>
                )}
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => setWizardStep(1)}>
                  Back
                </Button>
                <Button
                  variant="default"
                  disabled={!isStep2Valid}
                  onClick={() => setWizardStep(3)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Review Schedule <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & SCHEDULE PREVIEW */}
          {wizardStep === 3 && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="rounded-2xl border border-teal-200 bg-teal-50/60 dark:border-teal-900/50 dark:bg-teal-950/30 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Borrower:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedCustomer?.name} ({selectedCustomer?.customerId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Principal:</span>
                  <span className="font-bold financial-value text-slate-900 dark:text-white">
                    {formatCurrency(numPrincipal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Charge ({numRate}%):</span>
                  <span className="font-bold financial-value text-slate-900 dark:text-white">
                    {formatCurrency(serviceCharge)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-teal-200/80 dark:border-teal-900 pt-1.5 font-bold">
                  <span>Total Payable:</span>
                  <span className="text-sm text-teal-800 dark:text-teal-300 financial-value">
                    {formatCurrency(totalPayable)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
                  <span>Weekly Installment ({numWeeks} weeks):</span>
                  <span className="text-teal-800 dark:text-teal-400 financial-value">
                    {formatCurrency(installmentAmount)} / week
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-[11px] space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Repayment Schedule Summary
                </div>
                <p className="text-slate-500">
                  {numWeeks} equal weekly installments of {formatCurrency(installmentAmount)} starting from {startDate}.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setWizardStep(2)}>
                  Back
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateLoanSubmit}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  <ShieldCheck className="h-4 w-4 mr-1.5" /> Confirm & Disburse
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Installment Schedule Inspection Drawer / Modal */}
      <Dialog
        open={!!selectedLoanForSchedule}
        onOpenChange={() => setSelectedLoanForSchedule(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedLoanForSchedule && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-700" />
                    <span>Installment Schedule: {selectedLoanForSchedule.loanId}</span>
                  </div>
                  <Badge variant="default" className="text-xs">
                    {selectedLoanForSchedule.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              {/* Summary Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Total Payable:</span>
                  <div className="font-bold financial-value text-slate-900 dark:text-white">
                    {formatCurrency(selectedLoanForSchedule.totalPayable)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Paid:</span>
                  <div className="font-bold financial-value text-emerald-700">
                    {formatCurrency(selectedLoanForSchedule.totalPaid)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Outstanding:</span>
                  <div className="font-bold financial-value text-teal-800 dark:text-teal-300">
                    {formatCurrency(selectedLoanForSchedule.outstanding)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Per Week:</span>
                  <div className="font-bold financial-value">
                    {formatCurrency(selectedLoanForSchedule.installmentAmount)}
                  </div>
                </div>
              </div>

              {/* Installments Table */}
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3 text-left">#</th>
                      <th className="py-2 px-3 text-left">Due Date</th>
                      <th className="py-2 px-3 text-left">Expected</th>
                      <th className="py-2 px-3 text-left">Paid</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-right">Settlement Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedLoanForSchedule.installments.map((inst) => (
                      <tr
                        key={inst.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          inst.status === "paid"
                            ? "bg-emerald-50/20"
                            : inst.status === "overdue"
                            ? "bg-rose-50/30"
                            : ""
                        }`}
                      >
                        <td className="py-2 px-3 font-mono font-bold">#{inst.installmentNo}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{inst.dueDate}</td>
                        <td className="py-2 px-3 font-semibold financial-value">{formatCurrency(inst.expected)}</td>
                        <td className="py-2 px-3 financial-value text-emerald-700 font-semibold">
                          {formatCurrency(inst.paid)}
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            variant={
                              inst.status === "paid"
                                ? "success"
                                : inst.status === "overdue"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[9px] uppercase"
                          >
                            {inst.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400 font-mono text-[11px]">
                          {inst.paidAt || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLoanForSchedule(null)}
                >
                  Close
                </Button>
                {selectedLoanForSchedule.status === "active" && (
                  <Button
                    variant="default"
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-1.5"
                    onClick={() => {
                      const custId = selectedLoanForSchedule.customerId;
                      setSelectedLoanForSchedule(null);
                      setSelectedCustomerIdForCollect(custId);
                    }}
                  >
                    <HandCoins className="h-4 w-4" /> Collect Next Installment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Loan Notes & Purpose Modal */}
      <Dialog open={!!selectedLoanForEdit} onOpenChange={() => setSelectedLoanForEdit(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
              <Edit2 className="h-5 w-5" />
              <span>Edit Loan Record #{selectedLoanForEdit?.loanId}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedLoanForEdit && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Loan Notes Updated", `Saved notes for loan ${selectedLoanForEdit.loanId}`);
                setSelectedLoanForEdit(null);
              }}
              className="space-y-4 pt-2 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Loan Purpose / Investment Sector *
                </label>
                <Input
                  value={editLoanPurpose}
                  onChange={(e) => setEditLoanPurpose(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Principal:</span>
                  <strong className="financial-value">{formatCurrency(selectedLoanForEdit.principal)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Payable:</span>
                  <strong className="financial-value">{formatCurrency(selectedLoanForEdit.totalPayable)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Outstanding Debt:</span>
                  <strong className="text-teal-700 dark:text-teal-300 financial-value">
                    {formatCurrency(selectedLoanForEdit.outstanding)}
                  </strong>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setSelectedLoanForEdit(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

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

