import React, { useState, useEffect } from "react";
import { useOrgStore, useBranchStore, usePermissionStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Building,
  CheckCircle2,
  Shield,
  Palette,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Lock,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/components/ui/toast-system";
import { RolesManagementModal } from "@/components/admin/RolesManagementModal";
import { TableSkeleton, CardSkeleton } from "@/components/ui/loading-state";
import { ErrorBoundary } from "@/components/ui/error-state";

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useOrgStore();
  const { branches } = useBranchStore();
  const { roles } = usePermissionStore();

  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const [formData, setFormData] = useState({
    name: settings.name,
    nameBn: settings.nameBn,
    tagline: settings.tagline,
    registrationNo: settings.registrationNo,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    primaryColor: settings.primaryColor,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSavedSuccess(true);
    toast.success(
      "Settings Saved Successfully!",
      "Organization profile, MRA registration, and regional branding parameters updated."
    );
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl pb-16">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Settings Error">
      <div className="space-y-6 animate-fade-in max-w-4xl pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Organization Profile & System Settings
          </h1>
          <Badge variant="default" className="text-xs">Administration</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Institutional identity, MRA registration details, bilingual headers, and branch governance.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Settings updated successfully! Changes reflected across all portals and printable receipts.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NGO Legal Identity */}
        <Card className="rounded-2xl p-6">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="h-4 w-4 text-teal-700" />
              NGO Legal Entity Information
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Organization Name (English)
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Organization Name (বাংলা)
              </label>
              <Input
                value={formData.nameBn}
                onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tagline / Slogan
              </label>
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                MRA Regulatory Registration Number
              </label>
              <Input
                value={formData.registrationNo}
                onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                leftIcon={<FileCheck className="h-4 w-4" />}
                required
              />
            </div>
          </div>
        </Card>

        {/* Contact & Address */}
        <Card className="rounded-2xl p-6">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-700" />
              Head Office Contact & Correspondence
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Official Telephone / Helpline
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                leftIcon={<Phone className="h-4 w-4" />}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Official Email Address
              </label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Head Office Physical Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Role-Based Access Control Governance */}
        <Card className="rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Role-Based Access Control (RBAC) & Custom Permissions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {roles.length} active roles configured with module-level View, Add, Edit, Delete permissions.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRolesModalOpen(true)}
              className="text-xs gap-1.5 border-slate-300 dark:border-slate-700"
            >
              Configure RBAC Matrix <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>

        {/* Operating Branches Summary */}
        <Card className="rounded-2xl p-6">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="h-4 w-4 text-teal-700" />
              Network Overview ({branches.length} Active Branches)
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {branches.map((b) => (
              <div key={b.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block truncate">{b.name}</span>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 block">{b.nameBn}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">{b.phone}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" variant="default" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6">
            Save System Settings
          </Button>
        </div>
      </form>

      {/* Roles & Permissions Modal */}
      <RolesManagementModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
      />
    </div>
    </ErrorBoundary>
  );
};
