"use client";

import { Network, TrendingUp, TrendingDown, Users as UsersIcon, ArrowRightLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { tenants, tenantGroup, branchKpis } from "@/lib/data/seed";
import { cn, formatCurrency } from "@/lib/utils";

const CLINIC_TYPE_LABEL: Record<string, string> = {
  seikotsu: "整骨院",
  seitai: "整体院",
  shinkyu: "鍼灸院",
  sekkotsuin: "接骨院",
  mixed: "複合",
  other: "その他",
};

export default function GroupComparisonPage() {
  const sorted = [...branchKpis].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
  const groupRevenue = branchKpis.reduce((s, b) => s + b.monthlyRevenue, 0);
  const groupVisits = branchKpis.reduce((s, b) => s + b.monthlyVisits, 0);
  const groupNew = branchKpis.reduce((s, b) => s + b.newPatients, 0);
  const groupStaff = branchKpis.reduce((s, b) => s + b.staffCount, 0);
  const avgRepeat = Math.round(branchKpis.reduce((s, b) => s + b.repeatRate, 0) / branchKpis.length);
  const avgCancel = Math.round((branchKpis.reduce((s, b) => s + b.cancelRate, 0) / branchKpis.length) * 10) / 10;
  const maxRevenue = Math.max(...branchKpis.map((b) => b.monthlyRevenue));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="店舗比較レポート"
        description={`${tenantGroup.name}・${tenants.length}店舗の横断比較（GroupOwner専用）`}
        badge={
          <Badge variant="default" className="text-[10px]">
            <Network className="h-3 w-3 mr-1" />
            グループ機能
          </Badge>
        }
        actions={
          <Button variant="outline" disabled>
            <ArrowRightLeft className="h-4 w-4" />
            スタッフ異動（近日）
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">グループ月商</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(groupRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">月次来院</p>
            <p className="text-2xl font-bold">{groupVisits}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">今月の新患</p>
            <p className="text-2xl font-bold text-emerald-600">{groupNew}名</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">総スタッフ</p>
            <p className="text-2xl font-bold">{groupStaff}名</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>店舗別 売上ランキング</CardTitle>
          <CardDescription>今月の実績（目標対比）</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {sorted.map((b, i) => {
              const t = tenants.find((x) => x.id === b.tenantId)!;
              const pct = Math.round((b.monthlyRevenue / maxRevenue) * 100);
              const targetRate = Math.round((b.monthlyRevenue / b.target) * 100);
              return (
                <div key={b.tenantId} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono w-5 text-muted-foreground">{i + 1}.</span>
                    <span
                      className="h-8 w-1 rounded shrink-0"
                      style={{ backgroundColor: t.logoColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{t.branchName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {CLINIC_TYPE_LABEL[t.clinicType]}
                        </Badge>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {t.prefecture}・{t.city}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        スタッフ {b.staffCount}名 ・ 来院 {b.monthlyVisits}件 ・ 客単価{" "}
                        {formatCurrency(b.avgTicket)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{formatCurrency(b.monthlyRevenue)}</p>
                      <p
                        className={cn(
                          "text-xs",
                          targetRate >= 100 ? "text-emerald-600" : targetRate >= 75 ? "text-primary" : "text-amber-600"
                        )}
                      >
                        目標対比 {targetRate}%
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden ml-8">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: t.logoColor }}
                    />
                  </div>
                </div>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>再来院率の比較</CardTitle>
            <CardDescription>平均 {avgRepeat}%</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {branchKpis.map((b) => {
                const t = tenants.find((x) => x.id === b.tenantId)!;
                const diff = b.repeatRate - avgRepeat;
                return (
                  <li key={b.tenantId} className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.logoColor }} />
                    <span className="flex-1">{t.branchName}</span>
                    <span className="font-medium">{b.repeatRate}%</span>
                    <span
                      className={cn(
                        "text-xs w-12 text-right inline-flex items-center justify-end gap-0.5",
                        diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-600" : "text-muted-foreground"
                      )}
                    >
                      {diff > 0 ? <TrendingUp className="h-3 w-3" /> : diff < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                      {diff > 0 ? "+" : ""}
                      {diff}pt
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>キャンセル率の比較</CardTitle>
            <CardDescription>平均 {avgCancel}%（低いほど良い）</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {branchKpis.map((b) => {
                const t = tenants.find((x) => x.id === b.tenantId)!;
                const diff = b.cancelRate - avgCancel;
                return (
                  <li key={b.tenantId} className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.logoColor }} />
                    <span className="flex-1">{t.branchName}</span>
                    <span className="font-medium">{b.cancelRate}%</span>
                    <span
                      className={cn(
                        "text-xs w-12 text-right",
                        diff < 0 ? "text-emerald-600" : diff > 0 ? "text-rose-600" : "text-muted-foreground"
                      )}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff.toFixed(1)}pt
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>新患獲得の比較</CardTitle>
            <CardDescription>今月の新患数</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {branchKpis
                .slice()
                .sort((a, b) => b.newPatients - a.newPatients)
                .map((b) => {
                  const t = tenants.find((x) => x.id === b.tenantId)!;
                  const max = Math.max(...branchKpis.map((x) => x.newPatients));
                  const pct = Math.round((b.newPatients / max) * 100);
                  return (
                    <li key={b.tenantId} className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.logoColor }} />
                        <span className="flex-1">{t.branchName}</span>
                        <span className="font-medium">{b.newPatients}名</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.logoColor }} />
                      </div>
                    </li>
                  );
                })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>店舗情報</CardTitle>
          <CardDescription>各店舗の基本情報と担当者</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>店舗</TableHead>
                <TableHead>業種</TableHead>
                <TableHead>地域</TableHead>
                <TableHead>開業年</TableHead>
                <TableHead>営業時間</TableHead>
                <TableHead className="text-right">ベッド数</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.logoColor }} />
                      <div>
                        <p className="font-medium">{t.branchName}</p>
                        <p className="text-xs text-muted-foreground">{t.address}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {CLINIC_TYPE_LABEL[t.clinicType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{t.prefecture}・{t.city}</TableCell>
                  <TableCell className="text-sm">{t.establishedYear}年</TableCell>
                  <TableCell className="text-sm">{t.businessHours.open}〜{t.businessHours.close}</TableCell>
                  <TableCell className="text-right">{t.bedCount}台</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>
                      <UsersIcon className="h-3.5 w-3.5" />
                    </Button>
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
