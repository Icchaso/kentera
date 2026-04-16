import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  deltaPct?: number;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "primary" | "accent" | "success" | "warning" | "danger";
  size?: "md" | "lg";
}

const toneClass: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-card",
  primary: "bg-primary text-primary-foreground border-primary",
  accent: "bg-gradient-to-br from-sky-500 to-blue-600 text-white border-transparent",
  success: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-transparent",
  warning: "bg-gradient-to-br from-amber-500 to-orange-500 text-white border-transparent",
  danger: "bg-gradient-to-br from-rose-500 to-red-500 text-white border-transparent",
};

export function KpiCard({ label, value, sub, deltaPct, icon: Icon, tone = "default", size = "md" }: KpiCardProps) {
  const isInverse = tone !== "default";
  return (
    <Card className={cn("overflow-hidden", toneClass[tone])}>
      <CardContent className={cn("p-4", size === "lg" && "p-5")}>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className={cn("text-xs font-medium", isInverse ? "text-white/80" : "text-muted-foreground")}>
              {label}
            </p>
            <p className={cn(size === "lg" ? "text-3xl" : "text-2xl", "font-bold tracking-tight leading-tight")}>
              {value}
            </p>
            {sub && (
              <p className={cn("text-xs", isInverse ? "text-white/75" : "text-muted-foreground")}>{sub}</p>
            )}
          </div>
          {Icon && (
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                isInverse ? "bg-white/15" : "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>
        {deltaPct !== undefined && (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-1 text-xs font-medium",
              isInverse ? "text-white/90" : deltaPct >= 0 ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {deltaPct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(deltaPct)}% 前月比
          </div>
        )}
      </CardContent>
    </Card>
  );
}
