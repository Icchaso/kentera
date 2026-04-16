"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface TimeHeatmapProps {
  cells: { day: number; hour: number; count: number }[];
}

const DAYS = ["月", "火", "水", "木", "金", "土"];

function intensity(count: number, max: number): string {
  if (count === 0 || max === 0) return "bg-muted/40";
  const ratio = count / max;
  if (ratio > 0.85) return "bg-primary";
  if (ratio > 0.65) return "bg-primary/80";
  if (ratio > 0.45) return "bg-primary/60";
  if (ratio > 0.25) return "bg-primary/40";
  return "bg-primary/20";
}

export function TimeHeatmap({ cells }: TimeHeatmapProps) {
  const max = cells.reduce((m, c) => Math.max(m, c.count), 0);
  const hours = Array.from({ length: 11 }, (_, i) => 9 + i);
  return (
    <div className="space-y-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `32px repeat(${hours.length}, 1fr)` }}>
        <div />
        {hours.map((h) => (
          <div key={`h-${h}`} className="text-[10px] text-muted-foreground text-center">
            {h}
          </div>
        ))}
        {DAYS.map((dayLabel, dIdx) => {
          const dayNum = dIdx + 1;
          return (
            <Fragment key={`row-${dIdx}`}>
              <div className="text-[11px] text-muted-foreground font-medium flex items-center">{dayLabel}</div>
              {hours.map((hour) => {
                const cell = cells.find((c) => c.day === dayNum && c.hour === hour);
                const count = cell?.count ?? 0;
                return (
                  <div
                    key={`${dIdx}-${hour}`}
                    className={cn(
                      "aspect-square rounded-sm transition-colors hover:ring-2 hover:ring-primary/50",
                      intensity(count, max)
                    )}
                    title={`${dayLabel}曜 ${hour}時 : ${count}件`}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>少</span>
        <div className="h-3 w-3 rounded-sm bg-primary/20" />
        <div className="h-3 w-3 rounded-sm bg-primary/40" />
        <div className="h-3 w-3 rounded-sm bg-primary/60" />
        <div className="h-3 w-3 rounded-sm bg-primary/80" />
        <div className="h-3 w-3 rounded-sm bg-primary" />
        <span>多</span>
      </div>
    </div>
  );
}
