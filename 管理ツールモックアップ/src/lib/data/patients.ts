import type { Patient, PatientTag } from "@/types";
import { patients as seedPatients, staffList, reservations, medicalRecords, payments, coupons } from "./seed";

export interface PatientFilters {
  keyword?: string; // 名前・カナ・電話の部分一致
  tags?: PatientTag[];
  preferredStaffId?: string;
  lastVisitThreshold?: 30 | 60 | 90;
  dropoutOnly?: boolean;
}

export function listPatients(filters: PatientFilters = {}): Patient[] {
  return seedPatients.filter((p) => {
    if (filters.keyword) {
      const k = filters.keyword.toLowerCase();
      const hay = [p.lastName, p.firstName, p.lastNameKana, p.firstNameKana, p.phone]
        .join("")
        .toLowerCase();
      if (!hay.includes(k)) return false;
    }
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((t) => p.tags.includes(t))) return false;
    }
    if (filters.preferredStaffId) {
      if (p.preferredStaffId !== filters.preferredStaffId) return false;
    }
    if (filters.lastVisitThreshold) {
      const days = Math.floor((Date.now() - new Date(p.lastVisitDate).getTime()) / 86400_000);
      if (days < filters.lastVisitThreshold) return false;
    }
    if (filters.dropoutOnly) {
      const days = Math.floor((Date.now() - new Date(p.lastVisitDate).getTime()) / 86400_000);
      if (days < 60) return false;
    }
    return true;
  });
}

export function getPatient(id: string): Patient | undefined {
  return seedPatients.find((p) => p.id === id);
}

export function getPatientRelations(patientId: string) {
  const p = getPatient(patientId);
  if (!p) return null;
  const staff = p.preferredStaffId ? staffList.find((s) => s.id === p.preferredStaffId) : undefined;
  const history = reservations
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => b.startAt.localeCompare(a.startAt));
  const records = medicalRecords
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const patientPayments = payments.filter((pay) => pay.patientId === patientId);
  const patientCoupons = coupons.filter((c) => c.patientId === patientId);
  const family = p.familyGroupId
    ? seedPatients.filter((x) => x.familyGroupId === p.familyGroupId && x.id !== p.id)
    : [];
  return { patient: p, staff, history, records, payments: patientPayments, coupons: patientCoupons, family };
}

export function getAllStaffOptions() {
  return staffList.filter((s) => s.roleLabel !== "受付" && s.role !== "group_owner");
}
