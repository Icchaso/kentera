"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  Menu,
  X,
  Building2,
  Users as UsersIcon,
  UserCog,
  Eye,
  Crown,
  User as UserIcon,
} from "lucide-react";
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { CureBoardLogo } from "@/components/brand/logo";
import { navItems, type NavItem } from "@/components/layout/sidebar";
import { useWorkspace } from "@/hooks/use-workspace-store";
import { filterNavByRole } from "@/lib/role-access";
import { cn } from "@/lib/utils";
import { tenants, tenantGroup, staffList } from "@/lib/data/seed";
import type { StaffRole } from "@/types";

const ROLE_LABEL: Record<StaffRole, string> = {
  superadmin: "SuperAdmin",
  group_owner: "GroupOwner",
  owner: "Owner",
  staff: "Staff",
};

const ROLE_ICON: Record<StaffRole, React.ComponentType<{ className?: string }>> = {
  superadmin: Crown,
  group_owner: Crown,
  owner: UserCog,
  staff: UserIcon,
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentRole, setCurrentRole, currentTenantId, setCurrentTenantId, actingStaffId } = useWorkspace();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const actingStaff = staffList.find((s) => s.id === actingStaffId) ?? staffList[0];

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const visibleNav = filterNavByRole(navItems, currentRole);

  const currentTenant =
    currentTenantId === "all" ? null : tenants.find((t) => t.id === currentTenantId);
  const tenantDisplayName =
    currentTenantId === "all"
      ? `${tenantGroup.name}（全${tenants.length}店舗）`
      : currentTenant
      ? currentTenant.branchName
        ? `${tenantGroup.name}・${currentTenant.branchName}`
        : currentTenant.name
      : "—";
  const tenantAddress = currentTenant?.address ?? tenantGroup.name;

  const showBranchSwitcher = currentRole === "group_owner" || currentRole === "superadmin";

  return (
    <>
      <header className="h-16 shrink-0 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {showBranchSwitcher ? (
            <BranchSwitcher
              currentTenantId={currentTenantId}
              onChange={setCurrentTenantId}
              displayName={tenantDisplayName}
            />
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {tenantDisplayName}
              </Badge>
              <span className="hidden lg:inline text-xs text-muted-foreground truncate">
                {tenantAddress}
              </span>
            </div>
          )}
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

        <div className="flex items-center gap-1 sm:gap-2">
          <RoleSwitcher currentRole={currentRole} onChange={setCurrentRole} />

          <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className="text-[11px]"
                    style={{ backgroundColor: actingStaff.color + "22", color: actingStaff.color }}
                  >
                    {actingStaff.displayName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium leading-tight truncate max-w-[120px]">
                    {actingStaff.displayName}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {actingStaff.roleLabel ?? ROLE_LABEL[actingStaff.role]}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <div>{actingStaff.displayName}</div>
                <div className="text-[10px] text-muted-foreground font-normal">{actingStaff.email}</div>
              </DropdownMenuLabel>
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
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm overlay-in"
            onClick={() => setMobileOpen(false)}
          />
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
                items={visibleNav.filter((n) => n.group === "main")}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
              {visibleNav.some((n) => n.group === "group") && (
                <MobileNavSection
                  title="グループ管理"
                  items={visibleNav.filter((n) => n.group === "group")}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              )}
              {visibleNav.some((n) => n.group === "admin") && (
                <MobileNavSection
                  title="運営（SuperAdmin）"
                  items={visibleNav.filter((n) => n.group === "admin")}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              )}
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

function BranchSwitcher({
  currentTenantId,
  onChange,
  displayName,
}: {
  currentTenantId: string;
  onChange: (id: string) => void;
  displayName: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md border border-border bg-card hover:bg-muted px-2 sm:px-3 py-1.5 transition-colors min-w-0">
          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs">{tenantGroup.name}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={currentTenantId} onValueChange={onChange}>
          <DropdownMenuRadioItem value="all" className="text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">全店舗</Badge>
              <span>グループ全体</span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {tenants.map((t) => (
            <DropdownMenuRadioItem key={t.id} value={t.id} className="text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {t.branchName}{" "}
                  <span className="text-xs text-muted-foreground font-normal">({t.prefecture}・{t.city})</span>
                </span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoleSwitcher({
  currentRole,
  onChange,
}: {
  currentRole: StaffRole;
  onChange: (r: StaffRole) => void;
}) {
  const Icon = ROLE_ICON[currentRole];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 px-2 sm:px-3 py-1.5 transition-colors"
          aria-label="ロール切替"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="text-xs font-medium hidden sm:inline">デモ視点</span>
          <span className="text-xs font-semibold inline-flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {ROLE_LABEL[currentRole]}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs">デモ用：閲覧者の視点を切替</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={currentRole}
          onValueChange={(v) => onChange(v as StaffRole)}
        >
          <RoleOption
            value="group_owner"
            title="GroupOwner（代表）"
            desc="全店舗のデータ・店舗間比較が見える"
            icon={Crown}
          />
          <RoleOption
            value="owner"
            title="Owner（院長）"
            desc="自店舗の全機能。スタッフ管理・売上・設定"
            icon={UserCog}
          />
          <RoleOption value="staff" title="Staff（一般スタッフ）" desc="自分の予約・カルテ・シフトのみ" icon={UsersIcon} />
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[10px] text-muted-foreground" disabled>
          本番では Supabase Auth のロールで自動判定されます
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoleOption({
  value,
  title,
  desc,
  icon: Icon,
}: {
  value: StaffRole;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <DropdownMenuRadioItem value={value} className="py-2">
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-[10px] text-muted-foreground">{desc}</div>
        </div>
      </div>
    </DropdownMenuRadioItem>
  );
}

function MobileNavSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
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
