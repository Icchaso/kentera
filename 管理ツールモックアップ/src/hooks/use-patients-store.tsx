"use client";

import * as React from "react";
import type { Patient } from "@/types";
import { patients as seedPatients } from "@/lib/data/seed";

type PatientsContextValue = {
  patients: Patient[];
  addPatient: (input: NewPatientInput) => Patient;
  updatePatient: (id: string, update: Partial<Patient>) => void;
};

export type NewPatientInput = Omit<
  Patient,
  "id" | "tenantId" | "firstVisitDate" | "lastVisitDate" | "totalVisits" | "totalSpent" | "isActive" | "createdAt" | "updatedAt"
>;

const PatientsContext = React.createContext<PatientsContextValue | null>(null);

export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = React.useState<Patient[]>(seedPatients);

  const addPatient = React.useCallback((input: NewPatientInput): Patient => {
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...input,
      id: `patient-${String(Date.now()).slice(-6)}`,
      tenantId: "tenant-demo-01",
      firstVisitDate: now.slice(0, 10),
      lastVisitDate: now.slice(0, 10),
      totalVisits: 0,
      totalSpent: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    setPatients((prev) => [newPatient, ...prev]);
    return newPatient;
  }, []);

  const updatePatient = React.useCallback((id: string, update: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...update, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const value = React.useMemo(() => ({ patients, addPatient, updatePatient }), [patients, addPatient, updatePatient]);

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
}

export function usePatientsStore() {
  const ctx = React.useContext(PatientsContext);
  if (!ctx) throw new Error("usePatientsStore must be used within PatientsProvider");
  return ctx;
}
