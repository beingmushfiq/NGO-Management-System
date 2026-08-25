import React, { useState } from "react";
import { useCustomerStore, useLoanStore, useSavingsStore, useBranchStore, useAuthStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Phone,
  MapPin,
  CreditCard,
  PiggyBank,
  HandCoins,
  ArrowRight,
} from "lucide-react";
import { CombinedCollectionModal } from "@/components/collection/CombinedCollectionModal";

export const StaffCustomersPage: React.FC = () => {
  const currentUser = useAuthStore((s) => s.user);
  const { customers } = useCustomerStore();
  const { loans } = useLoanStore();
  const { accounts } = useSavingsStore();
  const { branches } = useBranchStore();

  const userBranch = branches.find((b) => b.id === currentUser?.branchId) || branches[0];
  const [search, setSearch] = useState("");
  const [selectedCustomerIdForCollect, setSelectedCustomerIdForCollect] = useState<string | null>(null);

  const branchCustomers = customers.filter((c) => String(c.branchId) === String(userBranch?.id));
  const filtered = branchCustomers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.nid.includes(search)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Find Borrower / গ্রাহক অনুসন্ধান
          </h1>
          <Badge variant="default" className="text-xs">
            {branchCustomers.length} Assigned
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quick search borrower accounts across {userBranch?.name} for instant field verification and collection.
        </p>
      </div>

      <Card className="rounded-2xl p-4">
        <Input
          placeholder="Search by customer name, CUS-ID, phone number, or NID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const custLoans = loans.filter((l) => l.customerId === c.id && (l.status === "active" || l.status === "overdue"));
          const activeLoan = custLoans[0];
          const savings = accounts.find((a) => a.customerId === c.id);

          return (
            <Card key={c.id} className="rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{c.customerId}</p>
                    </div>
                  </div>
                  <Badge variant={c.status === "active" ? "default" : "outline"}>
                    {c.status}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Loan Outstanding</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400 financial-value">
                      {activeLoan ? formatCurrency(activeLoan.outstanding) : "৳0"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Savings Vault</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 financial-value">
                      {savings ? formatCurrency(savings.balance) : "৳0"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => setSelectedCustomerIdForCollect(c.id)}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-1.5 h-9 text-xs"
                >
                  <HandCoins className="h-4 w-4 text-teal-200" /> Collect Payment
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <CombinedCollectionModal
        isOpen={!!selectedCustomerIdForCollect}
        onClose={() => setSelectedCustomerIdForCollect(null)}
        preselectedCustomerId={selectedCustomerIdForCollect || undefined}
      />
    </div>
  );
};
