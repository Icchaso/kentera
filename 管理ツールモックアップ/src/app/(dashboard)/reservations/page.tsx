"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MessageCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { reservations, patients, staffList, menus, tenant } from "@/lib/data/seed";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const TODAY = new Date("2026-04-15");

const STATUS_CFG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "muted"; dot: string }
> = {
  reserved: { label: "予約済", variant: "secondary", dot: "bg-sky-500" },
  arrived: { label: "来院", variant: "default", dot: "bg-blue-500" },
  in_treatment: { label: "施術中", variant: "default", dot: "bg-indigo-500" },
  completed: { label: "完了", variant: "success", dot: "bg-emerald-500" },
  paid: { label: "会計済", variant: "success", dot: "bg-emerald-600" },
  cancelled: { label: "キャンセル", variant: "destructive", dot: "bg-rose-500" },
  no_show: { label: "未来院", variant: "warning", dot: "bg-amber-500" },
};

function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 月曜始まり
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function ReservationsPage() {
  const [baseDate, setBaseDate] = React.useState(TODAY);
  const weekStart = React.useMemo(() => startOfWeek(baseDate), [baseDate]);
  const days = React.useMemo(
    () => Array.from({ length: 6 }, (_, i) => new Date(weekStart.getTime() + i * 86400_000)),
    [weekStart]
  );

  const todayReservations = reservations
    .filter((r) => sameDay(new Date(r.startAt), TODAY))
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  const todayCount = todayReservations.length;
  const todayPaid = todayReservations.filter((r) => r.status === "paid").length;
  const todayCancelled = todayReservations.filter((r) => r.status === "cancelled").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="予約管理"
        description={`${tenant.name}・スタッフ${staffList.filter((s) => s.role !== "reception").length}名・ベッド${tenant.bedCount}台`}
        actions={
          <>
            <Button variant="outline" disabled>
              <CalendarIcon className="h-4 w-4" />
              予約枠設定
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              新規予約
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">本日の予約</p>
            <p className="text-2xl font-bold">{todayCount}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">会計済</p>
            <p className="text-2xl font-bold text-emerald-600">{todayPaid}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">キャンセル</p>
            <p className="text-2xl font-bold text-rose-600">{todayCancelled}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">LINE経由（今月）</p>
            <p className="text-2xl font-bold">24件</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="week">
        <TabsList>
          <TabsTrigger value="week">週ビュー</TabsTrigger>
          <TabsTrigger value="day">日ビュー（本日）</TabsTrigger>
          <TabsTrigger value="staff">スタッフ別</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle>
                  {formatDate(weekStart, "monthDay")} 〜{" "}
                  {formatDate(new Date(weekStart.getTime() + 5 * 86400_000), "monthDay")}
                </CardTitle>
                <CardDescription>月曜始まり・日曜休診</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setBaseDate(new Date(baseDate.getTime() - 7 * 86400_000))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBaseDate(TODAY)}>
                  今日
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setBaseDate(new Date(baseDate.getTime() + 7 * 86400_000))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto scrollbar-thin">
              <div className="grid grid-cols-6 gap-2 min-w-[900px]">
                {days.map((d) => {
                  const dayRes = reservations
                    .filter((r) => sameDay(new Date(r.startAt), d))
                    .sort((a, b) => a.startAt.localeCompare(b.startAt));
                  const isToday = sameDay(d, TODAY);
                  return (
                    <div key={d.toISOString()} className="space-y-2">
                      <div
                        className={cn(
                          "text-xs font-medium text-center py-1.5 rounded",
                          isToday ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        )}
                      >
                        {["月", "火", "水", "木", "金", "土"][d.getDay() === 0 ? 6 : d.getDay() - 1]}{" "}
                        {d.getMonth() + 1}/{d.getDate()}
                      </div>
                      <div className="space-y-1.5 max-h-[460px] overflow-y-auto scrollbar-thin pr-1">
                        {dayRes.length === 0 && (
                          <p className="text-[11px] text-muted-foreground text-center py-4">予約なし</p>
                        )}
                        {dayRes.map((r) => {
                          const p = patients.find((x) => x.id === r.patientId);
                          const s = staffList.find((x) => x.id === r.staffId);
                          const m = menus.find((x) => x.id === r.menuId);
                          const cfg = STATUS_CFG[r.status];
                          return (
                            <div
                              key={r.id}
                              className="rounded border border-border bg-card p-2 text-xs hover:shadow-sm transition-shadow cursor-pointer"
                              style={{ borderLeftColor: s?.color, borderLeftWidth: 3 }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {formatDate(r.startAt, "time")}
                                </span>
                                <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                              </div>
                              <p className="font-medium truncate">{p ? `${p.lastName} ${p.firstName}` : "—"}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{m?.name}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>本日 {formatDate(TODAY)} の予約</CardTitle>
              <CardDescription>時系列順・{todayReservations.length}件</CardDescription>
            </CardHeader>
            <CardContent>
              {todayReservations.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">本日の予約はありません</p>
              ) : (
                <ul className="divide-y divide-border">
                  {todayReservations.map((r) => {
                    const p = patients.find((x) => x.id === r.patientId);
                    const s = staffList.find((x) => x.id === r.staffId);
                    const m = menus.find((x) => x.id === r.menuId);
                    const cfg = STATUS_CFG[r.status];
                    return (
                      <li key={r.id} className="flex items-center gap-4 py-3">
                        <span className="font-mono text-sm text-muted-foreground w-16 shrink-0">
                          {formatDate(r.startAt, "time")}
                        </span>
                        <span className="h-10 w-1 rounded shrink-0" style={{ backgroundColor: s?.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {p ? (
                              <Link
                                href={`/patients/${p.id}`}
                                className="font-medium hover:text-primary hover:underline truncate"
                              >
                                {p.lastName} {p.firstName}
                              </Link>
                            ) : (
                              <span className="font-medium">—</span>
                            )}
                            <Badge variant="outline" className="text-[10px]">
                              {r.source === "line" ? "LINE" : r.source === "online" ? "Web" : "来店"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {m?.name} ・ {s?.displayName} ・ {m?.durationMinutes}分
                          </p>
                        </div>
                        <Badge variant={cfg.variant} className="text-[10px]">
                          {cfg.label}
                        </Badge>
                        {m && <span className="text-sm font-medium w-20 text-right">{formatCurrency(m.price)}</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staffList
              .filter((s) => s.role !== "reception")
              .map((s) => {
                const todayForStaff = todayReservations.filter((r) => r.staffId === s.id);
                return (
                  <Card key={s.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <CardTitle className="text-base">{s.displayName}</CardTitle>
                        <Badge variant="muted" className="text-[10px] ml-auto">
                          {todayForStaff.length}件
                        </Badge>
                      </div>
                      <CardDescription>{s.specialties.slice(0, 3).join("・")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {todayForStaff.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">本日の担当予約はありません</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {todayForStaff.map((r) => {
                            const p = patients.find((x) => x.id === r.patientId);
                            const m = menus.find((x) => x.id === r.menuId);
                            return (
                              <li key={r.id} className="flex items-center gap-2 text-sm">
                                <span className="font-mono text-[11px] text-muted-foreground w-10">
                                  {formatDate(r.startAt, "time")}
                                </span>
                                <span className="flex-1 truncate">{p ? `${p.lastName} ${p.firstName}` : "—"}</span>
                                <span className="text-xs text-muted-foreground">{m?.name.slice(0, 6)}</span>
                                {r.status === "cancelled" && <Ban className="h-3 w-3 text-rose-500" />}
                                {r.source === "line" && <MessageCircle className="h-3 w-3 text-emerald-500" />}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
