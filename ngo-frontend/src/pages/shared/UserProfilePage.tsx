import React, { useState } from "react";
import {
  useAuthStore,
  useBranchStore,
  usePermissionStore,
  useAuditStore,
} from "@/store";
import { formatDateTime, getInitials } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast-system";
import { RolesManagementModal } from "@/components/admin/RolesManagementModal";
import {
  MODULE_METADATA,
  ACTION_LABELS,
  type SystemModule,
} from "@/lib/permissions";
import {
  User as UserIcon,
  Shield,
  KeyRound,
  History,
  Building,
  Phone,
  Mail,
  CheckCircle2,
  Lock,
  Smartphone,
  Save,
  Check,
  X,
  Sparkles,
  Camera,
} from "lucide-react";

export const UserProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { branches } = useBranchStore();
  const { getUserRole } = usePermissionStore();
  const { auditLogs } = useAuditStore();

  const [activeTab, setActiveTab] = useState<"info" | "permissions" | "security" | "activity">("info");
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);

  // Form State for editing personal details
  const [name, setName] = useState(user?.name || "Nurul Islam");
  const [phone, setPhone] = useState(user?.phone || "01711-000001");
  const [email, setEmail] = useState(user?.email || "admin@asha.org.bd");
  const [address, setAddress] = useState("House 42, Road 9/A, Dhanmondi, Dhaka");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const branch = branches.find((b) => b.id === user?.branchId) || branches[0];
  const userRole = getUserRole(user?.id, user?.role);

  // Filter audit records performed by this user
  const userLogs = auditLogs.filter(
    (log) =>
      log.actorName.toLowerCase().includes(user?.name.toLowerCase() || "") ||
      log.actorRole === user?.role
  );

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile Information Updated", "Your contact and personal details have been saved.");
    useAuditStore.getState().logActivity({
      action: "SETTINGS_UPDATED",
      actionTitle: "User Profile Updated",
      actionTitleBn: "ব্যবহারকারী প্রোফাইল হালনাগাদ",
      actorName: name,
      actorRole: (user?.role as any) || "admin",
      branchName: branch?.name || "Head Office",
      targetEntity: `User: ${name}`,
      targetId: user?.id || "usr-1",
      details: `Updated personal contact details (Phone: ${phone}, Email: ${email}).`,
      status: "success",
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Validation Error", "Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Weak Password", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mismatch", "New password and confirmation do not match.");
      return;
    }

    toast.success("Password Changed", "Security credentials updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="h-28 sm:h-32 bg-linear-to-r from-teal-800 via-teal-700 to-emerald-800 p-4 sm:p-6 relative">
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-transparent text-xs font-semibold">
              {user?.role?.toUpperCase()} PORTAL
            </Badge>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              {/* Overlapping Avatar */}
              <div className="relative -mt-12 sm:-mt-14 shrink-0">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-teal-600 text-white font-extrabold text-2xl border-4 border-white dark:border-slate-900 shadow-lg">
                  {getInitials(name)}
                </div>
                <button
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-md cursor-pointer border-2 border-white dark:border-slate-900"
                  title="Change Avatar"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* User Identity & Badges */}
              <div className="space-y-1.5 pt-1 sm:pt-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {name}
                  </h1>
                  <Badge variant="default" className="text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
                    {userRole.name}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 font-medium">
                    <Building className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    {branch ? branch.name : "All Branches"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    {phone}
                  </span>
                  <span>•</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    ID: {user?.staffCode || user?.customerId || `USR-${user?.id || "001"}`}
                  </span>
                </div>
              </div>
            </div>

            {user?.role === "admin" && (
              <div className="pt-2 sm:pt-0 shrink-0">
                <Button
                  size="sm"
                  onClick={() => setIsRolesModalOpen(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 shadow-sm cursor-pointer"
                >
                  <Shield className="h-4 w-4" /> Role & Permissions Manager
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs bg-slate-50/50 dark:bg-slate-900/30">
          {[
            { key: "info", label: "Personal Information", icon: UserIcon },
            { key: "permissions", label: "Role & Permissions", icon: Shield },
            { key: "security", label: "Security & Credentials", icon: KeyRound },
            { key: "activity", label: "My Activity Trail", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3.5 px-3 border-b-2 font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-teal-700 text-teal-800 dark:text-teal-400 dark:border-teal-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: 1. Personal Information */}
      {activeTab === "info" && (
        <Card className="rounded-3xl p-6 shadow-xs">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Contact & Identification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official employee profile information and communication endpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name (English) *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Official Mobile Phone *
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assigned Branch Office
                </label>
                <Input
                  value={branch ? `${branch.name} (${branch.nameBn})` : "Central Administration"}
                  disabled
                  className="mt-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Residential / Operating Address
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 shadow-xs"
              >
                <Save className="h-4 w-4" /> Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB CONTENT: 2. Role & Active Permissions */}
      {activeTab === "permissions" && (
        <Card className="rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Active Role: {userRole.name}
                </h3>
                <Badge variant="default" className="text-xs bg-teal-100 text-teal-800">
                  Granted
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {userRole.description}
              </p>
            </div>

            {user?.role === "admin" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsRolesModalOpen(true)}
                className="text-xs gap-1.5 shrink-0"
              >
                <Shield className="h-3.5 w-3.5" /> Configure Roles
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(MODULE_METADATA) as SystemModule[]).map((mod) => {
              const meta = MODULE_METADATA[mod];
              const rolePerm = userRole.permissions.find((p) => p.module === mod);
              const granted = rolePerm ? rolePerm.actions : [];

              return (
                <div
                  key={mod}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bengali">
                      {meta.labelBn}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {meta.availableActions.map((act) => {
                      const has = granted.includes(act);
                      return (
                        <span
                          key={act}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
                            has
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through opacity-50"
                          }`}
                        >
                          {has ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                          {ACTION_LABELS[act]?.labelBn || act}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 3. Security & Credentials */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-3xl p-6 shadow-xs">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Change Account Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your credentials for web portal and mobile collection POS login.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Password *
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password *
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password *
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 shadow-xs"
              >
                <KeyRound className="h-4 w-4" /> Update Password
              </Button>
            </form>
          </Card>

          {/* Quick Devices & Biometrics */}
          <Card className="rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Session & Device Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active terminals and mobile field authorization.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-teal-700" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Biometric & Quick PIN POS Login
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Enable fingerprint sign-in on Android tablet/POS
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => {
                  setBiometricEnabled(e.target.checked);
                  toast.info("Biometric Setting Updated", e.target.checked ? "Biometric login enabled." : "Biometric login disabled.");
                }}
                className="h-4 w-4 accent-teal-700 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Current Active Session:
              </span>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>IP Address: <strong className="font-mono">192.168.1.10 (Local HQ Network)</strong></div>
                <div>Browser: <strong>Google Chrome 128 / Windows 11</strong></div>
                <div>Status: <span className="text-emerald-600 font-bold">● Active Now</span></div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: 4. Personal Activity Trail */}
      {activeTab === "activity" && (
        <Card className="rounded-3xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Compliance Journal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Immutable log of transactions and administrative events performed by your account.
            </p>
          </div>

          <div className="space-y-3">
            {userLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No recent activity recorded for this user.
              </div>
            ) : (
              userLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 dark:text-white">
                        {log.actionTitle}
                      </strong>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {log.action}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                    <div className="text-[11px] text-slate-400">
                      {log.targetEntity} • {formatDateTime(log.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Roles & Permissions Modal */}
      <RolesManagementModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
      />
    </div>
  );
};
