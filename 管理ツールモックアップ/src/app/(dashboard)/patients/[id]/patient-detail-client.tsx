"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Home,
  Briefcase,
  Heart,
  AlertCircle,
  MessageCircle,
  Users as UsersIcon,
  Calendar,
  ClipboardList,
  Coins,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { usePatientsStore } from "@/hooks/use-patients-store";
import {
  reservations,
  payments,
  medicalRecords,
  coupons as allCoupons,
  staffList,
  menus,
  patients as seedPatients,
} from "@/lib/data/seed";
import { calcAge, cn, formatCurrency, formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  reserved: "予約済",
  arrived: "来院",
  in_treatment: "施術中",
  completed: "完了",
  paid: "会計済",
  cancelled: "キャンセル",
  no_show: "未来院",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "muted"> = {
  reserved: "secondary",
  arrived: "default",
  in_treatment: "default",
  completed: "success",
  paid: "success",
  cancelled: "destructive",
  no_show: "warning",
};

const REFERRAL_LABEL: Record<string, string> = {
  referral: "紹介",
  flyer: "チラシ",
  web: "Web検索",
  sns: "SNS",
  walk_in: "飛び込み",
  other: "その他",
};

export function PatientDetailClient({ id }: { id: string }) {
  const { patients } = usePatientsStore();
  const [editOpen, setEditOpen] = React.useState(false);

  const patient = patients.find((p) => p.id === id);
  if (!patient) return notFound();

  const staff = staffList.find((s) => s.id === patient.preferredStaffId);
  const history = reservations
    .filter((r) => r.patientId === patient.id)
    .sort((a, b) => b.startAt.localeCompare(a.startAt));
  const records = medicalRecords
    .filter((r) => r.patientId === patient.id)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const pPayments = payments.filter((p) => p.patientId === patient.id);
  const pCoupons = allCoupons.filter((c) => c.patientId === patient.id);
  const family = patient.familyGroupId
    ? seedPatients.filter((x) => x.familyGroupId === patient.familyGroupId && x.id !== patient.id)
    : [];
  const totalSpent = pPayments.reduce((s, p) => s + p.total, 0);
  const avgTicket = pPayments.length === 0 ? 0 : Math.round(totalSpent / pPayments.length);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {patient.lastName} {patient.firstName}{" "}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {patient.lastNameKana} {patient.firstNameKana}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              初診 {formatDate(patient.firstVisitDate)}・総来院 {patient.totalVisits}回
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" />
            編集
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {patient.lastName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-semibold">
                    {patient.lastName} {patient.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {calcAge(patient.birthDate)}歳・
                    {patient.gender === "male" ? "男性" : patient.gender === "female" ? "女性" : "その他"}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {patient.tags.map((t) => (
                      <Badge
                        key={t}
                        variant={t === "VIP" ? "default" : "muted"}
                        className={cn("text-[10px] py-0", t === "VIP" && "bg-amber-500 text-white border-transparent")}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <InfoRow icon={Phone} label="電話" value={patient.phone} />
                {patient.email && <InfoRow icon={Mail} label="メール" value={patient.email} />}
                {patient.address && <InfoRow icon={Home} label="住所" value={patient.address} />}
                {patient.occupation && <InfoRow icon={Briefcase} label="職業" value={patient.occupation} />}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">集客経路</span>
                  <span>{REFERRAL_LABEL[patient.referralSource]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">担当</span>
                  {staff ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: staff.color }} />
                      {staff.displayName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">未設定</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">LINE連携</span>
                  {patient.lineUserId ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <MessageCircle className="h-3.5 w-3.5" />
                      連携済
                    </span>
                  ) : (
                    <span className="text-muted-foreground">未連携</span>
                  )}
                </div>
              </div>

              {(patient.medicalHistory || patient.allergies || patient.notes) && (
                <>
                  <Separator />
                  <div className="space-y-3 text-sm">
                    {patient.medicalHistory && (
                      <NoteBlock icon={Heart} label="既往歴" text={patient.medicalHistory} />
                    )}
                    {patient.allergies && (
                      <NoteBlock icon={AlertCircle} label="アレルギー" text={patient.allergies} tone="warning" />
                    )}
                    {patient.notes && <NoteBlock icon={ClipboardList} label="特記事項" text={patient.notes} />}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {family.length > 0 && (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">ご家族（同一グループ）</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {family.map((f) => (
                    <li key={f.id}>
                      <Link
                        href={`/patients/${f.id}`}
                        className="flex items-center gap-2 text-sm hover:text-primary hover:underline"
                      >
                        <span>
                          {f.lastName} {f.firstName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {calcAge(f.birthDate)}歳・{f.gender === "male" ? "男" : "女"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>

        <div>
          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="history">
                <Calendar className="h-4 w-4 mr-1" />
                来院履歴 ({history.length})
              </TabsTrigger>
              <TabsTrigger value="records">
                <ClipboardList className="h-4 w-4 mr-1" />
                カルテ ({records.length})
              </TabsTrigger>
              <TabsTrigger value="sales">
                <Coins className="h-4 w-4 mr-1" />
                売上
              </TabsTrigger>
              <TabsTrigger value="coupons">
                <Ticket className="h-4 w-4 mr-1" />
                回数券 ({pCoupons.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card>
                <CardContent className="p-0">
                  {history.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">来院履歴はまだありません</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日時</TableHead>
                          <TableHead>メニュー</TableHead>
                          <TableHead>担当</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead className="text-right">金額</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.slice(0, 20).map((r) => {
                          const menu = menus.find((m) => m.id === r.menuId);
                          const s = staffList.find((x) => x.id === r.staffId);
                          const p = payments.find((x) => x.reservationId === r.id);
                          return (
                            <TableRow key={r.id}>
                              <TableCell className="text-sm">
                                <div>{formatDate(r.startAt)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(r.startAt, "time")}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{menu?.name ?? "—"}</TableCell>
                              <TableCell className="text-sm">{s?.displayName ?? "—"}</TableCell>
                              <TableCell>
                                <Badge variant={STATUS_VARIANT[r.status]} className="text-[10px]">
                                  {STATUS_LABEL[r.status]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {p ? formatCurrency(p.total) : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records">
              <Card>
                <CardContent className="p-4 space-y-3">
                  {records.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">カルテはまだ記録されていません</p>
                  ) : (
                    records.slice(0, 5).map((r) => {
                      const s = staffList.find((x) => x.id === r.staffId);
                      return (
                        <div key={r.id} className="rounded-md border border-border p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {formatDate(r.recordedAt, "datetime")}・{s?.displayName ?? "—"}
                            </span>
                            <div className="flex items-center gap-2">
                              {r.isFirstVisit && <Badge variant="secondary" className="text-[10px]">初診</Badge>}
                              <span className="text-muted-foreground">
                                痛み <span className="font-bold text-foreground">{r.painScale}</span>/10
                              </span>
                            </div>
                          </div>
                          <dl className="grid grid-cols-2 gap-3 text-sm">
                            <SoapBlock tag="S" label="主訴" value={r.soapS} />
                            <SoapBlock tag="O" label="所見" value={r.soapO} />
                            <SoapBlock tag="A" label="評価" value={r.soapA} />
                            <SoapBlock tag="P" label="施術計画" value={r.soapP} />
                          </dl>
                        </div>
                      );
                    })
                  )}
                  {records.length > 5 && (
                    <p className="text-center text-xs text-muted-foreground pt-2">
                      残り {records.length - 5} 件のカルテは次フェーズで閲覧可能になります
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">累計支払額</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalSpent)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{pPayments.length}件の会計</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">平均客単価</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(avgTicket)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">アクティブ回数券</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {pCoupons.filter((c) => c.status === "active").length}
                      <span className="text-sm text-muted-foreground ml-1">枚</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="coupons">
              <Card>
                <CardContent className="p-0">
                  {pCoupons.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">発行済みの回数券はありません</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>券種</TableHead>
                          <TableHead>残数</TableHead>
                          <TableHead>有効期限</TableHead>
                          <TableHead>ステータス</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pCoupons.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>
                              {c.totalCount - c.usedCount} / {c.totalCount}
                            </TableCell>
                            <TableCell className="text-sm">{formatDate(c.expiresAt)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={c.status === "active" ? "success" : c.status === "expired" ? "destructive" : "muted"}
                                className="text-[10px]"
                              >
                                {c.status === "active" ? "有効" : c.status === "expired" ? "期限切れ" : "使い切り"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PatientFormDialog open={editOpen} onOpenChange={setEditOpen} patient={patient} />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate">{value}</p>
      </div>
    </div>
  );
}

function NoteBlock({
  icon: Icon,
  label,
  text,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  text: string;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-md p-2 text-xs",
        tone === "warning" ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-muted/50"
      )}
    >
      <div className="flex items-center gap-1.5 font-medium">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function SoapBlock({ tag, label, value }: { tag: string; label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">
        <span className="inline-flex items-center justify-center h-4 w-4 rounded bg-primary/10 text-primary text-[10px] font-bold mr-1">
          {tag}
        </span>
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
