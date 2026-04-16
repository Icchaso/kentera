// CureBoard — ドメイン型定義（設計書準拠、Phase 0 モック版）

export type Gender = "male" | "female" | "other";
export type StaffRole = "owner" | "manager" | "staff" | "reception" | "superadmin";
export type ReferralSource = "referral" | "flyer" | "web" | "sns" | "walk_in" | "other";
export type PatientTag = "VIP" | "紹介" | "保険" | "自費" | "要観察";
export type MenuCategory = "insurance" | "self_pay" | "product";
export type ReservationStatus =
  | "reserved"
  | "arrived"
  | "in_treatment"
  | "completed"
  | "paid"
  | "cancelled"
  | "no_show";
export type ReservationSource = "manual" | "online" | "line";
export type PaymentMethod = "cash" | "credit" | "qr" | "coupon" | "insurance" | "mixed";
export type CouponStatus = "active" | "expired" | "fully_used";
export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "supplies"
  | "labor"
  | "marketing"
  | "equipment"
  | "other";

export interface Tenant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  businessHours: { open: string; close: string };
  closedDays: number[]; // 0=日〜6=土
  bedCount: number;
  reservationSlotMinutes: number;
  logoColor: string;
  plan: "free" | "basic" | "pro" | "enterprise";
}

export interface Staff {
  id: string;
  tenantId: string;
  displayName: string;
  role: StaffRole;
  email: string;
  qualifications: { name: string; licenseNumber?: string; expiresAt?: string }[];
  specialties: string[];
  avatarUrl?: string;
  color: string; // カレンダー表示色
  isActive: boolean;
  monthlyTarget?: number;
}

export interface Patient {
  id: string;
  tenantId: string;
  familyGroupId?: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  gender: Gender;
  birthDate: string; // ISO date
  phone: string;
  email?: string;
  postalCode?: string;
  address?: string;
  occupation?: string;
  referralSource: ReferralSource;
  referralPatientId?: string;
  medicalHistory?: string;
  allergies?: string;
  tags: PatientTag[];
  lineUserId?: string;
  lineLinkedAt?: string;
  preferredStaffId?: string; // 担当スタッフ
  notes?: string;
  firstVisitDate: string;
  lastVisitDate: string;
  totalVisits: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: string;
  tenantId: string;
  name: string;
  category: MenuCategory;
  price: number;
  durationMinutes: number;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Reservation {
  id: string;
  tenantId: string;
  patientId: string;
  staffId: string;
  menuId: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  cancelReason?: string;
  reminderSentAt?: string;
  source: ReservationSource;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  reservationId: string;
  patientId: string;
  items: { menuId: string; name: string; price: number; quantity: number; isInsurance: boolean }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  receiptNumber: string;
  paidAt: string;
}

export interface MedicalRecord {
  id: string;
  tenantId: string;
  patientId: string;
  reservationId?: string;
  staffId: string;
  soapS: string;
  soapO: string;
  soapA: string;
  soapP: string;
  painScale: number; // 0-10
  isFirstVisit: boolean;
  recordedAt: string;
}

export interface Coupon {
  id: string;
  tenantId: string;
  patientId: string;
  name: string;
  totalCount: number;
  usedCount: number;
  price: number;
  expiresAt: string;
  purchasedAt: string;
  status: CouponStatus;
}

export interface AlertItem {
  id: string;
  type: "dropout" | "coupon_expiring" | "target_behind" | "birthday" | "reminder_failed";
  title: string;
  detail: string;
  patientId?: string;
  severity: "info" | "warning" | "danger";
  createdAt: string;
}

export interface DashboardKpi {
  label: string;
  value: string;
  deltaPct?: number; // 前月/前週比
  sub?: string;
}

export interface RevenuePoint {
  date: string; // ISO date
  revenue: number;
  visits: number;
}

export interface PatientFlowPoint {
  month: string; // "2026-04" 形式
  newPatients: number;
  repeat: number;
  dropout: number;
}

export interface HeatmapCell {
  day: number; // 0=日〜6=土
  hour: number; // 9〜20
  count: number;
}
