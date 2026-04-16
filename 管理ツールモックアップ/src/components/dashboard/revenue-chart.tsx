"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: { date: string; revenue: number; visits: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => v.slice(5)}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#fillRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type TooltipArgs = {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { visits?: number } }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipArgs) {
  if (!active || !payload?.length) return null;
  const revenue = (payload[0]?.value ?? 0) as number;
  const visits = payload[0]?.payload?.visits ?? 0;
  return (
    <div className="rounded-md border border-border bg-card shadow-md px-3 py-2 text-xs">
      <div className="font-medium text-foreground mb-1">{label}</div>
      <div className="text-primary">売上: {formatCurrency(revenue)}</div>
      <div className="text-muted-foreground">来院: {visits}件</div>
    </div>
  );
}
