"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Coins,
  UserCog,
  BookOpen,
  Settings,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CureBoardLogo } from "@/components/brand/logo";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "main" | "admin";
  badge?: string;
};

export const navItems: NavItem[] = [
  { label: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard, group: "main" },
  { label: "予約", href: "/reservations", icon: Calendar, group: "main" },
  { label: "患者", href: "/patients", icon: Users, group: "main" },
  { label: "カルテ", href: "/records", icon: ClipboardList, group: "main" },
  { label: "売上", href: "/sales", icon: Coins, group: "main" },
  { label: "スタッフ", href: "/staff", icon: UserCog, group: "main" },
  { label: "メニュー", href: "/menus", icon: BookOpen, group: "main" },
  { label: "院設定", href: "/settings", icon: Settings, group: "main" },
  { label: "テナント管理", href: "/admin/tenants", icon: Building2, group: "admin" },
  { label: "業界分析", href: "/admin/analytics", icon: ShieldCheck, group: "admin" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-slate-800 bg-sidebar text-sidebar-foreground">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center">
          <CureBoardLogo tone="light" size={28} />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        <NavSection
          title="治療院業務"
          items={navItems.filter((n) => n.group === "main")}
          pathname={pathname}
        />
        <NavSection
          title="運営（SuperAdmin）"
          items={navItems.filter((n) => n.group === "admin")}
          pathname={pathname}
        />
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-sidebar-muted">
        <div className="flex items-center justify-between">
          <span>Ver. 0.1 (Mock)</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Pro Plan
          </span>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div>
      <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-sidebar-muted">{title}</div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
