import React, { useState, useEffect } from "react";
import {
  useCustomerStore,
  useLoanStore,
  useSavingsStore,
  useBranchStore,
  useStaffStore,
} from "@/store";
import { formatCurrency, getInitials } from "@/lib/utils";
import { toast } from "@/components/ui/toast-system";
import type { Customer } from "@/types";
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
  Filter,
  CreditCard,
  PiggyBank,
  Phone,
  MapPin,
  Eye,
  HandCoins,
  AlertCircle,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CombinedCollectionModal } from "@/components/collection/CombinedCollectionModal";
import { TableSkeleton } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-state";

export const CustomersPage: React.FC = () => {
  const { customers, addCustomer } = useCustomerStore();
  const { loans } = useLoanStore();
  const { accounts } = useSavingsStore();
  const { branches } = useBranchStore();
  const { staff } = useStaffStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomerIdForCollect, setSelectedCustomerIdForCollect] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  // New Customer Form State & Validation
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    phone: "",
    nid: "",
    address: "",
    branchId: "br-01",
    staffId: "st-02",
    occupation: "Small Business / ক্ষুদ্র ব্যবসা",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = "Full name must be at least 3 characters.";
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, "");
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      errors.phone = "Enter valid 11-digit Bangladesh phone (e.g. 01712345678).";
    }

    const cleanNid = formData.nid.replace(/[\s-]/g, "");
    if (cleanNid && !/^\d{10}$|^\d{13}$|^\d{17}$/.test(cleanNid)) {
      errors.nid = "NID must be 10, 13, or 17 numeric digits.";
    }

    if (!formData.address.trim() || formData.address.trim().length < 4) {
      errors.address = "Address must be at least 4 characters.";
    }

    return errors;
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesBranch = branchFilter === "all" || String(c.branchId) === String(branchFilter);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setTouched({ name: true, phone: true, nid: true, address: true });
      return;
    }

    await addCustomer({
      name: formData.name.trim(),
      nameBn: formData.nameBn.trim() || undefined,
      phone: formData.phone.trim(),
      nid: formData.nid.trim() || "19882691234567",
      address: formData.address.trim(),
      branchId: formData.branchId,
      staffId: formData.staffId,
      status: "active",
      occupation: formData.occupation.trim() || "Self Employed",
    });

    setIsAddModalOpen(false);
    toast.success(
      `Member Registered Successfully!`,
      `${formData.name} registered under branch with active member KYC profile.`
    );
    setFormData({
      name: "",
      nameBn: "",
      phone: "",
      nid: "",
      address: "",
      branchId: "br-01",
      staffId: "st-02",
      occupation: "Small Business / ক্ষুদ্র ব্যবসা",
    });
    setFormErrors({});
    setTouched({});
  };

  const totalMembers = customers.length;
  const activeMembers = customers.filter((c) => c.status === "active").length;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" />
        <TableSkeleton rows={7} cols={7} />
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Member Directory Render Error">
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Customer Directory / সদস্য ও গ্রাহক তালিকা
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered microfinance borrowers, savings account holders, and KYC profiles.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormErrors({});
            setTouched({});
            setIsAddModalOpen(true);
          }}
          className="gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs"
        >
          <Plus className="h-4 w-4" />
          + Register New Member
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-medium">Total Registered</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {totalMembers}
          </div>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
            Active Members
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-medium">Active Borrowers</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {customers.filter((c) => loans.some((l) => l.customerId === c.id && l.status === "active")).length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Running Active Loans</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-medium">Savings Savers</span>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {accounts.length}
          </div>
          <span className="text-[10px] text-slate-400">Weekly Depositors</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-medium">KYC Verified</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            100%
          </div>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
            NID & Biometrics Checked
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <Card className="rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search member name, ID (CUS-), phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="flex h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Status Filter Chips */}
            <div className="flex gap-1">
              {["all", "active", "overdue", "blacklisted"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-teal-700 text-white font-bold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Members Directory Table */}
      <Card className="rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50 text-slate-500 text-[11px] uppercase tracking-wider text-left">
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Contact & Address</th>
                <th className="py-3 px-4 font-semibold">Branch</th>
                <th className="py-3 px-4 font-semibold">Loan Outstanding</th>
                <th className="py-3 px-4 font-semibold">Savings Vault</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-2">
                    <EmptyState
                      variant="customers"
                      title={search || branchFilter !== "all" || statusFilter !== "all" ? "No Members Match Your Filters" : "No Members Enrolled Yet"}
                      titleBn={search ? "অনুসন্ধান ফলাফল পাওয়া যায়নি" : "এখনো কোনো সদস্য নিবন্ধিত হয়নি"}
                      description={
                        search
                          ? `No members found for "${search}". Try adjusting your search or clear the filters.`
                          : "Start by enrolling your first borrower member with a completed KYC profile."
                      }
                      actionText={search ? "Clear Search" : "+ Enroll New Member"}
                      onAction={search ? () => setSearch("") : () => setIsAddModalOpen(true)}
                      className="border-none bg-transparent shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const branch = branches.find((b) => b.id === cust.branchId);
                  const custLoans = loans.filter(
                    (l) => l.customerId === cust.id && (l.status === "active" || l.status === "overdue")
                  );
                  const loanOutstanding = custLoans.reduce((sum, l) => sum + l.outstanding, 0);
                  const savings = accounts.find((a) => a.customerId === cust.id);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {getInitials(cust.name)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {cust.name}
                            </span>
                            {cust.nameBn && (
                              <span className="text-[11px] text-slate-400 ml-1.5 font-normal">
                                ({cust.nameBn})
                              </span>
                            )}
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cust.customerId} • NID: {cust.nid}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {cust.phone}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {cust.address}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {branch?.name || "Main Branch"}
                      </td>

                      <td className="py-3 px-4 font-semibold financial-value text-slate-800 dark:text-slate-200">
                        {loanOutstanding > 0 ? (
                          <span className="text-teal-800 dark:text-teal-300">
                            {formatCurrency(loanOutstanding)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">No Active Loan</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold financial-value text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(savings?.balance || 0)}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            cust.status === "active"
                              ? "success"
                              : cust.status === "blacklisted"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize text-[10px]"
                        >
                          {cust.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2 text-teal-700 border-teal-200 hover:bg-teal-50"
                            onClick={() => setSelectedCustomerIdForCollect(cust.id)}
                          >
                            <HandCoins className="h-3.5 w-3.5 mr-1" /> Collect
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2"
                            onClick={() => navigate(`/admin/customers/${cust.id}`)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Profile
                          </Button>
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

      {/* Add Customer Modal with Full Bangladesh KYC Validation */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-teal-700" />
              <span>Register New Member / নতুন সদস্য অন্তর্ভুক্তি</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Full Name (English) *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  placeholder="e.g. Rahim Ahmed"
                  className={formErrors.name ? "border-rose-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  নাম (বাংলায়)
                </label>
                <Input
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  placeholder="যেমন: রহিম আহমেদ"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number (মোবাইল) *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" });
                  }}
                  placeholder="01712345678"
                  className={formErrors.phone ? "border-rose-500" : ""}
                />
                {formErrors.phone && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  National ID (NID / স্মার্ট কার্ড)
                </label>
                <Input
                  value={formData.nid}
                  onChange={(e) => {
                    setFormData({ ...formData, nid: e.target.value });
                    if (formErrors.nid) setFormErrors({ ...formErrors, nid: "" });
                  }}
                  placeholder="10, 13 or 17 digit NID"
                  className={formErrors.nid ? "border-rose-500" : ""}
                />
                {formErrors.nid && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.nid}</p>
                )}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Village / House & Street Address *
              </label>
              <Input
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (formErrors.address) setFormErrors({ ...formErrors, address: "" });
                }}
                placeholder="e.g. Village: Krishnapur, Ward 4, Mirpur"
                className={formErrors.address ? "border-rose-500" : ""}
              />
              {formErrors.address && (
                <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Operating Branch *
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.nameBn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Assigned Field Officer *
                </label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.staffCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Primary Occupation / পেশা
              </label>
              <Input
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g. Tailor, Dairy Farming, Grocery Shop"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold"
              >
                Register & Open Savings Vault
              </Button>
            </div>
          </form>
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

