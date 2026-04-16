"use client";

import { PatientsProvider } from "@/hooks/use-patients-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <PatientsProvider>{children}</PatientsProvider>;
}
