import type { Collection, Customer, Loan, SavingsAccount } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useOrgStore, useBranchStore, useStaffStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Printer, Download, CheckCircle, ShieldCheck } from "lucide-react";

interface ReceiptViewProps {
  collection: Collection;
  customer?: Customer;
  loan?: Loan;
  savingsAccount?: SavingsAccount;
  onClose?: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  collection,
  customer,
  loan,
  savingsAccount,
  onClose,
}) => {
  const org = useOrgStore((s) => s.settings);
  const branches = useBranchStore((s) => s.branches);
  const staffMembers = useStaffStore((s) => s.staff);

  const branch = branches.find((b) => b.id === collection.branchId);
  const staff = staffMembers.find((s) => s.id === collection.staffId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action bar (no-print) */}
      <div className="flex items-center justify-between no-print pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          <CheckCircle className="h-5 w-5" />
          <span>Payment Collected Successfully</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" /> Print
          </Button>
          {onClose && (
            <Button size="sm" variant="secondary" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>

      {/* Printable Receipt Paper */}
      <div
        id="receipt-print-area"
        className="receipt-container mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
      >
        {/* NGO Header */}
        <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
              {org.name.substring(0, 1)}
            </div>
            <h2 className="text-base font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              {org.name}
            </h2>
          </div>
          {org.nameBn && (
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {org.nameBn}
            </p>
          )}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {branch?.name || "Main"} Branch • Reg No: {org.registrationNo}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {org.address} • Hotline: {org.phone}
          </p>
        </div>

        {/* Receipt Title */}
        <div className="py-2.5 my-2 text-center bg-slate-50 dark:bg-slate-800/60 rounded-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-300">
            Money Receipt / অর্থ জমা রশিদ
          </span>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Receipt No: <span className="font-semibold text-slate-800 dark:text-slate-200">{collection.receiptNo}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-y-1.5 text-xs py-2 border-b border-slate-100 dark:border-slate-800">
          <div className="text-slate-500">Date & Time:</div>
          <div className="text-right font-medium">{formatDateTime(collection.collectedAt)}</div>

          <div className="text-slate-500">Customer Name:</div>
          <div className="text-right font-semibold">{customer?.name || "Customer"}</div>

          <div className="text-slate-500">Customer ID:</div>
          <div className="text-right font-mono font-medium">{customer?.customerId || "N/A"}</div>

          <div className="text-slate-500">Phone:</div>
          <div className="text-right">{customer?.phone || "N/A"}</div>

          <div className="text-slate-500">Collected By:</div>
          <div className="text-right font-medium">{staff?.name || "Officer"}</div>

          <div className="text-slate-500">Payment Mode:</div>
          <div className="text-right uppercase font-medium">{collection.paymentMethod.replace("_", " ")}</div>
        </div>

        {/* Breakdown Table */}
        <div className="py-3 border-b border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 pb-1">
                <th className="text-left font-medium pb-1">Account / Particulars</th>
                <th className="text-right font-medium pb-1">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Loan Installment #{collection.installmentNo}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Loan ID: {loan?.loanId || "LN-REF"}
                  </div>
                </td>
                <td className="py-2 text-right font-semibold financial-value text-slate-900 dark:text-white">
                  {formatCurrency(collection.loanAmount)}
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Savings Deposit
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Weekly contribution
                  </div>
                </td>
                <td className="py-2 text-right font-semibold financial-value text-slate-900 dark:text-white">
                  {formatCurrency(collection.savingsAmount)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800 dark:border-slate-200">
                <td className="pt-2 font-bold text-sm">TOTAL COLLECTED:</td>
                <td className="pt-2 text-right font-bold text-base text-teal-800 dark:text-teal-300 financial-value">
                  {formatCurrency(collection.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Balances Summary Box */}
        <div className="my-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-[11px] space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex justify-between">
            <span className="text-slate-500">Loan Outstanding After Payment:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 financial-value">
              {formatCurrency(collection.loanBalanceAfter)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Savings Balance After Deposit:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 financial-value">
              {formatCurrency(collection.savingsBalanceAfter)}
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 pb-2 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-400">
          <div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
              Customer Signature
            </div>
          </div>
          <div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
              Collector Signature
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-3 text-[9px] text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3 w-3 text-teal-600" />
          <span>System Verified Digital Receipt • NGO Management System</span>
        </div>
      </div>
    </div>
  );
};
