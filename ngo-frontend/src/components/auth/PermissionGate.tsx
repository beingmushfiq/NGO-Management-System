import React from "react";
import { useAuthStore, usePermissionStore } from "@/store";
import type { SystemModule, PermissionAction } from "@/lib/permissions";

interface PermissionGateProps {
  module: SystemModule;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  renderDisabled?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  module,
  action,
  children,
  fallback = null,
  renderDisabled = false,
}) => {
  const { user } = useAuthStore();
  const { hasPermission, getUserRole } = usePermissionStore();

  const userRole = getUserRole(user?.id, user?.role);
  const isAllowed = hasPermission(userRole.id, module, action);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (renderDisabled && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      disabled: true,
      title: `Permission Denied: Requires ${module}.${action} authorization.`,
      className: `${(children.props as any).className || ""} opacity-40 cursor-not-allowed pointer-events-none`,
    });
  }

  return <>{fallback}</>;
};

// ─── HOOK FOR INLINE LOGIC ────────────────────────────────────
export function useHasPermission(module: SystemModule, action: PermissionAction): boolean {
  const { user } = useAuthStore();
  const { hasPermission, getUserRole } = usePermissionStore();
  const userRole = getUserRole(user?.id, user?.role);
  return hasPermission(userRole.id, module, action);
}
