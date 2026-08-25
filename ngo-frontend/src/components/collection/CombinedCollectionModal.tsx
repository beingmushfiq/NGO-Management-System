import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useCustomerStore,
  useLoanStore,
  useSavingsStore,
  useCollectionStore,
  useAuthStore,
} from "@/store";
import type { Customer, Loan, SavingsAccount, Installment, Collection, PaymentMethod } from "@/types";
import { formatCurrency, getInitials } from "@/lib/utils";
import { toast } from "@/components/ui/toast-system";
import { AccountAllocationViz } from "./AccountAllocationViz";
import { ReceiptView } from "./ReceiptView";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Smartphone,
  Landmark,
  User as UserIcon,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CombinedCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
}

export const CombinedCollectionModal: React.FC<CombinedCollectionModalProps> = ({
  isOpen,
  onClose,
  preselectedCustomerId,
}) => {
  const currentUser = useAuthStore((s) => s.user);
  const customers = useCustomerStore((s) => s.customers);
  const loans = useLoanStore((s) => s.loans);
  const savingsAccounts = useSavingsStore((s) => s.accounts);
  const submitCollection = useCollectionStore((s) => s.submitCollection);

  // Flow step: "form" | "confirm" | "success"
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Amounts
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [savingsAmount, setSavingsAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentRef, setPaymentRef] = useState("");

  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [nextInstallment, setNextInstallment] = useState<Installment | null>(null);
  const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCollection, setCreatedCollection] = useState<Collection | null>(null);

  // Initialize customer if preselected
  useEffect(() => {
    if (isOpen) {
      if (preselectedCustomerId) {
        const cust = customers.find((c) => c.id === preselectedCustomerId);
        if (cust) selectCustomer(cust);
      } else {
        resetState();
      }
    }
  }, [isOpen, preselectedCustomerId]);

  const resetState = () => {
    setStep("form");
    setSelectedCustomer(null);
    setActiveLoan(null);
    setNextInstallment(null);
    setSavingsAccount(null);
    setLoanAmount(0);
    setSavingsAmount(0);
    setPaymentMethod("cash");
    setPaymentRef("");
    setCreatedCollection(null);
    setSearchQuery("");
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Find active loan
    const custLoans = loans.filter(
      (l) => l.customerId === customer.id && (l.status === "active" || l.status === "overdue")
    );
    const loan = custLoans[0] || null;
    setActiveLoan(loan);

    // Find next unpaid installment
    if (loan) {
      const inst = loan.installments.find((i) => i.status !== "paid");
      setNextInstallment(inst || null);
      setLoanAmount(inst ? inst.expected : loan.installmentAmount);
    } else {
      setNextInstallment(null);
      setLoanAmount(0);
    }

    // Find savings account
    const acc = savingsAccounts.find((a) => a.customerId === customer.id) || null;
    setSavingsAccount(acc);
    setSavingsAmount(200); // Standard weekly savings default
  };

  // Filter customers by search
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const numLoanAmount = Math.max(0, Number(loanAmount) || 0);
  const numSavingsAmount = Math.max(0, Number(savingsAmount) || 0);
  const totalAmount = numLoanAmount + numSavingsAmount;

  // Validation checks
  const loanOverdraw = activeLoan && numLoanAmount > activeLoan.outstanding;
  const isInvalid =
    !selectedCustomer ||
    totalAmount <= 0 ||
    loanOverdraw ||
    (numLoanAmount > 0 && !activeLoan) ||
    (numSavingsAmount > 0 && !savingsAccount);

  const getValidationMessage = () => {
    if (!selectedCustomer) return "Please select a member to proceed.";
    if (loanOverdraw)
      return `Loan repayment of ${formatCurrency(numLoanAmount)} exceeds outstanding balance of ${formatCurrency(activeLoan?.outstanding || 0)}.`;
    if (totalAmount <= 0) return "Please specify a loan installment or savings deposit amount.";
    return null;
  };

  const handleConfirmSubmit = async () => {
    if (!selectedCustomer || isInvalid) return;

    setIsSubmitting(true);

    try {
      const collection = await submitCollection({
        customerId: selectedCustomer.id,
        loanId: activeLoan?.id || (loans.find((l) => l.customerId === selectedCustomer.id)?.id || "ln-01"),
        installmentId: nextInstallment?.id || "inst-01",
        savingsAccountId: savingsAccount?.id || (savingsAccounts.find((a) => a.customerId === selectedCustomer.id)?.id || "sav-01"),
        branchId: selectedCustomer.branchId,
        staffId: currentUser?.id || "st-02",
        loanAmount: numLoanAmount,
        savingsAmount: numSavingsAmount,
        paymentMethod,
        paymentReference: paymentRef || undefined,
        loanBalanceBefore: activeLoan?.outstanding || 0,
        savingsBalanceBefore: savingsAccount?.balance || 0,
        installmentNo: nextInstallment?.installmentNo || 1,
      });

      setCreatedCollection(collection);
      setIsSubmitting(false);
      setStep("success");
      toast.success(
        `Collected ${formatCurrency(totalAmount)} Successfully!`,
        `Receipt #${collection.receiptNo} created for ${selectedCustomer.name} (Loan: ${formatCurrency(numLoanAmount)}, Savings: ${formatCurrency(numSavingsAmount)})`
      );
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error("Collection Failed", err.message || "Could not record collection.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Combined Collection / যৌথ কিস্তি ও সঞ্চয় আদায়
            </span>
            <Badge variant="default" className="text-xs">
              Instant Dual Account Settlement
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* STEP 1: FORM INPUT */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 pt-2"
            >
              {/* Customer Selector / Summary */}
              {!selectedCustomer ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Select Member / গ্রাহক নির্বাচন করুন
                  </label>
                  <Input
                    placeholder="Search name, ID (CUS-1024), phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 dark:divide-slate-800">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No members found matching "{searchQuery}"
                      </div>
                    ) : (
                      filteredCustomers.slice(0, 6).map((cust) => {
                        const custLoan = loans.find(
                          (l) => l.customerId === cust.id && (l.status === "active" || l.status === "overdue")
                        );
                        const custSavings = savingsAccounts.find((s) => s.customerId === cust.id);
                        return (
                          <div
                            key={cust.id}
                            onClick={() => selectCustomer(cust)}
                            className="p-2.5 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xs">
                                {getInitials(cust.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                                  {cust.name} {cust.nameBn ? `(${cust.nameBn})` : ""}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {cust.customerId} • {cust.phone}
                                </div>
                              </div>
                            </div>

                            <div className="text-right text-[11px]">
                              {custLoan ? (
                                <div className="text-slate-700 dark:text-slate-300 font-medium">
                                  Due: {formatCurrency(custLoan.installmentAmount)}
                                </div>
                              ) : (
                                <span className="text-slate-400">No active loan</span>
                              )}
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                Savings: {formatCurrency(custSavings?.balance || 0)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* Customer Info Card */
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                        {getInitials(selectedCustomer.name)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{selectedCustomer.name}</span>
                          <Badge variant="default" className="text-[10px]">
                            {selectedCustomer.customerId}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selectedCustomer.phone} • {selectedCustomer.address}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 text-slate-500"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Change Member
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px]">Loan Outstanding:</span>
                      <div className="font-bold text-slate-800 dark:text-slate-200 financial-value">
                        {activeLoan ? formatCurrency(activeLoan.outstanding) : "৳0 (No Loan)"}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Savings Balance:</span>
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 financial-value">
                        {formatCurrency(savingsAccount?.balance || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Installment Due:</span>
                      <div className="font-bold text-teal-800 dark:text-teal-300 financial-value">
                        {nextInstallment ? formatCurrency(nextInstallment.expected) : "৳0"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Inputs */}
              {selectedCustomer && (
                <>
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" /> Presets:
                    </span>
                    {nextInstallment && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoanAmount(nextInstallment.expected);
                          setSavingsAmount(200);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-teal-200 bg-teal-50 text-[11px] font-medium text-teal-900 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200 cursor-pointer"
                      >
                        Standard Due ({formatCurrency(nextInstallment.expected + 200)})
                      </button>
                    )}
                    {activeLoan && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoanAmount(activeLoan.outstanding);
                          setSavingsAmount(0);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                      >
                        Clear Loan ({formatCurrency(activeLoan.outstanding)})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setLoanAmount(0);
                        setSavingsAmount(500);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 cursor-pointer"
                    >
                      Savings Only (৳500)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Loan input */}
                    <div
                      className={`space-y-1.5 rounded-xl border p-3.5 ${
                        loanOverdraw
                          ? "border-rose-300 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Landmark className="h-4 w-4 text-teal-700" />
                          Loan Installment / ঋণের কিস্তি
                        </label>
                        {nextInstallment && (
                          <span className="text-[10px] text-slate-500">
                            Expected: {formatCurrency(nextInstallment.expected)}
                          </span>
                        )}
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="50"
                        disabled={!activeLoan}
                        value={loanAmount === 0 ? "" : loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                        className="text-base font-bold financial-value text-teal-800 dark:text-teal-300"
                        placeholder="0"
                      />
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>
                          {activeLoan
                            ? `Installment #${nextInstallment?.installmentNo || 1}`
                            : "No active loan"}
                        </span>
                        <span>
                          Remaining:{" "}
                          {formatCurrency(
                            Math.max(0, (activeLoan?.outstanding || 0) - numLoanAmount)
                          )}
                        </span>
                      </div>
                      {loanOverdraw && (
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                          Cannot exceed balance ({formatCurrency(activeLoan?.outstanding || 0)})
                        </p>
                      )}
                    </div>

                    {/* Savings input */}
                    <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Banknote className="h-4 w-4 text-emerald-600" />
                          Savings Contribution / সঞ্চয় জমা
                        </label>
                        <span className="text-[10px] text-slate-500">
                          Current: {formatCurrency(savingsAccount?.balance || 0)}
                        </span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="50"
                        value={savingsAmount === 0 ? "" : savingsAmount}
                        onChange={(e) => setSavingsAmount(Number(e.target.value) || 0)}
                        className="text-base font-bold financial-value text-emerald-700 dark:text-emerald-400"
                        placeholder="0"
                      />
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Deposit Amount</span>
                        <span>
                          New Balance:{" "}
                          {formatCurrency(
                            (savingsAccount?.balance || 0) + numSavingsAmount
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Payment Mode / পরিশোধ মাধ্যম
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "cash", label: "Cash / নগদ", icon: Banknote },
                        { id: "mobile_banking", label: "bKash / Nagad", icon: Smartphone },
                        { id: "bank", label: "Bank Transfer", icon: Landmark },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = paymentMethod === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "border-teal-600 bg-teal-50 text-teal-900 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200 shadow-xs font-bold"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {paymentMethod !== "cash" && (
                      <Input
                        placeholder="Enter Transaction ID / Reference (e.g. TRX992813)..."
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        className="text-xs mt-2"
                      />
                    )}
                  </div>

                  {/* Account Allocation Flow Diagram */}
                  <AccountAllocationViz
                    loanAmount={numLoanAmount}
                    savingsAmount={numSavingsAmount}
                    totalAmount={totalAmount}
                    loanBalanceBefore={activeLoan?.outstanding || 0}
                    savingsBalanceBefore={savingsAccount?.balance || 0}
                  />

                  {/* Validation Error Message if invalid */}
                  {getValidationMessage() && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{getValidationMessage()}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs">
                      <span className="text-slate-500">Total Settlement: </span>
                      <span className="font-extrabold text-base text-teal-800 dark:text-teal-300 financial-value">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        disabled={isInvalid}
                        onClick={() => setStep("confirm")}
                        className="min-w-35 font-semibold bg-teal-700 hover:bg-teal-800 text-white"
                      >
                        Review & Collect
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* STEP 2: CONFIRMATION */}
          {step === "confirm" && selectedCustomer && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 pt-2"
            >
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold">Please verify the financial allocation</span>
                  <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                    Once confirmed, this transaction will atomically update both loan and savings records, generate a digital receipt, and reflect in daily audit reports.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedCustomer.name} ({selectedCustomer.customerId})
                  </span>
                </div>

                {numLoanAmount > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Loan Installment:</span>
                    <span className="font-semibold financial-value text-teal-700 dark:text-teal-400">
                      {formatCurrency(numLoanAmount)}
                    </span>
                  </div>
                )}

                {numSavingsAmount > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Savings Deposit:</span>
                    <span className="font-semibold financial-value text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(numSavingsAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="uppercase font-medium text-slate-700 dark:text-slate-300">
                    {paymentMethod.replace("_", " ")} {paymentRef ? `(${paymentRef})` : ""}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-sm">TOTAL AMOUNT:</span>
                  <span className="font-extrabold text-xl text-teal-800 dark:text-teal-300 financial-value">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep("form")} disabled={isSubmitting}>
                  Back / Edit
                </Button>
                <Button
                  variant="default"
                  isLoading={isSubmitting}
                  onClick={handleConfirmSubmit}
                  className="min-w-40 bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Confirm & Collect {formatCurrency(totalAmount)}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS & RECEIPT */}
          {step === "success" && createdCollection && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="space-y-4 pt-2"
            >
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Collection Successful! / আদায় সফল হয়েছে</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Receipt #{createdCollection.receiptNo} generated and ledger updated.
                  </div>
                </div>
              </div>

              <ReceiptView
                collection={createdCollection}
                onClose={() => {
                  onClose();
                  resetState();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
