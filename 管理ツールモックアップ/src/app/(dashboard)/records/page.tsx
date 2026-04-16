"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, ClipboardList, Sparkles, Stethoscope, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { medicalRecords, patients, staffList } from "@/lib/data/seed";
import { cn, formatDate } from "@/lib/utils";

const CAUSE_LABEL: Record<string, string> = {
  daily_life: "日常生活",
  sports: "スポーツ",
  work: "仕事",
  accident: "事故",
  aging: "加齢",
  postpartum: "産後",
  other: "その他",
};

const OUTCOME_LABEL: Record<string, string> = {
  improving: "改善中",
  recovered: "回復",
  maintenance: "メンテナンス",
  discontinued: "中断",
  referred: "他院紹介",
};

const OUTCOME_VARIANT: Record<string, "default" | "success" | "warning" | "muted" | "destructive"> = {
  improving: "default",
  recovered: "success",
  maintenance: "muted",
  discontinued: "destructive",
  referred: "warning",
};

export default function RecordsPage() {
  const [keyword, setKeyword] = React.useState("");
  const [complaintFilter, setComplaintFilter] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const sorted = [...medicalRecords].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
    return sorted.filter((r) => {
      if (complaintFilter && !r.chiefComplaints.includes(complaintFilter as never)) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        const p = patients.find((x) => x.id === r.patientId);
        const hay = `${p?.lastName}${p?.firstName}${p?.lastNameKana}${p?.firstNameKana}${r.soapS}${r.soapA}${r.chiefComplaints.join("")}${r.modalities.join("")}`.toLowerCase();
        if (!hay.includes(k)) return false;
      }
      return true;
    });
  }, [keyword, complaintFilter]);

  const recent = filtered.slice(0, 50);

  const complaintCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    medicalRecords.forEach((r) => r.chiefComplaints.forEach((c) => map.set(c, (map.get(c) ?? 0) + 1)));
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, []);

  const modalityCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    medicalRecords.forEach((r) => r.modalities.forEach((m) => map.set(m, (map.get(m) ?? 0) + 1)));
    return Array.from(map.entries()).sort(([, a], [, b]) => b - a);
  }, []);

  const outcomeCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    medicalRecords.forEach((r) => {
      if (r.outcome) map.set(r.outcome, (map.get(r.outcome) ?? 0) + 1);
    });
    return Array.from(map.entries());
  }, []);

  const painDist = React.useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    medicalRecords.forEach((r) => {
      const b = Math.min(4, Math.floor((r.painScale - 1) / 2));
      buckets[b]++;
    });
    return buckets;
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="カルテ管理"
        description={`電子カルテ ${medicalRecords.length}件・SOAP + 主訴・施術手技・転帰まで構造化記録`}
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            新規カルテ
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">総カルテ数</p>
            <p className="text-2xl font-bold">{medicalRecords.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">今月の記録</p>
            <p className="text-2xl font-bold">
              {medicalRecords.filter((r) => r.recordedAt.startsWith("2026-04")).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">初診カルテ</p>
            <p className="text-2xl font-bold text-primary">
              {medicalRecords.filter((r) => r.isFirstVisit).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">平均痛みスケール</p>
            <p className="text-2xl font-bold">
              {(medicalRecords.reduce((s, r) => s + r.painScale, 0) / Math.max(medicalRecords.length, 1)).toFixed(1)}
              <span className="text-xs text-muted-foreground">/10</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>カルテ一覧</CardTitle>
                <CardDescription>新しい順・{filtered.length}件</CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="患者名・主訴・施術手技で検索"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">主訴タグ:</span>
              {complaintCounts.map(([name]) => (
                <button
                  key={name}
                  onClick={() => setComplaintFilter(complaintFilter === name ? null : name)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs border transition-colors",
                    complaintFilter === name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  )}
                >
                  {name}
                </button>
              ))}
              {complaintFilter && (
                <button
                  onClick={() => setComplaintFilter(null)}
                  className="px-2 py-0.5 rounded-full text-xs text-muted-foreground hover:text-foreground"
                >
                  クリア
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>記録日</TableHead>
                  <TableHead>患者</TableHead>
                  <TableHead>担当</TableHead>
                  <TableHead>主訴・施術</TableHead>
                  <TableHead>転帰</TableHead>
                  <TableHead className="text-right">痛み</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r) => {
                  const p = patients.find((x) => x.id === r.patientId);
                  const s = staffList.find((x) => x.id === r.staffId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">
                        <div>{formatDate(r.recordedAt)}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(r.recordedAt, "time")}</div>
                      </TableCell>
                      <TableCell>
                        {p ? (
                          <Link
                            href={`/patients/${p.id}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {p.lastName} {p.firstName}
                          </Link>
                        ) : (
                          "—"
                        )}
                        {r.isFirstVisit && (
                          <Badge variant="secondary" className="text-[10px] ml-1">
                            初診
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{s?.displayName ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {r.chiefComplaints.map((c) => (
                            <Badge key={c} variant="muted" className="text-[10px]">
                              {c}
                            </Badge>
                          ))}
                          {r.modalities.slice(0, 2).map((m) => (
                            <Badge key={m} variant="outline" className="text-[10px]">
                              {m}
                            </Badge>
                          ))}
                          {r.modalities.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{r.modalities.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.outcome ? (
                          <Badge variant={OUTCOME_VARIANT[r.outcome]} className="text-[10px]">
                            {OUTCOME_LABEL[r.outcome]}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <PainBadge score={r.painScale} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>
                          <ClipboardList className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
              <Stethoscope className="h-4 w-4 text-primary" />
              <CardTitle>主訴ランキング</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {complaintCounts.map(([name, count]) => {
                  const max = complaintCounts[0][1];
                  const pct = Math.round((count / max) * 100);
                  return (
                    <li key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground">{count}件</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle>施術手技の構成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {modalityCounts.map(([name, count]) => (
                  <Badge key={name} variant="outline" className="text-[10px]">
                    {name} <span className="text-muted-foreground ml-1">×{count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>痛みスケール分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {["1–2", "3–4", "5–6", "7–8", "9–10"].map((label, i) => {
                  const max = Math.max(...painDist);
                  const pct = max === 0 ? 0 : Math.round((painDist[i] / max) * 100);
                  return (
                    <li key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{label}</span>
                        <span className="text-muted-foreground">{painDist[i]}件</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", i < 2 ? "bg-emerald-500" : i < 3 ? "bg-amber-500" : "bg-rose-500")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>転帰の分布</CardTitle>
              <CardDescription>治療効果エビデンス</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {outcomeCounts.map(([key, count]) => (
                  <li key={key} className="flex items-center justify-between text-xs">
                    <Badge variant={OUTCOME_VARIANT[key]} className="text-[10px]">
                      {OUTCOME_LABEL[key]}
                    </Badge>
                    <span className="font-medium">{count}件</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/30">
            <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">AI要約（Phase 3）</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                過去のカルテから状態変化・施術効果を AI が自動要約します。近日公開予定。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PainBadge({ score }: { score: number }) {
  const color =
    score <= 3
      ? "bg-emerald-100 text-emerald-700"
      : score <= 6
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";
  return <span className={cn("inline-block rounded px-2 py-0.5 text-xs font-medium", color)}>{score}/10</span>;
}
