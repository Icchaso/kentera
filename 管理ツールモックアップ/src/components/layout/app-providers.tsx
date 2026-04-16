"use client";

import { PatientsProvider } from "@/hooks/use-patients-store";
import { WorkspaceProvider } from "@/hooks/use-workspace-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <PatientsProvider>{children}</PatientsProvider>
    </WorkspaceProvider>
  );
}
