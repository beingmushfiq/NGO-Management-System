import React, { useState } from "react";
import { usePermissionStore } from "@/store/permission-store";
import {
  type CustomRole,
  type SystemModule,
  type PermissionAction,
  MODULE_METADATA,
  ACTION_LABELS,
} from "@/lib/permissions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast-system";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Users,
  CheckCircle2,
} from "lucide-react";

interface RolesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolesManagementModal: React.FC<RolesManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { roles, createCustomRole, updateRolePermissions, deleteCustomRole } = usePermissionStore();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || "role-admin");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State for creating/editing role
  const [roleName, setRoleName] = useState("");
  const [roleNameBn, setRoleNameBn] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissionsState, setPermissionsState] = useState<Record<SystemModule, PermissionAction[]>>({
    customers: ["view"],
    loans: ["view"],
    savings: ["view"],
    collections: ["view"],
    branches: ["view"],
    staff: ["view"],
    reports: ["view"],
    settings: ["view"],
    audit: ["view"],
  });

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setIsEditing(false);
    setRoleName("");
    setRoleNameBn("");
    setRoleDescription("");
    setPermissionsState({
      customers: ["view", "create"],
      loans: ["view"],
      savings: ["view"],
      collections: ["view", "create"],
      branches: ["view"],
      staff: ["view"],
      reports: ["view"],
      settings: [],
      audit: [],
    });
  };

  const handleStartEdit = (role: CustomRole) => {
    setIsCreatingNew(false);
    setIsEditing(true);
    setRoleName(role.name);
    setRoleNameBn(role.nameBn || "");
    setRoleDescription(role.description);

    const mapped: Record<SystemModule, PermissionAction[]> = {
      customers: [],
      loans: [],
      savings: [],
      collections: [],
      branches: [],
      staff: [],
      reports: [],
      settings: [],
      audit: [],
    };
    role.permissions.forEach((p) => {
      mapped[p.module] = p.actions;
    });
    setPermissionsState(mapped);
  };

  const toggleAction = (module: SystemModule, action: PermissionAction) => {
    setPermissionsState((prev) => {
      const current = prev[module] || [];
      const has = current.includes(action);
      const next = has ? current.filter((a) => a !== action) : [...current, action];
      return { ...prev, [module]: next };
    });
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role Name Required", "Please provide a name for this custom role.");
      return;
    }

    const formattedPermissions = Object.entries(permissionsState)
      .filter(([_, actions]) => actions.length > 0)
      .map(([mod, actions]) => ({
        module: mod as SystemModule,
        actions,
      }));

    if (isCreatingNew) {
      const created = createCustomRole({
        name: roleName.trim(),
        nameBn: roleNameBn.trim() || undefined,
        description: roleDescription.trim() || "Custom organizational role.",
        permissions: formattedPermissions,
      });
      setSelectedRoleId(created.id);
      setIsCreatingNew(false);
      toast.success("Custom Role Created", `Role "${created.name}" is now available for staff assignment.`);
    } else if (isEditing && selectedRole) {
      updateRolePermissions(selectedRole.id, {
        name: roleName.trim(),
        nameBn: roleNameBn.trim() || undefined,
        description: roleDescription.trim(),
        permissions: formattedPermissions,
      });
      setIsEditing(false);
      toast.success("Role Permissions Updated", `Permissions saved for "${selectedRole.name}".`);
    }
  };

  const handleDeleteRole = (roleId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete custom role "${name}"?`)) {
      const ok = deleteCustomRole(roleId);
      if (ok) {
        setSelectedRoleId(roles[0].id);
        toast.info("Role Deleted", `Custom role "${name}" removed.`);
      } else {
        toast.error("Action Denied", "System core roles cannot be deleted.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Role-Based Access Control & Permission Matrix
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure custom staff roles and granular View, Add, Edit, Delete capabilities across modules.
                </p>
              </div>
            </div>

            {!isCreatingNew && !isEditing && (
              <Button
                size="sm"
                onClick={handleStartCreate}
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 shadow-xs"
              >
                <Plus className="h-4 w-4" /> + Create Custom Role
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Left: Roles Selector List */}
          <div className="p-4 overflow-y-auto space-y-2 bg-slate-50/40 dark:bg-slate-900/30">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Organizational Roles ({roles.length})
            </div>

            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => {
                  setSelectedRoleId(role.id);
                  setIsEditing(false);
                  setIsCreatingNew(false);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  selectedRoleId === role.id && !isCreatingNew
                    ? "bg-teal-50 border-teal-300 dark:bg-teal-950/50 dark:border-teal-800 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {role.name}
                    </span>
                    {role.isSystemRole && (
                      <span title="System Protected Role">
                        <Lock className="h-3 w-3 text-slate-400" />
                      </span>
                    )}
                  </div>
                  {role.nameBn && (
                    <p className="text-[11px] text-slate-400 font-bengali">{role.nameBn}</p>
                  )}
                  <p className="text-[11px] text-slate-500 line-clamp-2">{role.description}</p>
                </div>

                {!role.isSystemRole && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRole(role.id, role.name);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Delete Role"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Right: Permission Matrix / Create / Edit Form */}
          <div className="md:col-span-2 p-6 overflow-y-auto bg-white dark:bg-slate-900">
            {isCreatingNew || isEditing ? (
              <form onSubmit={handleSaveRole} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isCreatingNew ? "Create New Custom Role" : `Edit Role: ${selectedRole.name}`}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Role Name (English) *
                    </label>
                    <Input
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Senior Area Auditor"
                      className="mt-1 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Role Name (বাংলা)
                    </label>
                    <Input
                      value={roleNameBn}
                      onChange={(e) => setRoleNameBn(e.target.value)}
                      placeholder="e.g. সিনিয়র এলাকা নিরীক্ষক"
                      className="mt-1 text-xs font-bengali"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Role Description
                  </label>
                  <Input
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Brief summary of responsibilities..."
                    className="mt-1 text-xs"
                  />
                </div>

                {/* Permissions Toggles Table */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Module Permission Matrix
                  </span>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {(Object.keys(MODULE_METADATA) as SystemModule[]).map((mod) => {
                      const meta = MODULE_METADATA[mod];
                      const activeActions = permissionsState[mod] || [];
                      return (
                        <div key={mod} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {meta.label}
                            </span>
                            <span className="text-[11px] text-slate-400 font-bengali ml-2">
                              ({meta.labelBn})
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {meta.availableActions.map((act) => {
                              const isChecked = activeActions.includes(act);
                              return (
                                <button
                                  type="button"
                                  key={act}
                                  onClick={() => toggleAction(mod, act)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                    isChecked
                                      ? "bg-teal-700 text-white shadow-xs"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  {isChecked ? <Check className="h-3 w-3" /> : null}
                                  {ACTION_LABELS[act]?.labelBn || act}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs"
                  >
                    Save Role & Permissions
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Role Header Info */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {selectedRole.name}
                      </h3>
                      {selectedRole.isSystemRole ? (
                        <Badge variant="secondary" className="text-[10px]">
                          System Protected
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] bg-teal-700 text-white">
                          Custom Role
                        </Badge>
                      )}
                    </div>
                    {selectedRole.nameBn && (
                      <p className="text-xs text-slate-500 font-bengali mt-0.5">
                        {selectedRole.nameBn}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                      {selectedRole.description}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartEdit(selectedRole)}
                    className="text-xs gap-1.5 shrink-0"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Customize Permissions
                  </Button>
                </div>

                {/* Active Granted Permissions Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Granted Module Permissions:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(MODULE_METADATA) as SystemModule[]).map((mod) => {
                      const meta = MODULE_METADATA[mod];
                      const rolePerm = selectedRole.permissions.find((p) => p.module === mod);
                      const granted = rolePerm ? rolePerm.actions : [];

                      return (
                        <div
                          key={mod}
                          className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
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
                                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through opacity-60"
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
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
