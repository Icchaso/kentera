"use client";

import * as React from "react";
import type { StaffRole } from "@/types";
import { staffList, tenants } from "@/lib/data/seed";

type WorkspaceContextValue = {
  currentRole: StaffRole;
  setCurrentRole: (r: StaffRole) => void;
  currentTenantId: string; // "all" = グループ全店舗
  setCurrentTenantId: (id: string) => void;
  actingStaffId: string; // 現在なりすましているスタッフID
};

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = React.useState<StaffRole>("owner");
  const [currentTenantId, setCurrentTenantId] = React.useState<string>(tenants[0].id);

  // role変更時のデフォルト切替
  const handleSetRole = React.useCallback((r: StaffRole) => {
    setCurrentRole(r);
    if (r === "group_owner") {
      setCurrentTenantId("all");
    } else {
      setCurrentTenantId(tenants[0].id);
    }
  }, []);

  // なりすましスタッフの決定（ロール別）
  const actingStaffId = React.useMemo(() => {
    const s =
      currentRole === "group_owner"
        ? staffList.find((x) => x.role === "group_owner")
        : currentRole === "owner"
        ? staffList.find((x) => x.role === "owner")
        : staffList.find((x) => x.role === "staff" && x.roleLabel !== "受付");
    return s?.id ?? staffList[0].id;
  }, [currentRole]);

  const value = React.useMemo(
    () => ({
      currentRole,
      setCurrentRole: handleSetRole,
      currentTenantId,
      setCurrentTenantId,
      actingStaffId,
    }),
    [currentRole, handleSetRole, currentTenantId, actingStaffId]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
