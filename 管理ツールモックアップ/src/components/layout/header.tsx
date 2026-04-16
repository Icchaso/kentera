"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Search, Settings, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CureBoardLogo } from "@/components/brand/logo";
import { navItems } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import { tenant, staffList } from "@/lib/data/seed";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const owner = staffList[0];
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // パス変更時にドロワーを閉じる
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="h-16 shrink-0 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {tenant.name}
            </Badge>
            <span className="hidden lg:inline text-xs text-muted-foreground truncate">
              {tenant.address}
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="患者・予約・カルテを横断検索（近日公開）"
              disabled
              className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[11px]">
                    {owner.displayName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium leading-tight">{owner.displayName}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Owner
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{owner.displayName}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> 院設定
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/login")} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* モバイルドロワー */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm overlay-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* ドロワー */}
          <nav className="absolute top-0 left-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground flex flex-col animate-in">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
              <CureBoardLogo tone="light" size={26} />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-800 transition-colors"
                aria-label="メニューを閉じる"
              >
                <X className="h-5 w-5 text-sidebar-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
              <MobileNavSection
                title="治療院業務"
                items={navItems.filter((n) => n.group === "main")}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
              <MobileNavSection
                title="運営（SuperAdmin）"
                items={navItems.filter((n) => n.group === "admin")}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            <div className="p-4 border-t border-slate-800 text-xs text-sidebar-muted">
              <span>Ver. 0.1 (Mock)</span>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function MobileNavSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: typeof navItems;
  pathname: string;
  onNavigate: () => void;
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
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
