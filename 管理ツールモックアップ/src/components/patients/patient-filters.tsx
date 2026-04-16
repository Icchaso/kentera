"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { staffList } from "@/lib/data/seed";
import type { PatientTag } from "@/types";

const ALL_TAGS: PatientTag[] = ["VIP", "紹介", "保険", "自費", "要観察"];

export interface PatientFiltersState {
  keyword: string;
  tags: PatientTag[];
  preferredStaffId: string;
  lastVisitThreshold: "all" | "30" | "60" | "90";
  dropoutOnly: boolean;
}

export const DEFAULT_FILTERS: PatientFiltersState = {
  keyword: "",
  tags: [],
  preferredStaffId: "all",
  lastVisitThreshold: "all",
  dropoutOnly: false,
};

interface PatientFiltersProps {
  value: PatientFiltersState;
  onChange: (v: PatientFiltersState) => void;
  resultCount: number;
  totalCount: number;
}

export function PatientFilters({ value, onChange, resultCount, totalCount }: PatientFiltersProps) {
  const treatingStaff = staffList.filter((s) => s.role !== "reception");
  const activeFilterCount =
    value.tags.length +
    (value.preferredStaffId !== "all" ? 1 : 0) +
    (value.lastVisitThreshold !== "all" ? 1 : 0) +
    (value.dropoutOnly ? 1 : 0);

  const toggleTag = (tag: PatientTag) => {
    onChange({
      ...value,
      tags: value.tags.includes(tag) ? value.tags.filter((t) => t !== tag) : [...value.tags, tag],
    });
  };

  const reset = () => onChange(DEFAULT_FILTERS);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value.keyword}
            onChange={(e) => onChange({ ...value, keyword: e.target.value })}
            placeholder="名前・カナ・電話番号で検索"
            className="pl-9"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              フィルタ
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">タグ</Label>
                <div className="flex flex-wrap gap-2 pt-2">
                  {ALL_TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        value.tags.includes(t)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">担当スタッフ</Label>
                <Select
                  value={value.preferredStaffId}
                  onValueChange={(v) => onChange({ ...value, preferredStaffId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全員</SelectItem>
                    {treatingStaff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">最終来院からの経過</Label>
                <Select
                  value={value.lastVisitThreshold}
                  onValueChange={(v) =>
                    onChange({ ...value, lastVisitThreshold: v as PatientFiltersState["lastVisitThreshold"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="30">30日以上</SelectItem>
                    <SelectItem value="60">60日以上</SelectItem>
                    <SelectItem value="90">90日以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={value.dropoutOnly}
                  onCheckedChange={(c) => onChange({ ...value, dropoutOnly: Boolean(c) })}
                />
                離脱アラート対象のみ
              </label>
              <div className="flex justify-end pt-2 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={activeFilterCount === 0}>
                  リセット
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {(value.tags.length > 0 ||
        value.preferredStaffId !== "all" ||
        value.lastVisitThreshold !== "all" ||
        value.dropoutOnly) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">適用中:</span>
          {value.tags.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1">
              {t}
              <button onClick={() => toggleTag(t)} aria-label="remove">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {value.preferredStaffId !== "all" && (
            <Badge variant="secondary" className="gap-1">
              担当: {treatingStaff.find((s) => s.id === value.preferredStaffId)?.displayName}
              <button onClick={() => onChange({ ...value, preferredStaffId: "all" })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {value.lastVisitThreshold !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {value.lastVisitThreshold}日以上未来院
              <button onClick={() => onChange({ ...value, lastVisitThreshold: "all" })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {value.dropoutOnly && (
            <Badge variant="secondary" className="gap-1">
              離脱のみ
              <button onClick={() => onChange({ ...value, dropoutOnly: false })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        全 {totalCount} 名中 {resultCount} 名を表示
      </p>
    </div>
  );
}
