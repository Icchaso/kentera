"use client";

import Link from "next/link";
import { AlertCircle, AlertTriangle, Info, ChevronRight } from "lucide-react";
import type { AlertItem } from "@/types";
import { cn } from "@/lib/utils";

interface AlertListProps {
  items: AlertItem[];
}

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
} as const;

const toneMap = {
  info: "text-sky-600 bg-sky-100",
  warning: "text-amber-600 bg-amber-100",
  danger: "text-rose-600 bg-rose-100",
} as const;

export function AlertList({ items }: AlertListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">現在アラートはありません</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((a) => {
        const Icon = iconMap[a.severity];
        const href = a.patientId ? `/patients/${a.patientId}` : "#";
        return (
          <li key={a.id}>
            <Link
              href={href}
              className="flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors group"
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full shrink-0", toneMap[a.severity])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
