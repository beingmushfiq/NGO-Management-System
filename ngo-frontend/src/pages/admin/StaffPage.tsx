import React, { useState, useEffect } from "react";
import { useStaffStore, useBranchStore, usePermissionStore, useAuditStore } from "@/store";
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
  UserCheck,
  Plus,
  Phone,
  Mail,
  Building,
  Shield,
  Award,
  Search,
  Edit2,
  Trash2,
  Lock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/components/ui/toast-system";
import { RolesManagementModal } from "@/components/admin/RolesManagementModal";
import { TableSkeleton, CardSkeleton } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-state";
import type { Staff } from "@/types";

export const StaffPage: React.FC = () => {
  const { staff, addStaff, updateStaff } = useStaffStore();
  const { branches } = useBranchStore();
  const { roles, getUserRole } = usePermissionStore();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Form State for Add / Edit Staff
  const [formData, setFormData] = useState({
    name: "",
    staffCode: "",
    phone: "",
    email: "",
    branchId: "br-01",
    role: "officer" as "manager" | "officer" | "collector",
    status: "active" as "active" | "inactive",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = "Staff name must be at least 3 characters.";
    }
    const cleanPhone = formData.phone.replace(/[\s-]/g, "");
    if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      errs.phone = "Enter valid Bangladesh phone number (01XXXXXXXXX).";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Enter a valid email address.";
    }
    return errs;
  };

  const handleStartAdd = () => {
    setFormData({
      name: "",
      staffCode: `STF-00${staff.length + 1}`,
      phone: "",
      email: "",
      branchId: branches[0]?.id || "br-01",
      role: "officer",
      status: "active",
    });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleStartEdit = (st: Staff) => {
    setSelectedStaffForEdit(st);
    setFormData({
      name: st.name,
      staffCode: st.staffCode,
      phone: st.phone,
      email: st.email,
      branchId: st.branchId,
      role: st.role,
      status: st.status,
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

    await addStaff({
      name: formData.name.trim(),
      staffCode: formData.staffCode,
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.staffCode.toLowerCase()}@asha.org.bd`,
      branchId: formData.branchId,
      role: formData.role,
      status: "active",
      joinedAt: new Date().toISOString().split("T")[0],
    });

    useAuditStore.getState().logActivity({
      action: "STAFF_APPOINTED",
      actionTitle: "New Staff Appointed",
      actionTitleBn: "নতুন কর্মকর্তা নিয়োগ",
      actorName: "HR Governance",
      actorRole: "admin",
      branchName: branches.find((b) => b.id === formData.branchId)?.name || "Central",
      targetEntity: `Staff: ${formData.name}`,
      targetId: formData.staffCode,
      details: `Appointed ${formData.name} as ${formData.role} under branch.`,
      status: "success",
    });

    setIsAddModalOpen(false);
    toast.success("Officer Appointed", `${formData.name} is now registered in the staff roster.`);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForEdit) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    await updateStaff(selectedStaffForEdit.id, {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      branchId: formData.branchId,
      role: formData.role,
      status: formData.status,
    });

    setIsEditModalOpen(false);
    toast.success("Staff Profile Updated", `Saved updates for ${formData.name}.`);
  };

  const handleDeactivate = (st: Staff) => {
    if (window.confirm(`Are you sure you want to deactivate ${st.name} (${st.staffCode})?`)) {
      updateStaff(st.id, { status: "inactive" });
      toast.info("Staff Deactivated", `${st.name} access has been revoked.`);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.staffCode.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const matchesBranch = branchFilter === "all" || s.branchId === branchFilter;
    return matchesSearch && matchesBranch;
  });

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
    <ErrorBoundary fallbackTitle="Staff Management Render Error">
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Field Officers & Custom RBAC Roles / কর্মী ও রোলসমূহ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Appoint credit officers, manage route portfolios, and configure granular module permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRolesModalOpen(true)}
              className="text-xs gap-1.5 border-slate-300 dark:border-slate-700"
            >
              <Shield className="h-4 w-4 text-teal-700 dark:text-teal-400" />
              Role & Permissions Matrix
            </Button>

            <Button
              onClick={handleStartAdd}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              + Appoint Staff
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search staff by name, code, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Filter Branch:</span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="all">All Branches (সকল শাখা)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Staff Grid Cards */}
        {filteredStaff.length === 0 ? (
          <EmptyState
            variant="general"
            title={search ? "No Staff Found" : "No Staff Appointed Yet"}
            titleBn="কোনো কর্মকর্তা পাওয়া যায়নি"
            description="Appoint your first field credit officer or branch manager to start managing routes."
            actionText="+ Appoint Staff Member"
            onAction={handleStartAdd}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((st) => {
              const br = branches.find((b) => b.id === st.branchId);
              return (
                <Card
                  key={st.id}
                  className="rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold text-sm">
                          {getInitials(st.name)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {st.name}
                          </h3>
                          <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-400">
                            {st.staffCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(st)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                          title="Edit Staff & Role"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(st)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40 text-slate-400 cursor-pointer"
                          title="Deactivate Staff"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{br?.name || "Assigned Branch"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{st.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{st.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize font-semibold text-slate-700 dark:text-slate-200">
                      {st.role}
                    </span>
                    <Badge variant={st.status === "active" ? "success" : "secondary"} className="text-[10px]">
                      {st.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Staff Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
                <UserCheck className="h-5 w-5" />
                <span>Appoint Field Officer / নতুন কর্মী নিয়োগ</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Officer Full Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g. Masud Rana"
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-0.5">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Staff Code
                  </label>
                  <Input
                    value={formData.staffCode}
                    onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                    className="font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Role Category *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
                  >
                    <option value="officer">Field Officer / মাঠ কর্মকর্তা</option>
                    <option value="manager">Branch Manager / শাখা ব্যবস্থাপক</option>
                    <option value="collector">Credit Collector / কিস্তি আদায়কারী</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Phone (মোবাইল) *
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
                    Email Address
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="officer@ngo.org"
                    className={errors.email ? "border-rose-500" : ""}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Operating Branch
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.nameBn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold">
                  Confirm Appointment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
                <Edit2 className="h-5 w-5" />
                <span>Edit Staff & Role Assignment / কর্মী তথ্য সংশোধন</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 pt-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Officer Full Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Account Status
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 mt-1"
                  >
                    <option value="officer">Field Officer</option>
                    <option value="manager">Branch Manager</option>
                    <option value="collector">Credit Collector</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Branch Assignment
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
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

        {/* Roles & Permissions Modal */}
        <RolesManagementModal
          isOpen={isRolesModalOpen}
          onClose={() => setIsRolesModalOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
};
