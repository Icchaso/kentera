"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, ClipboardList } from "lucide-react";
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

export default function RecordsPage() {
  const [keyword, setKeyword] = React.useState("");

  const filtered = React.useMemo(() => {
    const sorted = [...medicalRecords].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
    if (!keyword) return sorted;
    const k = keyword.toLowerCase();
    return sorted.filter((r) => {
      const p = patients.find((x) => x.id === r.patientId);
      const hay = `${p?.lastName}${p?.firstName}${p?.lastNameKana}${p?.firstNameKana}${r.soapS}${r.soapA}`.toLowerCase();
      return hay.includes(k);
    });
  }, [keyword]);

  const recent = filtered.slice(0, 50);

  const painDist = React.useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]; // 1-2, 3-4, 5-6, 7-8, 9-10
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
        description={`電子カルテ記録 ${medicalRecords.length}件・SOAP形式で管理`}
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
              {(
                medicalRecords.reduce((s, r) => s + r.painScale, 0) / Math.max(medicalRecords.length, 1)
              ).toFixed(1)}
              <span className="text-xs text-muted-foreground">/10</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
                  placeholder="患者名・主訴・所見で検索"
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>記録日</TableHead>
                  <TableHead>患者</TableHead>
                  <TableHead>担当</TableHead>
                  <TableHead>主訴（S）</TableHead>
                  <TableHead>評価（A）</TableHead>
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
                      <TableCell className="text-sm max-w-[180px] truncate">{r.soapS}</TableCell>
                      <TableCell className="text-sm max-w-[160px] truncate">{r.soapA}</TableCell>
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
            <CardHeader className="pb-2">
              <CardTitle>痛みスケール分布</CardTitle>
              <CardDescription>全カルテの主観的疼痛分布</CardDescription>
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
                          className={cn(
                            "h-full rounded-full",
                            i < 2 ? "bg-emerald-500" : i < 3 ? "bg-amber-500" : "bg-rose-500"
                          )}
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
              <CardTitle>AI要約（近日公開）</CardTitle>
              <CardDescription>過去カルテから自動要約</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border-2 border-dashed border-border p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  過去のカルテから、状態変化とキー所見を
                  <br />
                  AI が自動で要約します
                </p>
                <Button variant="outline" size="sm" disabled>
                  Phase 3 で提供予定
                </Button>
              </div>
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
