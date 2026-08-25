import React, { useState } from "react";
import { useCollectionStore, useCustomerStore, useBranchStore, useAuthStore } from "@/store";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Search,
  Printer,
  Calendar,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { ReceiptView } from "@/components/collection/ReceiptView";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Collection } from "@/types";

export const StaffCollectionsPage: React.FC = () => {
  const currentUser = useAuthStore((s) => s.user);
  const { collections } = useCollectionStore();
  const { customers } = useCustomerStore();
  const { branches } = useBranchStore();

  const userBranch = branches.find((b) => b.id === currentUser?.branchId) || branches[0];
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Collection | null>(null);

  const branchCollections = collections.filter((c) => String(c.branchId) === String(userBranch?.id));
  const filtered = branchCollections.filter((c) => {
    const cust = customers.find((cu) => String(cu.id) === String(c.customerId) || cu.customerId === c.customerId);
    return (
      c.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      cust?.name.toLowerCase().includes(search.toLowerCase()) ||
      cust?.customerId.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalCollected = branchCollections.reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Field Collection Receipts / আদায় রশিদ খাতা
            </h1>
            <Badge variant="default" className="text-xs">
              {branchCollections.length} Issued
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official proof of payment ledger for {userBranch?.name}. Search and reprint receipts.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Mobilized
          </span>
          <span className="text-2xl font-extrabold text-teal-800 dark:text-teal-300 financial-value">
            {formatCurrency(totalCollected)}
          </span>
        </div>
      </div>

      <Card className="rounded-2xl p-4">
        <Input
          placeholder="Search receipts by receipt number (COL-...), customer name, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </Card>

      <Card className="rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider text-left bg-slate-50/70 dark:bg-slate-800/50">
                <th className="py-3 px-4 font-semibold">Receipt Number</th>
                <th className="py-3 px-4 font-semibold">Borrower</th>
                <th className="py-3 px-4 font-semibold">Loan Recovered</th>
                <th className="py-3 px-4 font-semibold">Savings Deposit</th>
                <th className="py-3 px-4 font-bold">Total Collection</th>
                <th className="py-3 px-4 font-semibold">Time</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((c) => {
                const cust = customers.find((cu) => cu.id === c.customerId);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800 dark:text-teal-400">
                      {c.receiptNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{cust?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cust?.customerId}</div>
                    </td>
                    <td className="py-3.5 px-4 financial-value font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(c.loanAmount)}
                    </td>
                    <td className="py-3.5 px-4 financial-value font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(c.savingsAmount)}
                    </td>
                    <td className="py-3.5 px-4 financial-value font-extrabold text-teal-900 dark:text-teal-200 text-sm">
                      {formatCurrency(c.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDateTime(c.collectedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReceipt(c)}
                        className="h-8 text-xs gap-1.5 border-slate-300"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Receipt
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Receipt Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Official Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <ReceiptView collection={selectedReceipt} />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="default" onClick={() => window.print()} className="gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs">
                  <Printer className="h-4 w-4" /> Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
