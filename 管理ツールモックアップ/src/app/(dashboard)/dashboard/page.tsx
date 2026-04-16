"use client";

import {
  getTodayStats,
  getKpis,
  getDailyRevenueLast30,
  getHeatmap,
  getPatientFlow,
  getStaffRanking,
  alerts,
  reservations,
  patients,
  tenants,
  tenantGroup,
  scopeByTenant,
} from "@/lib/data/seed";
import { useWorkspace } from "@/hooks/use-workspace-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PatientFlowChart } from "@/components/dashboard/patient-flow-chart";
import { TimeHeatmap } from "@/components/dashboard/time-heatmap";
import { AlertList } from "@/components/dashboard/alert-list";
import { StaffRanking } from "@/components/dashboard/staff-ranking";
import {
  Calendar,
  Users,
  Coins,
  TrendingUp,
  UserPlus,
  Repeat,
  XCircle,
  Activity,
  MessageSquareText,
  Network,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const TODAY = new Date("2026-04-16");

export default function DashboardPage() {
  const { currentTenantId } = useWorkspace();
  const today = getTodayStats(currentTenantId);
  const kpi = getKpis(currentTenantId);
  const daily = getDailyRevenueLast30(currentTenantId);
  const heatmap = getHeatmap(currentTenantId);
  const flow = getPatientFlow(currentTenantId);
  const ranking = getStaffRanking(currentTenantId);

  const scopedReservations = scopeByTenant(reservations, currentTenantId);
  const scopedPatients = scopeByTenant(patients, currentTenantId);
  const scopedAlerts =
    currentTenantId === "all"
      ? alerts
      : alerts.filter((a) => {
          if (!a.patientId) return true; // グループ共通アラートは表示
          const p = patients.find((x) => x.id === a.patientId);
          return p?.tenantId === currentTenantId;
        });

  const todayReservations = scopedReservations
    .filter((r) => r.startAt.slice(0, 10) === TODAY.toISOString().slice(0, 10))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 6);

  const scopeLabel =
    currentTenantId === "all"
      ? `${tenantGroup.name}（全${tenants.length}店舗）`
      : tenants.find((t) => t.id === currentTenantId)?.branchName ?? "—";

  const monthlyTarget =
    currentTenantId === "all"
      ? 9_700_000
      : currentTenantId === "tenant-demo-01"
      ? 4_500_000
      : currentTenantId === "tenant-demo-02"
      ? 3_000_000
      : 2_200_000;
  const monthlyActual = Math.round(kpi.totalRevenue30 * 0.87);
  const targetRate = Math.round((monthlyActual / monthlyTarget) * 100);

  const isGroupView = currentTenantId === "all";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(TODAY, "date")}（木）・{scopeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isGroupView && (
            <Badge variant="default" className="text-xs">
              <Network className="h-3 w-3 mr-1" />
              グループ横断ビュー
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            <MessageSquareText className="h-3 w-3 mr-1" /> LINE経由予約{" "}
            {Math.round(scopedReservations.filter((r) => r.source === "line").length / 3)}件（今月）
          </Badge>
          <Badge variant="outline" className="text-xs">
            最終更新 09:00
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <KpiCard
          tone="primary"
          size="lg"
          label="本日の予約"
          value={`${today.reservations}件`}
          sub={`来院済 ${today.arrived}件 / 残り ${Math.max(today.reservations - today.arrived, 0)}件`}
          icon={Calendar}
        />
        <KpiCard
          tone="accent"
          size="lg"
          label="本日の売上"
          value={formatCurrency(today.revenue)}
          sub="会計済のみ集計"
          icon={Coins}
        />
        <KpiCard
          tone="success"
          size="lg"
          label="本日の新患"
          value={`${today.newPatients}名`}
          sub="Web予約 1 / 紹介 1"
          icon={UserPlus}
        />
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="新患数（30日）" value={`${kpi.newPatients30}名`} deltaPct={12} icon={UserPlus} />
        <KpiCard label="再来院率" value={`${kpi.repeatRate}%`} deltaPct={3} icon={Repeat} />
        <KpiCard label="キャンセル率" value={`${kpi.cancelRate}%`} deltaPct={-1.2} icon={XCircle} />
        <KpiCard label="客単価" value={formatCurrency(kpi.avgTicket)} deltaPct={5} icon={TrendingUp} />
        <KpiCard label="稼働率" value={`${kpi.utilization}%`} deltaPct={4} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle>売上推移（過去30日）</CardTitle>
              <CardDescription>{isGroupView ? "全店舗集計" : scopeLabel} の日次推移</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">30日合計</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(kpi.totalRevenue30)}</p>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart data={daily} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>今月の目標進捗</CardTitle>
            <CardDescription>
              {formatCurrency(monthlyActual)} / {formatCurrency(monthlyTarget)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-primary">{targetRate}%</span>
                <span className={targetRate >= 75 ? "text-xs text-emerald-600" : "text-xs text-amber-600"}>
                  {targetRate >= 75 ? "順調" : "やや遅れ"}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-sky-400 transition-all"
                  style={{ width: `${Math.min(targetRate, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">残り必要額</span>
                <span className="font-medium">{formatCurrency(Math.max(monthlyTarget - monthlyActual, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">残り営業日</span>
                <span className="font-medium">13日</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">日次必要額</span>
                <span className="font-medium text-primary">
                  {formatCurrency(Math.round(Math.max(monthlyTarget - monthlyActual, 0) / 13))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>患者動態（過去6ヶ月）</CardTitle>
            <CardDescription>新患 / リピート / 離脱の月次推移</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientFlowChart data={flow} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>時間帯ヒートマップ</CardTitle>
            <CardDescription>曜日×時間帯の予約密度（過去4週）</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeHeatmap cells={heatmap} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>本日の予約</CardTitle>
              <CardDescription>直近6件・{scopeLabel}</CardDescription>
            </div>
            <Link href="/reservations" className="text-xs text-primary hover:underline">
              すべて表示
            </Link>
          </CardHeader>
          <CardContent>
            {todayReservations.length === 0 ? (
              <p className="text-sm text-muted-foreground">本日の予約はありません</p>
            ) : (
              <ul className="space-y-3">
                {todayReservations.map((r) => {
                  const patient = scopedPatients.find((p) => p.id === r.patientId);
                  return (
                    <li key={r.id} className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-xs text-muted-foreground shrink-0 w-12">
                        {formatDate(new Date(r.startAt), "time")}
                      </span>
                      <span className="flex-1 truncate font-medium">
                        {patient ? `${patient.lastName} ${patient.firstName}` : "—"}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.source === "line" ? "LINE" : r.source === "online" ? "Web" : "来店"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>アラート</CardTitle>
            <CardDescription>要確認 {scopedAlerts.length}件</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <AlertList items={scopedAlerts.slice(0, 5)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>スタッフランキング</CardTitle>
              <CardDescription>過去30日売上ベース・{scopeLabel}</CardDescription>
            </div>
            <Badge variant="muted" className="text-[10px] flex items-center gap-1">
              <Users className="h-3 w-3" />
              {ranking.length}名
            </Badge>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-sm text-muted-foreground">データなし</p>
            ) : (
              <StaffRanking items={ranking} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
