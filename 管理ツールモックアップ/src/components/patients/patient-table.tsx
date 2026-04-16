"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, MessageCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calcAge, cn, formatDate } from "@/lib/utils";
import { staffList } from "@/lib/data/seed";
import type { Patient } from "@/types";

export type SortKey = "name" | "lastVisit" | "totalVisits";
export type SortDir = "asc" | "desc";

interface PatientTableProps {
  patients: Patient[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey) => void;
}

export function PatientTable({ patients, sortKey, sortDir, onSortChange }: PatientTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="w-[18%]">
              <SortButton label="氏名" active={sortKey === "name"} dir={sortDir} onClick={() => onSortChange("name")} />
            </TableHead>
            <TableHead className="w-[10%]">カナ</TableHead>
            <TableHead className="w-[8%]">年齢/性別</TableHead>
            <TableHead className="w-[10%]">担当</TableHead>
            <TableHead className="w-[14%]">
              <SortButton
                label="最終来院"
                active={sortKey === "lastVisit"}
                dir={sortDir}
                onClick={() => onSortChange("lastVisit")}
              />
            </TableHead>
            <TableHead className="w-[8%] text-right">
              <SortButton
                label="来院数"
                active={sortKey === "totalVisits"}
                dir={sortDir}
                onClick={() => onSortChange("totalVisits")}
              />
            </TableHead>
            <TableHead className="w-[18%]">タグ</TableHead>
            <TableHead className="w-[8%]">LINE</TableHead>
            <TableHead className="w-[6%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-16">
                該当する患者が見つかりませんでした
              </TableCell>
            </TableRow>
          ) : (
            patients.map((p) => {
              const age = calcAge(p.birthDate);
              const daysSince = Math.floor(
                (new Date("2026-04-15").getTime() - new Date(p.lastVisitDate).getTime()) / 86400_000
              );
              const staff = staffList.find((s) => s.id === p.preferredStaffId);
              const isDropout = daysSince >= 60;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/patients/${p.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {p.lastName} {p.firstName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.lastNameKana} {p.firstNameKana}
                  </TableCell>
                  <TableCell className="text-sm">
                    {age}
                    <span className="text-muted-foreground text-xs ml-1">
                      {p.gender === "male" ? "男" : p.gender === "female" ? "女" : "他"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {staff ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: staff.color }} />
                        {staff.displayName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">未設定</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <span>{formatDate(p.lastVisitDate)}</span>
                      {isDropout && (
                        <Badge
                          variant={daysSince >= 90 ? "destructive" : "warning"}
                          className="text-[10px] gap-0.5"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {daysSince}日
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{p.totalVisits}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((t) => (
                        <Badge
                          key={t}
                          variant={t === "VIP" ? "default" : "muted"}
                          className={cn("text-[10px] py-0.5", t === "VIP" && "bg-amber-500 text-white border-transparent")}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.lineUserId ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <MessageCircle className="h-3 w-3" />
                        連携済
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">未連携</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/patients/${p.id}`}>詳細</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}
