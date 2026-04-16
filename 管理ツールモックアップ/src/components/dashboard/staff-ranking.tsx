"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { Trophy } from "lucide-react";
import type { Staff } from "@/types";

interface StaffRankingProps {
  items: { staff: Staff; revenue: number; treatmentCount: number; referralRate: number }[];
}

export function StaffRanking({ items }: StaffRankingProps) {
  return (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li key={item.staff.id} className="flex items-center gap-3">
          <span className="w-6 text-center text-xs font-semibold text-muted-foreground">{idx + 1}</span>
          <Avatar className="h-9 w-9">
            <AvatarFallback style={{ backgroundColor: item.staff.color + "22", color: item.staff.color }}>
              {item.staff.displayName.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{item.staff.displayName}</p>
              {idx === 0 && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
            </div>
            <p className="text-xs text-muted-foreground">
              施術 {item.treatmentCount}件・指名率 {item.referralRate}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{formatCurrency(item.revenue)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
