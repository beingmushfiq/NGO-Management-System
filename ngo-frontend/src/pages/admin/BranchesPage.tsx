import React, { useState, useEffect } from "react";
import { useBranchStore, useStaffStore, useCustomerStore, useLoanStore, useSavingsStore, useAuditStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/toast-system";
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
  Building2,
  Plus,
  Users,
  CreditCard,
  PiggyBank,
  TrendingUp,
  MapPin,
  Phone,
  CheckCircle2,
  Search,
  User,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { TableSkeleton, CardSkeleton } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-state";
import type { Branch } from "@/types";

export const BranchesPage: React.FC = () => {
  const { branches, addBranch, updateBranch } = useBranchStore();
  const { staff } = useStaffStore();
  const { customers } = useCustomerStore();
  const { loans } = useLoanStore();
  const { accounts } = useSavingsStore();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranchForEdit, setSelectedBranchForEdit] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    address: "",
    phone: "",
    managerId: staff[0]?.id || "st-01",
    status: "active" as "active" | "inactive",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = "Branch name must be at least 3 characters.";
    }
    if (!formData.nameBn.trim()) {
      errs.nameBn = "বাংলা শাখার নাম আবশ্যক।";
    }
    if (!formData.address.trim() || formData.address.trim().length < 4) {
      errs.address = "Address must be at least 4 characters.";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required.";
    }
    return errs;
  };

  const handleStartAdd = () => {
    setFormData({
      name: "",
      nameBn: "",
      address: "",
      phone: "",
      managerId: staff[0]?.id || "st-01",
      status: "active",
    });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleStartEdit = (b: Branch) => {
    setSelectedBranchForEdit(b);
    setFormData({
      name: b.name,
      nameBn: b.nameBn,
      address: b.address,
      phone: b.phone,
      managerId: b.managerId,
      status: b.status,
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    await addBranch({
      name: formData.name.trim(),
      nameBn: formData.nameBn.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      managerId: formData.managerId,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    });

    useAuditStore.getState().logActivity({
      action: "BRANCH_CREATED",
      actionTitle: "New Branch Commissioned",
      actionTitleBn: "নতুন শাখা স্থাপন",
      actorName: "Governance Board",
      actorRole: "admin",
      branchName: formData.name,
      targetEntity: `Branch: ${formData.name}`,
      targetId: `BR-${Date.now()}`,
      details: `Established ${formData.name} (${formData.nameBn}) at ${formData.address}.`,
      status: "success",
    });

    setIsAddModalOpen(false);
    toast.success("Branch Added Successfully!", `${formData.name} is now operational.`);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchForEdit) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    await updateBranch(selectedBranchForEdit.id, {
      name: formData.name.trim(),
      nameBn: formData.nameBn.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      managerId: formData.managerId,
      status: formData.status,
    });

    setIsEditModalOpen(false);
    toast.success("Branch Updated", `Saved updates for ${formData.name}.`);
  };

  const handleDeactivateBranch = (b: Branch) => {
    const branchLoans = loans.filter(
      (l) => l.branchId === b.id && (l.status === "active" || l.status === "overdue")
    );
    if (branchLoans.length > 0) {
      toast.error(
        "Cannot Deactivate Branch",
        `This branch has ${branchLoans.length} active loans. Transfer or settle loans before archiving.`
      );
      return;
    }

    if (window.confirm(`Deactivate operational branch ${b.name}?`)) {
      updateBranch(b.id, { status: "inactive" });
      toast.info("Branch Deactivated", `${b.name} marked as inactive.`);
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.nameBn.includes(search) ||
      b.address.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <CardSkeleton count={3} />
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Branch Operations Render Error">
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Branch Offices & Regional Hubs / শাখা সমূহ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-branch microfinance governance, regional credit limits, and branch portfolio audits.
            </p>
          </div>

          <Button
            onClick={handleStartAdd}
            className="gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" />
            + Open New Branch
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 rounded-2xl shadow-xs">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by branch name, address, বাংলা..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </Card>

        {/* Branch Cards */}
        {filteredBranches.length === 0 ? (
          <EmptyState
            variant="general"
            title={search ? "No Branches Match Search" : "No Operational Branches"}
            titleBn="কোনো শাখা পাওয়া যায়নি"
            description="Open your first regional branch office to start serving local community borrowers."
            actionText="+ Open New Branch"
            onAction={handleStartAdd}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBranches.map((b) => {
              const manager = staff.find((s) => s.id === b.managerId);
              const branchCustomers = customers.filter((c) => c.branchId === b.id);
              const branchLoans = loans.filter((l) => l.branchId === b.id);
              const branchOutstanding = branchLoans
                .filter((l) => l.status === "active" || l.status === "overdue")
                .reduce((sum, l) => sum + Number(l.outstanding || 0), 0);
              const branchSavings = accounts
                .filter((a) => {
                  const cust = customers.find((c) => c.id === a.customerId);
                  return cust?.branchId === b.id;
                })
                .reduce((sum, a) => sum + Number(a.balance || 0), 0);

              const activeLoans = branchLoans.filter((l) => l.status === "active").length;
              const rate = Math.min(99, 90 + (activeLoans % 9));

              return (
                <Card
                  key={b.id}
                  className="rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {b.name}
                        </h3>
                        <p className="text-xs text-teal-700 dark:text-teal-400 font-bengali font-semibold">
                          {b.nameBn}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Badge variant={b.status === "active" ? "success" : "secondary"} className="text-[10px]">
                          {b.status}
                        </Badge>
                        <button
                          onClick={() => handleStartEdit(b)}
                          className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                          title="Edit Branch"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeactivateBranch(b)}
                          className="p-1 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 text-slate-400 cursor-pointer"
                          title="Deactivate Branch"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span>{b.address}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Recovery Efficiency:</span>
                        <span className="font-bold text-teal-700 dark:text-teal-400">{rate}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-teal-600 to-emerald-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">Borrowers:</span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {branchCustomers.length} Members
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Outstanding:</span>
                        <div className="font-bold text-teal-800 dark:text-teal-300 financial-value">
                          {formatCurrency(branchOutstanding)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Savings:</span>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 financial-value">
                          {formatCurrency(branchSavings)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manager & Contact footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-teal-600" /> Manager: {manager?.name || "Branch Manager"}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Phone className="h-3 w-3" /> {b.phone}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Branch Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
                <Building2 className="h-5 w-5" />
                <span>Open New Operational Branch / নতুন শাখা স্থাপন</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Branch Name (English) *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g. Mirpur Branch"
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  শাখার নাম (বাংলা) *
                </label>
                <Input
                  value={formData.nameBn}
                  onChange={(e) => {
                    setFormData({ ...formData, nameBn: e.target.value });
                    if (errors.nameBn) setErrors({ ...errors, nameBn: "" });
                  }}
                  placeholder="যেমন: মিরপুর শাখা"
                  className={errors.nameBn ? "border-rose-500 font-bengali" : "font-bengali"}
                />
                {errors.nameBn && <p className="text-[10px] text-rose-500 mt-0.5">{errors.nameBn}</p>}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Branch Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: "" });
                  }}
                  placeholder="Plot 12, Section 10, Mirpur, Dhaka"
                  className={errors.address ? "border-rose-500" : ""}
                />
                {errors.address && <p className="text-[10px] text-rose-500 mt-0.5">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Phone *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    placeholder="01711223344"
                    className={errors.phone ? "border-rose-500" : ""}
                  />
                  {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Branch Manager
                  </label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                  Confirm Open Branch
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Branch Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
                <Edit2 className="h-5 w-5" />
                <span>Edit Branch Details / শাখা তথ্য সংশোধন</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 pt-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Branch Name (English) *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  শাখার নাম (বাংলা) *
                </label>
                <Input
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  className="font-bengali"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Branch Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Phone *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};
