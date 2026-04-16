import type { StaffRole } from "@/types";
import type { NavItem } from "@/components/layout/sidebar";

// 各ロールが閲覧可能な href のリスト
const ROLE_ALLOW: Record<StaffRole, string[] | "all"> = {
  superadmin: "all",
  group_owner: "all",
  owner: [
    "/dashboard",
    "/reservations",
    "/patients",
    "/records",
    "/sales",
    "/staff",
    "/menus",
    "/settings",
  ],
  staff: ["/dashboard", "/reservations", "/patients", "/records"],
};

// 各ナビ項目のroleグループ要件
const GROUP_REQUIRED_ROLE: Record<NavItem["group"], StaffRole[]> = {
  main: ["group_owner", "owner", "staff", "superadmin"],
  group: ["group_owner", "superadmin"],
  admin: ["superadmin"],
};

export function filterNavByRole(items: NavItem[], role: StaffRole): NavItem[] {
  return items.filter((item) => {
    const allowedRolesForGroup = GROUP_REQUIRED_ROLE[item.group];
    if (!allowedRolesForGroup.includes(role)) return false;
    const allowed = ROLE_ALLOW[role];
    if (allowed === "all") return true;
    return allowed.includes(item.href);
  });
}

export function canAccessPath(path: string, role: StaffRole): boolean {
  const allowed = ROLE_ALLOW[role];
  if (allowed === "all") return true;
  return allowed.some((p) => path === p || path.startsWith(`${p}/`));
}

export const ROLE_LABEL_JA: Record<StaffRole, string> = {
  superadmin: "SuperAdmin",
  group_owner: "GroupOwner",
  owner: "Owner",
  staff: "Staff",
};

export const ROLE_DESCRIPTION: Record<StaffRole, string> = {
  superadmin: "IDMS運営。全テナント・業界分析にアクセス",
  group_owner: "複数店舗グループ代表。全店舗横断・比較レポート",
  owner: "自店舗のすべての機能（経営・人事・設定）",
  staff: "自分の予約・カルテ・シフトの閲覧・編集のみ",
};
