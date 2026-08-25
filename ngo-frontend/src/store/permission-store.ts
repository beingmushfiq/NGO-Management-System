import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type CustomRole,
  type SystemModule,
  type PermissionAction,
  DEFAULT_SYSTEM_ROLES,
} from "@/lib/permissions";
import { generateId } from "@/lib/utils";

interface PermissionStoreState {
  roles: CustomRole[];
  userRoleAssignments: Record<string, string>; // userId -> roleId

  // Actions
  createCustomRole: (role: Omit<CustomRole, "id" | "createdAt" | "isSystemRole">) => CustomRole;
  updateRolePermissions: (roleId: string, updates: Partial<CustomRole>) => void;
  deleteCustomRole: (roleId: string) => boolean;
  assignRoleToUser: (userId: string, roleId: string) => void;
  getUserRole: (userId?: string, fallbackRole?: string) => CustomRole;
  hasPermission: (
    userRoleIdOrUserRole: string | undefined,
    module: SystemModule,
    action: PermissionAction
  ) => boolean;
}

export const usePermissionStore = create<PermissionStoreState>()(
  persist(
    (set, get) => ({
      roles: DEFAULT_SYSTEM_ROLES,
      userRoleAssignments: {
        "1": "role-admin",
        "2": "role-officer",
        "3": "role-officer",
        "4": "role-customer",
        "5": "role-customer",
        "6": "role-customer",
        "7": "role-customer",
        "8": "role-customer",
      },

      createCustomRole: (roleData) => {
        const newRole: CustomRole = {
          ...roleData,
          id: `role-custom-${generateId()}`,
          isSystemRole: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ roles: [...s.roles, newRole] }));
        return newRole;
      },

      updateRolePermissions: (roleId, updates) => {
        set((s) => ({
          roles: s.roles.map((r) => (r.id === roleId ? { ...r, ...updates } : r)),
        }));
      },

      deleteCustomRole: (roleId) => {
        const role = get().roles.find((r) => r.id === roleId);
        if (role?.isSystemRole) return false;
        set((s) => ({ roles: s.roles.filter((r) => r.id !== roleId) }));
        return true;
      },

      assignRoleToUser: (userId, roleId) => {
        set((s) => ({
          userRoleAssignments: { ...s.userRoleAssignments, [userId]: roleId },
        }));
      },

      getUserRole: (userId, fallbackRole = "admin") => {
        const { roles, userRoleAssignments } = get();
        if (userId && userRoleAssignments[userId]) {
          const assigned = roles.find((r) => r.id === userRoleAssignments[userId]);
          if (assigned) return assigned;
        }

        // Match by fallback standard role name
        const match =
          roles.find((r) => r.id === `role-${fallbackRole}`) ||
          roles.find((r) => r.name.toLowerCase().includes(fallbackRole.toLowerCase())) ||
          roles[0];
        return match;
      },

      hasPermission: (userRoleIdOrRole, module, action) => {
        if (!userRoleIdOrRole) return true; // Default permissive for admin
        const { roles } = get();

        // 1. Super Admin is always granted all permissions
        if (
          userRoleIdOrRole === "admin" ||
          userRoleIdOrRole === "role-admin" ||
          userRoleIdOrRole.toLowerCase().includes("super administrator")
        ) {
          return true;
        }

        // 2. Find matching role object
        const role =
          roles.find((r) => r.id === userRoleIdOrRole) ||
          roles.find((r) => r.id === `role-${userRoleIdOrRole}`) ||
          roles.find((r) => r.name.toLowerCase() === userRoleIdOrRole.toLowerCase());

        if (!role) return false;

        // 3. Inspect module permissions
        const modPerm = role.permissions.find((p) => p.module === module);
        if (!modPerm) return false;

        return modPerm.actions.includes(action);
      },
    }),
    { name: "ngo-permissions-storage" }
  )
);
