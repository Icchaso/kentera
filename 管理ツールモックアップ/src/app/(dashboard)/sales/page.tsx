"use client";

import { Coins, CreditCard, Wallet, Receipt, Target, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { payments, menus, staffList, reservations, tenants, tenantGroup, scopeByTenant, getDailyRevenueLast30, getKpis } from "@/lib/data/seed";
import { useWorkspace } from "@/hooks/use-workspace-store";
import { cn, formatCurrency } from "@/lib/utils";

const METHOD_LABEL: Record<string, string> = {
  cash: "現金",
  credit: "クレカ",
  qr: "QR決済",
  coupon: "回数券",
  insurance: "保険",
  mixed: "混合",
};

export default function SalesPage() {
  const { currentTenantId } = useWorkspace();
  const daily = getDailyRevenueLast30(currentTenantId);
  const kpi = getKpis(currentTenantId);
  const total30 = kpi.totalRevenue30;

  const scopedPayments = scopeByTenant(payments, currentTenantId);
  const scopedReservations = scopeByTenant(reservations, currentTenantId);
  const scopedMenus = scopeByTenant(menus, currentTenantId);
  const scopedStaff =
    currentTenantId === "all" ? staffList : staffList.filter((s) => s.tenantId === currentTenantId);
  const currentTenant = tenants.find((t) => t.id === currentTenantId);
  const scopeLabel =
    currentTenantId === "all"
      ? `${tenantGroup.name}（全${tenants.length}店舗集計）`
      : currentTenant?.name ?? "—";

  const byMenu = scopedMenus
    .map((m) => {
      const items = scopedPayments.flatMap((p) => p.items.filter((i) => i.menuId === m.id));
      const revenue = items.reduce((s, i) => s + i.price * i.quantity, 0);
      return { menu: m, revenue, count: items.length };
    })
    .filter((x) => x.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const byMethod = scopedPayments.reduce<Record<string, { count: number; total: number }>>((acc, p) => {
    acc[p.paymentMethod] = acc[p.paymentMethod] ?? { count: 0, total: 0 };
    acc[p.paymentMethod].count++;
    acc[p.paymentMethod].total += p.total;
    return acc;
  }, {});

  const byStaff = scopedStaff
    .filter((s) => s.roleLabel !== "受付" && s.role !== "group_owner")
    .map((s) => {
      const sRes = scopedReservations.filter((r) => r.staffId === s.id && r.status === "paid");
      const sPayments = scopedPayments.filter((p) => sRes.some((r) => r.id === p.reservationId));
      const revenue = sPayments.reduce((sum, p) => sum + p.total, 0);
      const target = s.monthlyTarget ?? 0;
      return { staff: s, revenue, count: sRes.length, target };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const latestPayments = [...scopedPayments].sort((a, b) => b.paidAt.localeCompare(a.paidAt)).slice(0, 10);

  const expenseMultiplier =
    currentTenantId === "all" ? 3 : currentTenantId === "tenant-demo-02" ? 0.7 : currentTenantId === "tenant-demo-03" ? 0.5 : 1;
  const expenses = [
    { cat: "家賃", amount: Math.round(280_000 * expenseMultiplier) },
    { cat: "光熱費", amount: Math.round(38_000 * expenseMultiplier) },
    { cat: "人件費", amount: Math.round(1_450_000 * expenseMultiplier) },
    { cat: "消耗品", amount: Math.round(42_000 * expenseMultiplier) },
    { cat: "広告費", amount: Math.round(120_000 * expenseMultiplier) },
    { cat: "設備", amount: Math.round(55_000 * expenseMultiplier) },
  ];
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = total30 - totalExpense;

  const monthlyTarget =
    currentTenantId === "all"
      ? 9_700_000
      : currentTenantId === "tenant-demo-01"
      ? 4_500_000
      : currentTenantId === "tenant-demo-02"
      ? 3_000_000
      : 2_200_000;
  const targetRate = total30 === 0 ? 0 : Math.round((total30 / monthlyTarget) * 100);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="売上・会計"
        description={`${scopeLabel}・日次から月次まで経営の数字をひと目で`}
        actions={
          <>
            <Button variant="outline" disabled>
              <Receipt className="h-4 w-4" />
              レシート発行
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              会計処理
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard tone="primary" size="lg" label="今月の売上（30日）" value={formatCurrency(total30)} deltaPct={8} icon={Coins} />
        <KpiCard tone="accent" size="lg" label="経費合計" value={formatCurrency(totalExpense)} deltaPct={-3} icon={Wallet} />
        <KpiCard
          tone="success"
          size="lg"
          label="営業利益"
          value={formatCurrency(profit)}
          sub={`利益率 ${Math.round((profit / total30) * 100)}%`}
          icon={TrendingUp}
        />
        <KpiCard
          tone="warning"
          size="lg"
          label="目標達成率"
          value={`${targetRate}%`}
          sub={`目標 ${formatCurrency(monthlyTarget)}`}
          icon={Target}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">売上推移</TabsTrigger>
          <TabsTrigger value="menus">メニュー別</TabsTrigger>
          <TabsTrigger value="staff">スタッフ別</TabsTrigger>
          <TabsTrigger value="methods">支払い方法</TabsTrigger>
          <TabsTrigger value="expenses">経費・損益</TabsTrigger>
          <TabsTrigger value="payments">会計履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>日次売上（過去30日）</CardTitle>
              <CardDescription>来院ベースでの自動集計</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={daily} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menus">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>メニュー別売上ランキング</CardTitle>
              <CardDescription>過去3ヶ月</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {byMenu.map((x, i) => {
                  const max = byMenu[0].revenue;
                  const pct = Math.round((x.revenue / max) * 100);
                  return (
                    <li key={x.menu.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono w-5 text-muted-foreground">{i + 1}.</span>
                          <span className="font-medium">{x.menu.name}</span>
                          <Badge
                            variant={x.menu.category === "insurance" ? "secondary" : x.menu.category === "self_pay" ? "default" : "muted"}
                            className="text-[10px]"
                          >
                            {x.menu.category === "insurance" ? "保険" : x.menu.category === "self_pay" ? "自費" : "物販"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{x.count}件</span>
                        </div>
                        <span className="font-semibold text-primary">{formatCurrency(x.revenue)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-sky-400" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {byStaff.map((x) => {
              const rate = x.target === 0 ? 0 : Math.round((x.revenue / x.target) * 100);
              return (
                <Card key={x.staff.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: x.staff.color }} />
                      <CardTitle className="text-base">{x.staff.displayName}</CardTitle>
                    </div>
                    <CardDescription>施術 {x.count}件・月次目標{x.target === 0 ? "なし" : formatCurrency(x.target)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(x.revenue)}</p>
                    {x.target > 0 && (
                      <>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", rate >= 100 ? "bg-emerald-500" : rate >= 75 ? "bg-primary" : "bg-amber-500")}
                            style={{ width: `${Math.min(rate, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">目標達成率</span>
                          <span className="font-medium">{rate}%</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="methods">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>支払い方法の内訳</CardTitle>
              <CardDescription>過去3ヶ月の全会計</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(byMethod)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([method, v]) => {
                    const totalAll = Object.values(byMethod).reduce((s, x) => s + x.total, 0);
                    const pct = Math.round((v.total / totalAll) * 100);
                    return (
                      <div key={method} className="flex items-center gap-3 p-3 rounded-md border border-border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{METHOD_LABEL[method]}</p>
                          <p className="text-xs text-muted-foreground">{v.count}件・{pct}%</p>
                        </div>
                        <p className="font-semibold text-primary">{formatCurrency(v.total)}</p>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>今月の経費</CardTitle>
                  <CardDescription>カテゴリ別支出</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-3.5 w-3.5" />
                  経費を追加
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>カテゴリ</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="text-right">構成比</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((e) => (
                      <TableRow key={e.cat}>
                        <TableCell>{e.cat}</TableCell>
                        <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {Math.round((e.amount / totalExpense) * 100)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold bg-muted/40">
                      <TableCell>合計</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalExpense)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>簡易損益（今月）</CardTitle>
                <CardDescription>売上 − 経費 = 営業利益</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <LineItem label="売上" value={total30} tone="primary" />
                <LineItem label="経費" value={-totalExpense} tone="destructive" />
                <div className="border-t border-border pt-3">
                  <LineItem label="営業利益" value={profit} tone="success" bold />
                </div>
                <div className="pt-2 text-xs text-muted-foreground space-y-1">
                  <p>※ 概算値です。税金等は含まれません</p>
                  <p>※ 確定申告用の詳細レポートは Phase 1 で提供予定</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>最近の会計履歴</CardTitle>
              <CardDescription>直近10件</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>レシート#</TableHead>
                    <TableHead>日時</TableHead>
                    <TableHead>メニュー</TableHead>
                    <TableHead>支払い方法</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.receiptNumber}</TableCell>
                      <TableCell className="text-sm">{p.paidAt.slice(0, 16).replace("T", " ")}</TableCell>
                      <TableCell className="text-sm">{p.items.map((i) => i.name).join("、")}</TableCell>
                      <TableCell>
                        <Badge variant="muted" className="text-[10px]">
                          {METHOD_LABEL[p.paymentMethod]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(p.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LineItem({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: number;
  tone: "primary" | "destructive" | "success";
  bold?: boolean;
}) {
  const color = tone === "destructive" ? "text-rose-600" : tone === "success" ? "text-emerald-600" : "text-primary";
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-sm", bold && "font-semibold")}>{label}</span>
      <span className={cn("font-mono", bold ? "text-xl font-bold" : "text-base", color)}>
        {value < 0 ? "−" : ""}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
