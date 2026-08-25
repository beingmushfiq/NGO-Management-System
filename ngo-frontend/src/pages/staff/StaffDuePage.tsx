import React, { useState } from "react";
import { useAuthStore, useDueItems, useBranchStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Search,
  HandCoins,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { CombinedCollectionModal } from "@/components/collection/CombinedCollectionModal";

export const StaffDuePage: React.FC = () => {
  const currentUser = useAuthStore((s) => s.user);
  const { branches } = useBranchStore();
  const userBranch = branches.find((b) => b.id === currentUser?.branchId) || branches[0];
  const dueItems = useDueItems(userBranch?.id);

  const [search, setSearch] = useState("");
  const [selectedCustomerIdForCollect, setSelectedCustomerIdForCollect] = useState<string | null>(null);

  const filteredDue = dueItems.filter((i) => {
    return (
      i.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      i.customer.customerId.toLowerCase().includes(search.toLowerCase()) ||
      i.customer.phone.includes(search)
    );
  });

  const totalDueAmount = filteredDue.reduce((s, i) => s + i.totalDue, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Field Due Recovery / বকেয়া কিস্তি আদায়
            </h1>
            <Badge variant="warning" className="text-xs">
              {dueItems.length} Pending
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assigned route for {userBranch?.name}. Collect loan installment and weekly savings in a single action.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Due on Route
          </span>
          <span className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 financial-value">
            {formatCurrency(totalDueAmount)}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <Card className="rounded-2xl p-4">
        <Input
          placeholder="Search borrower by name, ID (CUS-1024), or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </Card>

      {/* Due Cards (Mobile & Desktop Responsive Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDue.map((item) => (
          <Card
            key={item.installment.id}
            className="rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.customer.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {item.customer.customerId} • {item.customer.phone}
                  </p>
                </div>
                <Badge variant={item.installment.status === "overdue" ? "destructive" : "warning"}>
                  {item.installment.status}
                </Badge>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Loan Installment (Week #{item.installment.installmentNo})</span>
                  <span className="font-semibold financial-value">
                    {formatCurrency(item.installment.expected)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>Mandatory Weekly Savings</span>
                  <span className="font-semibold financial-value">৳200</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between font-bold text-teal-900 dark:text-teal-200">
                  <span>Total Scheduled</span>
                  <span className="text-sm financial-value">
                    {formatCurrency(item.totalDue)}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{item.customer.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={() => setSelectedCustomerIdForCollect(item.customer.id)}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 h-9 text-xs"
              >
                <HandCoins className="h-4 w-4 text-teal-200" />
                Collect {formatCurrency(item.totalDue)}
              </Button>
            </div>
          </Card>
        ))}

        {filteredDue.length === 0 && (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            No pending due items matching your search criteria.
          </div>
        )}
      </div>

      <CombinedCollectionModal
        isOpen={!!selectedCustomerIdForCollect}
        onClose={() => setSelectedCustomerIdForCollect(null)}
        preselectedCustomerId={selectedCustomerIdForCollect || undefined}
      />
    </div>
  );
};
