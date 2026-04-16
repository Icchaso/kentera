// CureBoard — ドメイン型定義（設計書準拠、Phase 0 モック版）

export type Gender = "male" | "female" | "other";
export type StaffRole = "superadmin" | "group_owner" | "owner" | "staff";
export type ClinicType = "seikotsu" | "seitai" | "shinkyu" | "sekkotsuin" | "mixed" | "other";
export type ReferralSource = "referral" | "flyer" | "web" | "sns" | "walk_in" | "other";
export type Occupation =
  | "desk_work"
  | "standing"
  | "physical_labor"
  | "athlete"
  | "student"
  | "homemaker"
  | "retired"
  | "other";
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
export type InsuranceType = "health" | "workers_comp" | "auto_liability" | "life" | "none";
export type CouponStatus = "active" | "expired" | "fully_used";
export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "supplies"
  | "labor"
  | "marketing"
  | "equipment"
  | "other";
export type RecordCause =
  | "daily_life"
  | "sports"
  | "work"
  | "accident"
  | "aging"
  | "postpartum"
  | "other";
export type RecordOutcome =
  | "improving"
  | "recovered"
  | "maintenance"
  | "discontinued"
  | "referred";
export type ChiefComplaint =
  | "肩こり"
  | "腰痛"
  | "膝痛"
  | "首痛"
  | "頭痛"
  | "骨盤ゆがみ"
  | "スポーツ外傷"
  | "ヘルニア"
  | "五十肩"
  | "坐骨神経痛"
  | "四十肩"
  | "股関節痛";
export type Modality =
  | "手技"
  | "超音波"
  | "電気"
  | "鍼"
  | "灸"
  | "テーピング"
  | "矯正"
  | "運動療法"
  | "牽引"
  | "温熱";

export interface TenantGroup {
  id: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  groupId?: string; // 単店舗は null
  branchName?: string; // "本院", "駅前院" 等
  name: string;
  clinicType: ClinicType;
  prefecture: string;
  city: string;
  establishedYear?: number;
  address: string;
  phone: string;
  email: string;
  businessHours: { open: string; close: string };
  closedDays: number[];
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
  roleLabel?: string; // 表示用の肩書き（受付、施術者、副院長 など）
  email: string;
  qualifications: { name: string; licenseNumber?: string; expiresAt?: string }[];
  specialties: string[];
  avatarUrl?: string;
  color: string;
  yearsOfExperience?: number;
  joinedAt?: string;
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
  birthDate: string;
  phone: string;
  email?: string;
  postalCode?: string;
  address?: string;
  occupation?: Occupation;
  occupationLabel?: string; // 自由記述（表示用）
  referralSource: ReferralSource;
  referralPatientId?: string;
  medicalHistory?: string;
  allergies?: string;
  tags: PatientTag[];
  lineUserId?: string;
  lineLinkedAt?: string;
  preferredStaffId?: string;
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
  isDesignated: boolean;
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
  insuranceType?: InsuranceType;
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
  chiefComplaints: ChiefComplaint[];
  modalities: Modality[];
  cause?: RecordCause;
  outcome?: RecordOutcome;
  treatmentAreas: string[];
  painScale: number;
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
  deltaPct?: number;
  sub?: string;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  visits: number;
}

export interface PatientFlowPoint {
  month: string;
  newPatients: number;
  repeat: number;
  dropout: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
}
