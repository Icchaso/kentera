"use client";

import { Building2, Plus, Users, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";

const tenantsDemo = [
  {
    id: "tenant-demo-01",
    name: "デモ整骨院",
    area: "東京都世田谷区",
    plan: "pro",
    staff: 4,
    patients: 50,
    monthlyRevenue: 3_800_000,
    activeUsers: 4,
    lastLogin: "2026-04-15T09:12:00",
    status: "active",
    startedAt: "2025-11-01",
  },
  {
    id: "tenant-002",
    name: "青葉はり灸院",
    area: "神奈川県横浜市",
    plan: "basic",
    staff: 2,
    patients: 78,
    monthlyRevenue: 1_650_000,
    activeUsers: 2,
    lastLogin: "2026-04-15T08:40:00",
    status: "active",
    startedAt: "2026-01-15",
  },
  {
    id: "tenant-003",
    name: "みどり整体院",
    area: "千葉県柏市",
    plan: "basic",
    staff: 3,
    patients: 102,
    monthlyRevenue: 2_100_000,
    activeUsers: 3,
    lastLogin: "2026-04-14T20:05:00",
    status: "active",
    startedAt: "2025-09-20",
  },
  {
    id: "tenant-004",
    name: "けやき接骨院",
    area: "埼玉県さいたま市",
    plan: "free",
    staff: 1,
    patients: 12,
    monthlyRevenue: 180_000,
    activeUsers: 1,
    lastLogin: "2026-04-10T15:22:00",
    status: "trial",
    startedAt: "2026-03-25",
  },
  {
    id: "tenant-005",
    name: "太陽鍼灸整骨院",
    area: "大阪府大阪市",
    plan: "pro",
    staff: 6,
    patients: 189,
    monthlyRevenue: 5_200_000,
    activeUsers: 5,
    lastLogin: "2026-04-15T07:55:00",
    status: "active",
    startedAt: "2025-06-10",
  },
  {
    id: "tenant-006",
    name: "ハート整骨院",
    area: "福岡県福岡市",
    plan: "basic",
    staff: 2,
    patients: 43,
    monthlyRevenue: 780_000,
    activeUsers: 1,
    lastLogin: "2026-04-02T11:30:00",
    status: "inactive",
    startedAt: "2025-12-05",
  },
];

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise",
};
const PLAN_VARIANT: Record<string, "muted" | "secondary" | "default" | "success"> = {
  free: "muted",
  basic: "secondary",
  pro: "default",
  enterprise: "success",
};
const STATUS_LABEL: Record<string, string> = {
  active: "稼働中",
  trial: "トライアル",
  inactive: "休止中",
};
const STATUS_VARIANT: Record<string, "success" | "warning" | "muted"> = {
  active: "success",
  trial: "warning",
  inactive: "muted",
};

export default function TenantsAdminPage() {
  const totalRevenue = tenantsDemo.reduce((s, t) => s + t.monthlyRevenue, 0);
  const totalPatients = tenantsDemo.reduce((s, t) => s + t.patients, 0);
  const active = tenantsDemo.filter((t) => t.status === "active").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="テナント管理"
        description="全院の利用状況を一括管理（SuperAdmin）"
        badge={
          <Badge variant="default" className="text-[10px] bg-slate-900">
            SuperAdmin
          </Badge>
        }
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            新規テナント
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">登録テナント</p>
              <p className="text-2xl font-bold">{tenantsDemo.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">アクティブ</p>
              <p className="text-2xl font-bold">{active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">管理下の患者</p>
              <p className="text-2xl font-bold">{totalPatients}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">全院合計売上（月）</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>テナント一覧</CardTitle>
          <CardDescription>全 {tenantsDemo.length} 院</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>院名</TableHead>
                <TableHead>地域</TableHead>
                <TableHead>プラン</TableHead>
                <TableHead>スタッフ / 患者</TableHead>
                <TableHead className="text-right">月次売上</TableHead>
                <TableHead>最終ログイン</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantsDemo.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">契約開始 {formatDate(t.startedAt)}</p>
                  </TableCell>
                  <TableCell className="text-sm">{t.area}</TableCell>
                  <TableCell>
                    <Badge variant={PLAN_VARIANT[t.plan]} className="text-[10px]">
                      {PLAN_LABEL[t.plan]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {t.staff}名 / {t.patients}名
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{formatCurrency(t.monthlyRevenue)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(t.lastLogin, "datetime")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[t.status]} className="text-[10px]">
                      {t.status === "inactive" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                      {STATUS_LABEL[t.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">詳細</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
