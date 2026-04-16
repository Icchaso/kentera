"use client";

import * as React from "react";
import { Plus, Award, Clock, Mail, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";
import { staffList, reservations, payments } from "@/lib/data/seed";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  group_owner: "GroupOwner",
  owner: "Owner",
  staff: "Staff",
  superadmin: "SuperAdmin",
};

const ROLE_VARIANT: Record<string, "default" | "secondary" | "muted" | "warning"> = {
  group_owner: "default",
  owner: "default",
  staff: "muted",
  superadmin: "default",
};

const TODAY = new Date("2026-04-16");

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function StaffPage() {
  const weekStart = startOfWeek(TODAY);
  const weekDays = Array.from({ length: 6 }, (_, i) => new Date(weekStart.getTime() + i * 86400_000));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="スタッフ管理"
        description={`登録 ${staffList.length}名・アクティブ ${staffList.filter((s) => s.isActive).length}名`}
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            スタッフ追加
          </Button>
        }
      />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">メンバー</TabsTrigger>
          <TabsTrigger value="shifts">シフト表</TabsTrigger>
          <TabsTrigger value="attendance">勤怠</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {staffList.map((s) => {
              const sRes = reservations.filter((r) => r.staffId === s.id && r.status === "paid");
              const sPay = payments.filter((p) => sRes.some((r) => r.id === p.reservationId));
              const revenue = sPay.reduce((sum, p) => sum + p.total, 0);
              const isReception = s.roleLabel === "受付";
              const referralRate = isReception ? null : 45 + (s.id.charCodeAt(6) % 40);
              return (
                <Card key={s.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback
                          className="text-lg font-semibold"
                          style={{ backgroundColor: s.color + "22", color: s.color }}
                        >
                          {s.displayName.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-base font-semibold">{s.displayName}</p>
                          <Badge variant={ROLE_VARIANT[s.role]} className="text-[10px]">
                            {ROLE_LABEL[s.role]}
                          </Badge>
                          {s.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              稼働中
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">休止中</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {s.email}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <UserCog className="h-4 w-4" />
                      </Button>
                    </div>

                    {s.specialties.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">得意施術</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.specialties.map((sp) => (
                            <Badge key={sp} variant="outline" className="text-[10px]">
                              {sp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {s.qualifications.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Award className="h-3 w-3" /> 資格
                        </p>
                        <ul className="space-y-1">
                          {s.qualifications.map((q) => (
                            <li key={q.name} className="text-xs flex items-center justify-between">
                              <span>{q.name}</span>
                              <span className="text-muted-foreground">
                                {q.licenseNumber} ・ 〜{q.expiresAt}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-3">
                      <Stat
                        label="肩書"
                        value={s.roleLabel ?? ROLE_LABEL[s.role]}
                      />
                      <Stat
                        label="経験年数"
                        value={s.yearsOfExperience ? `${s.yearsOfExperience}年` : "—"}
                      />
                      <Stat
                        label="入職日"
                        value={s.joinedAt ? s.joinedAt.replace(/-/g, "/") : "—"}
                      />
                    </div>
                    {!isReception && (
                      <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3">
                        <Stat label="30日売上" value={formatCurrency(revenue)} />
                        <Stat label="施術件数" value={`${sRes.length}件`} />
                        <Stat label="指名率" value={referralRate !== null ? `${referralRate}%` : "—"} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="shifts">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>今週のシフト</CardTitle>
              <CardDescription>
                {formatDate(weekStart, "monthDay")} 〜 {formatDate(weekDays[5], "monthDay")} ・日曜休診
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[700px] grid gap-2" style={{ gridTemplateColumns: `140px repeat(6, 1fr)` }}>
                <div />
                {weekDays.map((d) => (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      "text-xs font-medium text-center py-1.5 rounded",
                      d.toDateString() === TODAY.toDateString()
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {["月", "火", "水", "木", "金", "土"][d.getDay() === 0 ? 6 : d.getDay() - 1]} {d.getMonth() + 1}/{d.getDate()}
                  </div>
                ))}
                {staffList.map((s) => (
                  <React.Fragment key={s.id}>
                    <div className="flex items-center gap-2 px-2 py-3 text-sm">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="font-medium">{s.displayName}</span>
                    </div>
                    {weekDays.map((d, i) => {
                      const patterns = [
                        ["09-13", "14-20", "休", "09-20", "09-13", "14-20"],
                        ["休", "09-18", "09-18", "10-20", "09-18", "09-18"],
                        ["09-20", "13-20", "09-18", "休", "09-18", "09-18"],
                        ["09-18", "09-18", "09-18", "09-18", "09-18", "09-15"],
                      ];
                      const idx = staffList.indexOf(s) % patterns.length;
                      const slot = patterns[idx][i];
                      const off = slot === "休";
                      return (
                        <div
                          key={d.toISOString()}
                          className={cn(
                            "rounded border px-2 py-2 text-center text-xs",
                            off
                              ? "bg-muted/30 border-dashed text-muted-foreground"
                              : "bg-card border-border"
                          )}
                          style={!off ? { borderLeft: `3px solid ${s.color}` } : undefined}
                        >
                          {off ? "休" : slot}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>本日の勤怠</CardTitle>
              <CardDescription>打刻記録</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {staffList.map((s, i) => {
                  const clockIn = ["08:52", "09:03", "09:15", "08:45"][i] ?? "—";
                  const clockOut = ["—", "—", "—", "—"][i];
                  const breakMin = [60, 45, 60, 30][i];
                  return (
                    <li key={s.id} className="flex items-center gap-3 py-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback style={{ backgroundColor: s.color + "22", color: s.color }}>
                          {s.displayName.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{s.displayName}</p>
                        <p className="text-xs text-muted-foreground">{ROLE_LABEL[s.role]}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">出勤</p>
                          <p className="font-mono">{clockIn}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">退勤</p>
                          <p className="font-mono">{clockOut}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">休憩</p>
                          <p className="font-mono">{breakMin}分</p>
                        </div>
                      </div>
                      <Badge variant={clockOut === "—" ? "default" : "muted"} className="text-[10px] shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {clockOut === "—" ? "勤務中" : "退勤済"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
