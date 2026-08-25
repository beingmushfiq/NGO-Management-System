import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCustomerStore,
  useLoanStore,
  useSavingsStore,
  useCollectionStore,
  useBranchStore,
  useAuditStore,
} from "@/store";
import { formatCurrency, formatDateTime, getInitials } from "@/lib/utils";
import type { Collection } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  HandCoins,
  CreditCard,
  PiggyBank,
  Receipt,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { CombinedCollectionModal } from "@/components/collection/CombinedCollectionModal";
import { ReceiptView } from "@/components/collection/ReceiptView";
import { toast } from "@/components/ui/toast-system";
import { ErrorBoundary } from "@/components/ui/error-state";

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { customers, updateCustomer } = useCustomerStore();
  const { loans } = useLoanStore();
  const { accounts, deposit } = useSavingsStore();
  const { collections } = useCollectionStore();
  const { branches } = useBranchStore();

  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(200);
  const [depositNote, setDepositNote] = useState("Weekly Savings Contribution");
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<Collection | null>(null);

  // Edit Customer Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    nameBn: "",
    phone: "",
    nid: "",
    address: "",
    occupation: "",
    guarantorName: "",
    guarantorPhone: "",
    branchId: "",
  });

  const customer = customers.find((c) => String(c.id) === String(id) || c.customerId === id);
  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Customer Not Found</h2>
        <Button onClick={() => navigate("/admin/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const branch = branches.find((b) => String(b.id) === String(customer.branchId));
  const custLoans = loans.filter((l) => String(l.customerId) === String(customer.id));
  const activeLoan = custLoans.find((l) => l.status === "active" || l.status === "overdue");
  const savings = accounts.find((a) => String(a.customerId) === String(customer.id));
  const custCollections = collections.filter((c) => String(c.customerId) === String(customer.id));

  const totalCollected = custCollections.reduce((s, c) => s + Number(c.totalAmount || 0), 0);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savings || depositAmount <= 0) return;
    deposit(savings.id, depositAmount, depositNote);
    setIsDepositModalOpen(false);
  };

  const handleStartEdit = () => {
    setEditFormData({
      name: customer.name,
      nameBn: customer.nameBn || "",
      phone: customer.phone,
      nid: customer.nid,
      address: customer.address,
      occupation: customer.occupation || "Self Employed",
      guarantorName: customer.guarantorName || "",
      guarantorPhone: customer.guarantorPhone || "",
      branchId: customer.branchId,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCustomer(customer.id, {
      name: editFormData.name.trim(),
      nameBn: editFormData.nameBn.trim() || undefined,
      phone: editFormData.phone.trim(),
      nid: editFormData.nid.trim(),
      address: editFormData.address.trim(),
      occupation: editFormData.occupation.trim(),
      guarantorName: editFormData.guarantorName.trim() || undefined,
      guarantorPhone: editFormData.guarantorPhone.trim() || undefined,
      branchId: editFormData.branchId,
    });

    useAuditStore.getState().logActivity({
      action: "SETTINGS_UPDATED",
      actionTitle: "Member Profile Updated",
      actionTitleBn: "সদস্য তথ্য সংশোধন",
      actorName: "Branch Officer",
      actorRole: "staff",
      branchName: branch?.name || "Branch",
      targetEntity: `Customer: ${editFormData.name}`,
      targetId: customer.customerId,
      details: `Updated KYC records, contact phone, and residential address.`,
      status: "success",
    });

    setIsEditModalOpen(false);
    toast.success("Member Profile Updated", `Saved changes for ${editFormData.name}.`);
  };

  const handleDeactivateCustomer = () => {
    if (activeLoan && activeLoan.outstanding > 0) {
      toast.error(
        "Cannot Deactivate Member",
        `This member has an active loan with outstanding balance of ${formatCurrency(activeLoan.outstanding)}. Debt must be settled first.`
      );
      return;
    }

    if (window.confirm(`Deactivate member ${customer.name} (${customer.customerId})?`)) {
      updateCustomer(customer.id, { status: "inactive" });
      toast.info("Member Deactivated", `${customer.name} marked as inactive.`);
    }
  };

  return (
    <ErrorBoundary fallbackTitle="Customer Profile Error">
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Back button and top actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/customers")}
            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Customers List
          </button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartEdit}
              className="gap-1.5 text-xs border-slate-300 dark:border-slate-700"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeactivateCustomer}
              className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900"
            >
              <Trash2 className="h-3.5 w-3.5" /> Deactivate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="gap-1.5 no-print text-xs"
            >
              <Printer className="h-3.5 w-3.5" /> Print Statement
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => setIsCollectModalOpen(true)}
              className="gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs text-xs"
            >
              <HandCoins className="h-4 w-4 text-teal-200" /> Collect Payment
            </Button>
          </div>
        </div>

      {/* Hero Profile Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
              {getInitials(customer.name)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {customer.name}
                </h1>
                {customer.nameBn && (
                  <span className="text-sm text-slate-500 font-medium">
                    ({customer.nameBn})
                  </span>
                )}
                <Badge
                  variant={customer.status === "active" ? "success" : "destructive"}
                  className="capitalize text-xs"
                >
                  {customer.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                  ID: {customer.customerId}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {customer.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {customer.address}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {customer.occupation || "Self Employed"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">Branch Office:</span>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {branch?.name || "Main Branch"}
              </div>
              <span className="text-[10px] text-teal-700 font-medium">
                Member since {customer.registeredAt || "2024-01-15"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-teal-50/60 dark:bg-teal-950/30 p-3 border border-teal-100 dark:border-teal-900/40">
            <span className="text-[11px] text-teal-800 dark:text-teal-300 font-semibold uppercase tracking-wider">
              Loan Outstanding
            </span>
            <div className="text-xl font-extrabold text-teal-950 dark:text-teal-100 financial-value mt-0.5">
              {formatCurrency(activeLoan?.outstanding || 0)}
            </div>
            <span className="text-[10px] text-slate-500">
              {activeLoan ? `${activeLoan.durationWeeks} weeks cycle` : "No active loan"}
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-3 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold uppercase tracking-wider">
              Savings Balance
            </span>
            <div className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100 financial-value mt-0.5">
              {formatCurrency(savings?.balance || 0)}
            </div>
            <span className="text-[10px] text-slate-500">
              Total Deposited: {formatCurrency(savings?.totalDeposited || 0)}
            </span>
          </div>

          <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/30 p-3 border border-amber-100 dark:border-amber-900/40">
            <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold uppercase tracking-wider">
              Weekly Installment
            </span>
            <div className="text-xl font-extrabold text-amber-950 dark:text-amber-100 financial-value mt-0.5">
              {formatCurrency(activeLoan?.installmentAmount || 0)}
            </div>
            <span className="text-[10px] text-slate-500">Due every Tuesday</span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Total Collected
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white financial-value mt-0.5">
              {formatCurrency(totalCollected)}
            </div>
            <span className="text-[10px] text-slate-500">
              {custCollections.length} Verified Receipts
            </span>
          </div>
        </div>
      </div>

      {/* Profile Detail Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview / সারসংক্ষেপ</TabsTrigger>
          <TabsTrigger value="loan">Loan Schedule / কিস্তি সিডিউল</TabsTrigger>
          <TabsTrigger value="savings">Savings Ledger / সঞ্চয় লেজার</TabsTrigger>
          <TabsTrigger value="collections">Payment Receipts / রশিদ সমূহ</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Active Loan Progress */}
            {activeLoan ? (
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-teal-700" />
                    Active Loan Summary ({activeLoan.loanId})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Principal Disbursed:</span>
                    <span className="font-semibold financial-value">{formatCurrency(activeLoan.principal)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Service Charge (Interest):</span>
                    <span className="font-semibold financial-value">{formatCurrency(activeLoan.serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Total Payable:</span>
                    <span className="font-bold financial-value text-slate-900 dark:text-white">
                      {formatCurrency(activeLoan.totalPayable)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px]">
                      <span>Repaid: {formatCurrency(activeLoan.totalPaid)}</span>
                      <span className="font-semibold text-teal-700">
                        {Math.round((activeLoan.totalPaid / activeLoan.totalPayable) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{
                          width: `${(activeLoan.totalPaid / activeLoan.totalPayable) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl p-6 text-center text-xs text-slate-400 space-y-3">
                <p>No active loan account for this member</p>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => navigate("/admin/loans")}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  + Disburse New Loan
                </Button>
              </Card>
            )}

            {/* Savings Details */}
            {savings ? (
              <Card className="rounded-2xl">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-emerald-600" />
                    Savings Account Overview
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsDepositModalOpen(true)}
                    className="h-7 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Deposit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Current Balance:</span>
                    <span className="font-bold financial-value text-emerald-700 text-sm">
                      {formatCurrency(savings.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Weekly Target Contribution:</span>
                    <span className="font-semibold financial-value">৳200 / week</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Total Lifetime Deposited:</span>
                    <span className="font-semibold financial-value">{formatCurrency(savings.totalDeposited)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Total Withdrawn:</span>
                    <span className="font-semibold financial-value">{formatCurrency(savings.totalWithdrawn)}</span>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        {/* TAB 2: LOAN INSTALLMENT SCHEDULE */}
        <TabsContent value="loan">
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                50-Week Installment Repayment Schedule / কিস্তি পরিশোধ বিবরণী
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeLoan ? (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <tr className="text-slate-400 text-[11px] uppercase tracking-wider text-left">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3">Expected</th>
                        <th className="py-2.5 px-3">Paid</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Settled At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeLoan.installments.map((inst) => (
                        <tr
                          key={inst.id}
                          className={`hover:bg-slate-50 ${
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
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active loan to display schedule.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SAVINGS LEDGER */}
        <TabsContent value="savings">
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                Member Savings Account Ledger / সঞ্চয় হিসাব খতিয়ান
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savings ? (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <tr className="text-slate-400 text-[11px] uppercase tracking-wider text-left">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Balance After</th>
                        <th className="py-2.5 px-3">Particulars</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {savings.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-500">{formatDateTime(tx.date)}</td>
                          <td className="py-2 px-3">
                            <Badge variant={tx.type === "deposit" ? "success" : "destructive"}>
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 font-semibold financial-value text-emerald-700">
                            +{formatCurrency(tx.amount)}
                          </td>
                          <td className="py-2 px-3 font-bold financial-value text-slate-900 dark:text-white">
                            {formatCurrency(tx.balanceAfter)}
                          </td>
                          <td className="py-2 px-3 text-slate-500">{tx.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: COLLECTIONS / RECEIPTS */}
        <TabsContent value="collections">
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                Payment History & Money Receipts / আদায় রশিদ সমূহ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider text-left">
                      <th className="py-2.5 px-3">Receipt No</th>
                      <th className="py-2.5 px-3">Loan Paid</th>
                      <th className="py-2.5 px-3">Savings Deposited</th>
                      <th className="py-2.5 px-3">Total Collected</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {custCollections.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                          No collection receipts recorded for this member yet.
                        </td>
                      </tr>
                    ) : (
                      custCollections.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-teal-800 dark:text-teal-300">
                            {c.receiptNo}
                          </td>
                          <td className="py-2.5 px-3 financial-value">{formatCurrency(c.loanAmount)}</td>
                          <td className="py-2.5 px-3 financial-value text-emerald-700">
                            {formatCurrency(c.savingsAmount)}
                          </td>
                          <td className="py-2.5 px-3 font-bold financial-value text-slate-900 dark:text-white">
                            {formatCurrency(c.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{formatDateTime(c.collectedAt)}</td>
                          <td className="py-2.5 px-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => setSelectedReceiptForView(c)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> View Receipt
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Collection Modal for this customer */}
      <CombinedCollectionModal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        preselectedCustomerId={customer.id}
      />

      {/* Direct Deposit Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Member Savings Deposit / সঞ্চয় জমা</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleDepositSubmit} className="space-y-3.5 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Deposit Amount (৳) *
              </label>
              <Input
                type="number"
                min="50"
                step="50"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="font-bold financial-value mt-1 text-emerald-700"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Deposit Note
              </label>
              <Input
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsDepositModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                Confirm Deposit {formatCurrency(depositAmount)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
              <Edit2 className="h-5 w-5" />
              <span>Edit Member Profile / সদস্য তথ্য সংশোধন</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-3.5 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Full Name (English) *
              </label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                সদস্যের নাম (বাংলা)
              </label>
              <Input
                value={editFormData.nameBn}
                onChange={(e) => setEditFormData({ ...editFormData, nameBn: e.target.value })}
                className="font-bengali"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Mobile Phone *
                </label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  National ID (NID) *
                </label>
                <Input
                  value={editFormData.nid}
                  onChange={(e) => setEditFormData({ ...editFormData, nid: e.target.value })}
                  className="font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Residential Address *
              </label>
              <Input
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Occupation / পেশা
                </label>
                <Input
                  value={editFormData.occupation}
                  onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Branch
                </label>
                <select
                  value={editFormData.branchId}
                  onChange={(e) => setEditFormData({ ...editFormData, branchId: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Guarantor Name
                </label>
                <Input
                  value={editFormData.guarantorName}
                  onChange={(e) => setEditFormData({ ...editFormData, guarantorName: e.target.value })}
                  placeholder="e.g. Abdul Karim"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Guarantor Phone
                </label>
                <Input
                  value={editFormData.guarantorPhone}
                  onChange={(e) => setEditFormData({ ...editFormData, guarantorPhone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                Save Member Details
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </ErrorBoundary>
  );
};
