import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCustomerStore, useLoanStore, useCollectionStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Users,
  CreditCard,
  Receipt,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const customers = useCustomerStore((s) => s.customers);
  const loans = useLoanStore((s) => s.loans);
  const collections = useCollectionStore((s) => s.collections);
  const navigate = useNavigate();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Trigger toggle in parent
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredCustomers = query.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.customerId.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query)
      ).slice(0, 4)
    : [];

  const filteredLoans = query.trim()
    ? loans.filter(
        (l) =>
          l.loanId.toLowerCase().includes(query.toLowerCase()) ||
          l.purpose?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredCollections = query.trim()
    ? collections.filter((c) =>
        c.receiptNo.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900">
          <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search customers, loan ID (LN-2026), receipt number (COL-)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <Badge variant="secondary" className="text-[10px] uppercase font-mono">
            ESC to close
          </Badge>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!query.trim() && (
            <div className="p-6 text-center text-xs text-slate-400">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-teal-600/70" />
              <p className="font-medium text-slate-700 dark:text-slate-300">
                Quick Navigation & Search
              </p>
              <p className="text-[11px] mt-0.5">
                Type customer name, phone number, Loan ID, or Receipt Number.
              </p>
            </div>
          )}

          {/* Customers matches */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-teal-600" /> Customers
              </div>
              <div className="space-y-1">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(`/admin/customers/${c.id}`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {c.name}
                      </span>
                      <span className="text-slate-400 ml-2 font-mono text-[11px]">
                        {c.customerId} • {c.phone}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loans matches */}
          {filteredLoans.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-teal-600" /> Loans
              </div>
              <div className="space-y-1">
                {filteredLoans.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => handleSelect(`/admin/loans`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                        {l.loanId}
                      </span>
                      <span className="text-slate-400 ml-2">
                        {l.purpose || "Loan"} • Outstanding: {formatCurrency(l.outstanding)}
                      </span>
                    </div>
                    <Badge variant={l.status === "active" ? "default" : "secondary"}>
                      {l.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipts matches */}
          {filteredCollections.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-teal-600" /> Receipts
              </div>
              <div className="space-y-1">
                {filteredCollections.map((col) => (
                  <div
                    key={col.id}
                    onClick={() => handleSelect(`/admin/reports`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                        {col.receiptNo}
                      </span>
                      <span className="text-slate-400 ml-2">
                        Collected: {formatCurrency(col.totalAmount)}
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-600 font-medium">
                      View Audit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
