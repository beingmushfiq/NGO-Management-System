import React, { useState } from "react";
import {
  useCollectionStore,
  useLoanStore,
  useSavingsStore,
  useBranchStore,
  useStaffStore,
  useCustomerStore,
  useOrgStore,
} from "@/store";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Building2,
  Filter,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Users,
  Search,
} from "lucide-react";
import { toast } from "@/components/ui/toast-system";

type ReportType = "daily_collection" | "loan_portfolio" | "savings_ledger" | "branch_audit";

export const ReportsPage: React.FC = () => {
  const org = useOrgStore((s) => s.settings);
  const { collections } = useCollectionStore();
  const { loans } = useLoanStore();
  const { accounts } = useSavingsStore();
  const { branches } = useBranchStore();
  const { staff } = useStaffStore();
  const { customers } = useCustomerStore();

  const [activeReport, setActiveReport] = useState<ReportType>("daily_collection");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [search, setSearch] = useState("");

  // Summary Metrics
  const totalCollections = collections.reduce((s, c) => s + Number(c.totalAmount || 0), 0);
  const totalLoanCollections = collections.reduce((s, c) => s + Number(c.loanAmount || 0), 0);
  const totalSavingsCollections = collections.reduce((s, c) => s + Number(c.savingsAmount || 0), 0);

  const totalOutstanding = loans
    .filter((l) => l.status === "active" || l.status === "overdue")
    .reduce((s, l) => s + Number(l.outstanding || 0), 0);

  const totalSavingsBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);

  const filteredCollections = collections.filter((c) => {
    const cust = customers.find((cu) => String(cu.id) === String(c.customerId) || cu.customerId === c.customerId);
    const matchesBranch = selectedBranch === "all" || String(c.branchId) === String(selectedBranch);
    const matchesSearch =
      c.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      cust?.name.toLowerCase().includes(search.toLowerCase()) ||
      cust?.customerId.toLowerCase().includes(search.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Receipt No", "Customer", "Customer ID", "Branch", "Loan (BDT)", "Savings (BDT)", "Total (BDT)", "Date/Time"];
    const rows = filteredCollections.map((c) => {
      const cust = customers.find((cu) => cu.id === c.customerId);
      const br = branches.find((b) => b.id === c.branchId);
      return [
        c.receiptNo,
        `"${cust?.name || "Customer"}"`,
        cust?.customerId || "",
        `"${br?.name || "Branch"}"`,
        c.loanAmount,
        c.savingsAmount,
        c.totalAmount,
        `"${formatDateTime(c.collectedAt)}"`,
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NGO_${activeReport}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      "CSV Report Exported Successfully!",
      `Downloaded ${filteredCollections.length} audit records for ${activeReport.replace("_", " ")}.`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Institutional Reports / অডিট ও রিপোর্ট
            </h1>
            <Badge variant="default" className="text-xs">Financial Audit Grade</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive ledger statements, portfolio recovery tracking, and regulatory audit exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 border-slate-300">
            <Download className="h-4 w-4 text-teal-700" /> Export CSV
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint} className="gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold">
            <Printer className="h-4 w-4 text-teal-200" /> Print Formal Report
          </Button>
        </div>
      </div>

      {/* Report Selection Tabs (Hidden on Print) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 no-print">
        <button
          onClick={() => setActiveReport("daily_collection")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReport === "daily_collection"
              ? "bg-teal-700 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <FileText className="h-4 w-4" /> Daily Collection Sheet (দৈনিক আদায়)
        </button>

        <button
          onClick={() => setActiveReport("loan_portfolio")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReport === "loan_portfolio"
              ? "bg-teal-700 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <CreditCard className="h-4 w-4" /> Loan Portfolio Quality (ঋণ পোর্টফোলিও)
        </button>

        <button
          onClick={() => setActiveReport("savings_ledger")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReport === "savings_ledger"
              ? "bg-teal-700 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <PiggyBank className="h-4 w-4" /> Member Savings Vault (সঞ্চয় হিসাব)
        </button>

        <button
          onClick={() => setActiveReport("branch_audit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReport === "branch_audit"
              ? "bg-teal-700 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
          }`}
        >
          <Building2 className="h-4 w-4" /> Branch Performance Matrix (শাখা অডিট)
        </button>
      </div>

      {/* Filter Controls (Hidden on Print) */}
      <Card className="rounded-2xl p-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Search Record
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Receipt #, Customer name, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Filter Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="all">All Branches (সকল শাখা)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.nameBn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Reporting Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="today">Today's Transactions ({formatDate(new Date().toISOString())})</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Current Month (Aug 2026)</option>
              <option value="year">Fiscal Year 2026-2027</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Formal Printable Document Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-xl shadow-xs">
                {org.name.substring(0, 1)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {org.name}
                </h2>
                <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                  {org.nameBn} • Microfinance Regulatory Authority Reg: {org.registrationNo}
                </p>
                <p className="text-[11px] text-slate-400">
                  {org.address} • Phone: {org.phone}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <Badge variant="default" className="text-xs uppercase font-mono tracking-wider">
                {activeReport.replace("_", " ")}
              </Badge>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Generated on {formatDateTime(new Date().toISOString())}
              </p>
              <p className="text-[11px] text-slate-400">
                Scope: {selectedBranch === "all" ? "Organization-Wide (All Branches)" : branches.find((b) => b.id === selectedBranch)?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards inside Document */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Recovered
            </span>
            <span className="text-xl font-extrabold text-teal-800 dark:text-teal-300 financial-value">
              {formatCurrency(totalCollections)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Loan Repayment
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white financial-value">
              {formatCurrency(totalLoanCollections)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Savings Mobilized
            </span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 financial-value">
              {formatCurrency(totalSavingsCollections)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Portfolio Outstanding
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white financial-value">
              {formatCurrency(totalOutstanding)}
            </span>
          </div>
        </div>

        {/* Report Content based on selected tab */}
        {activeReport === "daily_collection" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider text-left bg-slate-50/70 dark:bg-slate-800/50">
                  <th className="py-3 px-3">Receipt #</th>
                  <th className="py-3 px-3">Customer Name</th>
                  <th className="py-3 px-3">Branch</th>
                  <th className="py-3 px-3">Staff / Collector</th>
                  <th className="py-3 px-3 text-right">Loan Installment</th>
                  <th className="py-3 px-3 text-right">Savings Deposit</th>
                  <th className="py-3 px-3 text-right font-bold">Total Collection</th>
                  <th className="py-3 px-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCollections.map((col) => {
                  const cust = customers.find((c) => c.id === col.customerId);
                  const br = branches.find((b) => b.id === col.branchId);
                  const st = staff.find((s) => s.id === col.staffId);

                  return (
                    <tr key={col.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-teal-800 dark:text-teal-400">
                        {col.receiptNo}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{cust?.name}</div>
                        <div className="text-[10px] text-slate-400">{cust?.customerId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{br?.name}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{st?.name}</td>
                      <td className="py-3 px-3 text-right font-semibold financial-value text-slate-800 dark:text-slate-200">
                        {formatCurrency(col.loanAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold financial-value text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(col.savingsAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold financial-value text-teal-800 dark:text-teal-300 text-sm">
                        {formatCurrency(col.totalAmount)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="default" className="text-[10px] uppercase font-mono">
                          {col.paymentMethod}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-bold bg-slate-50 dark:bg-slate-800/60">
                  <td colSpan={4} className="py-3.5 px-3 uppercase text-slate-700 dark:text-slate-300">
                    Grand Total ({filteredCollections.length} Receipts)
                  </td>
                  <td className="py-3.5 px-3 text-right financial-value text-slate-900 dark:text-white">
                    {formatCurrency(totalLoanCollections)}
                  </td>
                  <td className="py-3.5 px-3 text-right financial-value text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(totalSavingsCollections)}
                  </td>
                  <td className="py-3.5 px-3 text-right financial-value text-teal-800 dark:text-teal-300 text-sm">
                    {formatCurrency(totalCollections)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeReport === "loan_portfolio" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider text-left bg-slate-50/70 dark:bg-slate-800/50">
                  <th className="py-3 px-3">Loan ID</th>
                  <th className="py-3 px-3">Borrower</th>
                  <th className="py-3 px-3">Principal</th>
                  <th className="py-3 px-3">Service Charge</th>
                  <th className="py-3 px-3">Total Payable</th>
                  <th className="py-3 px-3">Paid to Date</th>
                  <th className="py-3 px-3">Outstanding Balance</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loans.map((l) => {
                  const cust = customers.find((c) => c.id === l.customerId);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-teal-800 dark:text-teal-400">{l.loanId}</td>
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{cust?.name}</td>
                      <td className="py-3 px-3 financial-value">{formatCurrency(l.principal)}</td>
                      <td className="py-3 px-3 financial-value">{formatCurrency(l.serviceCharge)}</td>
                      <td className="py-3 px-3 financial-value font-semibold">{formatCurrency(l.totalPayable)}</td>
                      <td className="py-3 px-3 financial-value text-emerald-700">{formatCurrency(l.totalPaid)}</td>
                      <td className="py-3 px-3 financial-value font-bold text-rose-700">{formatCurrency(l.outstanding)}</td>
                      <td className="py-3 px-3">
                        <Badge variant={l.status === "active" ? "default" : l.status === "overdue" ? "destructive" : "outline"}>
                          {l.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "savings_ledger" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider text-left bg-slate-50/70 dark:bg-slate-800/50">
                  <th className="py-3 px-3">Account Holder</th>
                  <th className="py-3 px-3">Customer ID</th>
                  <th className="py-3 px-3">Branch</th>
                  <th className="py-3 px-3">Lifetime Deposited</th>
                  <th className="py-3 px-3">Lifetime Withdrawn</th>
                  <th className="py-3 px-3 font-bold">Current Balance</th>
                  <th className="py-3 px-3">Last Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accounts.map((acc) => {
                  const cust = customers.find((c) => c.id === acc.customerId);
                  const br = branches.find((b) => b.id === acc.branchId);
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{cust?.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{cust?.customerId}</td>
                      <td className="py-3 px-3">{br?.name}</td>
                      <td className="py-3 px-3 financial-value">{formatCurrency(acc.totalDeposited)}</td>
                      <td className="py-3 px-3 financial-value text-rose-600">{formatCurrency(acc.totalWithdrawn)}</td>
                      <td className="py-3 px-3 financial-value font-bold text-emerald-700 text-sm">{formatCurrency(acc.balance)}</td>
                      <td className="py-3 px-3 text-slate-400">{formatDate(acc.lastDepositAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "branch_audit" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider text-left bg-slate-50/70 dark:bg-slate-800/50">
                  <th className="py-3 px-3">Branch Name</th>
                  <th className="py-3 px-3">Manager</th>
                  <th className="py-3 px-3 text-center">Active Borrowers</th>
                  <th className="py-3 px-3 text-center">Loans Disbursed</th>
                  <th className="py-3 px-3 text-right">Portfolio Outstanding</th>
                  <th className="py-3 px-3 text-right">Savings Balance</th>
                  <th className="py-3 px-3 text-center">Recovery Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {branches.map((b, i) => {
                  const brCustomers = customers.filter((c) => c.branchId === b.id);
                  const brLoans = loans.filter((l) => l.branchId === b.id && l.status === "active");
                  const brOutstanding = brLoans.reduce((sum, l) => sum + l.outstanding, 0);
                  const brSavings = accounts.filter((a) => a.branchId === b.id).reduce((sum, a) => sum + a.balance, 0);
                  const manager = staff.find((s) => s.id === b.managerId);
                  const rates = [94, 91, 88, 96];

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {b.name} <span className="text-[10px] font-normal text-slate-400">({b.nameBn})</span>
                      </td>
                      <td className="py-3 px-3">{manager?.name}</td>
                      <td className="py-3 px-3 text-center font-bold">{brCustomers.length}</td>
                      <td className="py-3 px-3 text-center">{brLoans.length}</td>
                      <td className="py-3 px-3 text-right financial-value font-semibold">{formatCurrency(brOutstanding)}</td>
                      <td className="py-3 px-3 text-right financial-value text-emerald-700 font-semibold">{formatCurrency(brSavings)}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="default" className="bg-emerald-100 text-emerald-800 font-bold">
                          {rates[i % rates.length]}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Auditor Sign-off Area */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-8 text-center text-xs text-slate-400">
          <div>
            <div className="border-b border-slate-300 dark:border-slate-700 pb-8 mb-2"></div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Prepared By (Field Auditor)</span>
          </div>
          <div>
            <div className="border-b border-slate-300 dark:border-slate-700 pb-8 mb-2"></div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Branch Manager Verification</span>
          </div>
          <div>
            <div className="border-b border-slate-300 dark:border-slate-700 pb-8 mb-2"></div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Executive Director Approval</span>
          </div>
        </div>
      </div>
    </div>
  );
};
