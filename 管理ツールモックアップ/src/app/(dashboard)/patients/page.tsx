"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientFilters, DEFAULT_FILTERS, type PatientFiltersState } from "@/components/patients/patient-filters";
import { PatientTable, type SortKey, type SortDir } from "@/components/patients/patient-table";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { usePatientsStore } from "@/hooks/use-patients-store";
import { useWorkspace } from "@/hooks/use-workspace-store";
import { tenants, tenantGroup } from "@/lib/data/seed";
import type { Patient } from "@/types";

const PAGE_SIZE = 20;

export default function PatientsPage() {
  const { patients: allPatients } = usePatientsStore();
  const { currentTenantId } = useWorkspace();
  const [filters, setFilters] = React.useState<PatientFiltersState>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = React.useState<SortKey>("lastVisit");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [formOpen, setFormOpen] = React.useState(false);

  const patients = React.useMemo(
    () => (currentTenantId === "all" ? allPatients : allPatients.filter((p) => p.tenantId === currentTenantId)),
    [allPatients, currentTenantId]
  );

  const currentTenant = tenants.find((t) => t.id === currentTenantId);
  const scopeLabel =
    currentTenantId === "all"
      ? `${tenantGroup.name}（全${tenants.length}店舗）`
      : currentTenant?.name ?? "—";

  const filtered = React.useMemo(() => {
    return applyFilters(patients, filters);
  }, [patients, filters]);

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return dir * a.lastNameKana.localeCompare(b.lastNameKana);
      if (sortKey === "lastVisit") return dir * a.lastVisitDate.localeCompare(b.lastVisitDate);
      return dir * (a.totalVisits - b.totalVisits);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [filters, sortKey, sortDir]);

  const handleSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">患者管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {scopeLabel}・登録 {patients.length} 名・離脱アラート対象 {patients.filter((p) => daysAgo(p.lastVisitDate) >= 60).length} 名
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          新規患者登録
        </Button>
      </div>

      <PatientFilters
        value={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={patients.length}
      />

      <PatientTable patients={paged} sortKey={sortKey} sortDir={sortDir} onSortChange={handleSortChange} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, sorted.length)} / {sorted.length} 件
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              前へ
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              次へ
            </Button>
          </div>
        </div>
      )}

      <PatientFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function applyFilters(patients: Patient[], filters: PatientFiltersState): Patient[] {
  return patients.filter((p) => {
    if (filters.keyword) {
      const k = filters.keyword.toLowerCase();
      const hay = `${p.lastName}${p.firstName}${p.lastNameKana}${p.firstNameKana}${p.phone}`.toLowerCase();
      if (!hay.includes(k)) return false;
    }
    if (filters.tags.length > 0 && !filters.tags.some((t) => p.tags.includes(t))) return false;
    if (filters.preferredStaffId !== "all" && p.preferredStaffId !== filters.preferredStaffId) return false;
    if (filters.lastVisitThreshold !== "all") {
      if (daysAgo(p.lastVisitDate) < Number(filters.lastVisitThreshold)) return false;
    }
    if (filters.dropoutOnly && daysAgo(p.lastVisitDate) < 60) return false;
    return true;
  });
}

function daysAgo(isoDate: string): number {
  return Math.floor((new Date("2026-04-15").getTime() - new Date(isoDate).getTime()) / 86400_000);
}
