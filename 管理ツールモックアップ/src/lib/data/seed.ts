import type {
  Tenant,
  TenantGroup,
  Staff,
  Patient,
  Menu,
  Reservation,
  Payment,
  MedicalRecord,
  Coupon,
  AlertItem,
  PatientTag,
  ChiefComplaint,
  Modality,
  RecordCause,
  RecordOutcome,
  Occupation,
  InsuranceType,
} from "@/types";

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260416);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const pickMultiple = <T,>(arr: T[], max: number): T[] => {
  const n = Math.min(Math.floor(rand() * max) + 1, arr.length);
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
};

const TENANT_ID = "tenant-demo-01";
const TENANT_ID_2 = "tenant-demo-02";
const TENANT_ID_3 = "tenant-demo-03";
const GROUP_ID = "group-demo-01";
const NOW = new Date("2026-04-16T09:00:00+09:00");

function iso(d: Date): string {
  return d.toISOString();
}
function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function setTime(d: Date, h: number, m: number): Date {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x;
}

// ================================================
// Tenant Group
// ================================================
export const tenantGroup: TenantGroup = {
  id: GROUP_ID,
  name: "デモ整骨院グループ",
  ownerUserId: "user-group-owner",
  createdAt: "2025-04-01T00:00:00+09:00",
};

// ================================================
// Tenants（3店舗）
// ================================================
export const tenants: Tenant[] = [
  {
    id: TENANT_ID,
    groupId: GROUP_ID,
    branchName: "本院",
    name: "デモ整骨院 本院",
    clinicType: "seikotsu",
    prefecture: "東京都",
    city: "世田谷区",
    establishedYear: 2018,
    address: "東京都世田谷区三軒茶屋1-2-3 三茶ビル2F",
    phone: "03-1234-5678",
    email: "honin@demo-seikotsuin.example",
    businessHours: { open: "09:00", close: "20:00" },
    closedDays: [0],
    bedCount: 4,
    reservationSlotMinutes: 30,
    logoColor: "#2563eb",
    plan: "pro",
  },
  {
    id: TENANT_ID_2,
    groupId: GROUP_ID,
    branchName: "駅前院",
    name: "デモ整骨院 駅前院",
    clinicType: "seikotsu",
    prefecture: "東京都",
    city: "世田谷区",
    establishedYear: 2022,
    address: "東京都世田谷区太子堂4-5-6 駅前プラザ1F",
    phone: "03-2345-6789",
    email: "ekimae@demo-seikotsuin.example",
    businessHours: { open: "10:00", close: "21:00" },
    closedDays: [0],
    bedCount: 3,
    reservationSlotMinutes: 30,
    logoColor: "#0ea5e9",
    plan: "pro",
  },
  {
    id: TENANT_ID_3,
    groupId: GROUP_ID,
    branchName: "横浜院",
    name: "デモ整骨院 横浜院",
    clinicType: "mixed",
    prefecture: "神奈川県",
    city: "横浜市西区",
    establishedYear: 2024,
    address: "神奈川県横浜市西区北幸2-1-1 横浜駅西口ビル3F",
    phone: "045-123-4567",
    email: "yokohama@demo-seikotsuin.example",
    businessHours: { open: "09:00", close: "20:00" },
    closedDays: [0],
    bedCount: 5,
    reservationSlotMinutes: 30,
    logoColor: "#10b981",
    plan: "pro",
  },
];

// 後方互換：tenant として本院
export const tenant: Tenant = tenants[0];

// ================================================
// Staff（店舗別）
// ================================================
export const staffList: Staff[] = [
  // GroupOwner（本院所属だが全店舗管理）
  {
    id: "staff-00",
    tenantId: TENANT_ID,
    displayName: "代表 藤原 俊介",
    role: "group_owner",
    roleLabel: "グループ代表",
    email: "fujiwara@demo.example",
    qualifications: [{ name: "柔道整復師", licenseNumber: "JU-00001", expiresAt: "2028-03-31" }],
    specialties: ["経営", "スポーツ外傷"],
    color: "#7c3aed",
    yearsOfExperience: 22,
    joinedAt: "2005-04-01",
    isActive: true,
  },
  // 本院
  {
    id: "staff-01",
    tenantId: TENANT_ID,
    displayName: "山田 健一",
    role: "owner",
    roleLabel: "本院 院長",
    email: "yamada@demo.example",
    qualifications: [
      { name: "柔道整復師", licenseNumber: "JU-12345", expiresAt: "2028-03-31" },
      { name: "鍼灸師", licenseNumber: "HA-67890", expiresAt: "2028-03-31" },
    ],
    specialties: ["骨盤矯正", "スポーツ外傷", "鍼灸"],
    color: "#2563eb",
    yearsOfExperience: 15,
    joinedAt: "2018-04-01",
    isActive: true,
    monthlyTarget: 1_200_000,
  },
  {
    id: "staff-02",
    tenantId: TENANT_ID,
    displayName: "佐藤 美咲",
    role: "staff",
    roleLabel: "副院長",
    email: "sato@demo.example",
    qualifications: [{ name: "柔道整復師", licenseNumber: "JU-23456", expiresAt: "2027-09-30" }],
    specialties: ["産後ケア", "骨盤矯正", "小顔矯正"],
    color: "#0ea5e9",
    yearsOfExperience: 9,
    joinedAt: "2019-07-15",
    isActive: true,
    monthlyTarget: 900_000,
  },
  {
    id: "staff-03",
    tenantId: TENANT_ID,
    displayName: "鈴木 拓海",
    role: "staff",
    roleLabel: "施術者",
    email: "suzuki@demo.example",
    qualifications: [{ name: "柔道整復師", licenseNumber: "JU-34567", expiresAt: "2029-01-31" }],
    specialties: ["肩こり・腰痛", "スポーツ外傷"],
    color: "#10b981",
    yearsOfExperience: 4,
    joinedAt: "2022-04-01",
    isActive: true,
    monthlyTarget: 700_000,
  },
  {
    id: "staff-04",
    tenantId: TENANT_ID,
    displayName: "田中 葵",
    role: "staff",
    roleLabel: "受付",
    email: "tanaka@demo.example",
    qualifications: [],
    specialties: [],
    color: "#f59e0b",
    yearsOfExperience: 2,
    joinedAt: "2024-04-01",
    isActive: true,
  },
  // 駅前院
  {
    id: "staff-05",
    tenantId: TENANT_ID_2,
    displayName: "井上 大輔",
    role: "owner",
    roleLabel: "駅前院 院長",
    email: "inoue@demo.example",
    qualifications: [{ name: "柔道整復師", licenseNumber: "JU-45678", expiresAt: "2027-12-31" }],
    specialties: ["骨盤矯正", "猫背矯正"],
    color: "#0284c7",
    yearsOfExperience: 11,
    joinedAt: "2022-04-01",
    isActive: true,
    monthlyTarget: 1_000_000,
  },
  {
    id: "staff-06",
    tenantId: TENANT_ID_2,
    displayName: "高橋 陽菜",
    role: "staff",
    roleLabel: "施術者",
    email: "takahashi@demo.example",
    qualifications: [{ name: "柔道整復師", licenseNumber: "JU-56789", expiresAt: "2028-06-30" }],
    specialties: ["産後ケア", "小児施術"],
    color: "#06b6d4",
    yearsOfExperience: 5,
    joinedAt: "2022-08-01",
    isActive: true,
    monthlyTarget: 800_000,
  },
  {
    id: "staff-07",
    tenantId: TENANT_ID_2,
    displayName: "木村 結菜",
    role: "staff",
    roleLabel: "受付",
    email: "kimura@demo.example",
    qualifications: [],
    specialties: [],
    color: "#f59e0b",
    yearsOfExperience: 3,
    joinedAt: "2023-01-15",
    isActive: true,
  },
  // 横浜院
  {
    id: "staff-08",
    tenantId: TENANT_ID_3,
    displayName: "伊藤 翼",
    role: "owner",
    roleLabel: "横浜院 院長",
    email: "ito@demo.example",
    qualifications: [
      { name: "柔道整復師", licenseNumber: "JU-67890", expiresAt: "2028-11-30" },
      { name: "鍼灸師", licenseNumber: "HA-11223", expiresAt: "2028-11-30" },
    ],
    specialties: ["鍼灸", "マタニティケア"],
    color: "#059669",
    yearsOfExperience: 8,
    joinedAt: "2024-04-01",
    isActive: true,
    monthlyTarget: 800_000,
  },
  {
    id: "staff-09",
    tenantId: TENANT_ID_3,
    displayName: "渡辺 湊",
    role: "staff",
    roleLabel: "施術者",
    email: "watanabe@demo.example",
    qualifications: [{ name: "柔道整復師", licenseNumber: "JU-78901", expiresAt: "2027-07-31" }],
    specialties: ["スポーツ外傷", "テーピング"],
    color: "#14b8a6",
    yearsOfExperience: 6,
    joinedAt: "2024-04-15",
    isActive: true,
    monthlyTarget: 700_000,
  },
  {
    id: "staff-10",
    tenantId: TENANT_ID_3,
    displayName: "清水 美月",
    role: "staff",
    roleLabel: "受付",
    email: "shimizu@demo.example",
    qualifications: [],
    specialties: [],
    color: "#f59e0b",
    yearsOfExperience: 1,
    joinedAt: "2025-03-01",
    isActive: true,
  },
];

// ================================================
// Menus（3店舗共通で同じ構成を用意、tenantIdで分割）
// ================================================
const MENU_TEMPLATE = [
  { nameJa: "保険施術（初診）", category: "insurance" as const, price: 1500, duration: 30, desc: "初診時の保険適用施術" },
  { nameJa: "保険施術（再診）", category: "insurance" as const, price: 800, duration: 20, desc: "再診時の保険適用施術" },
  { nameJa: "保険＋自費ミックス", category: "insurance" as const, price: 2500, duration: 40, desc: "保険施術に自費オプション" },
  { nameJa: "骨盤矯正", category: "self_pay" as const, price: 5500, duration: 40, desc: "骨格バランスを整える人気メニュー" },
  { nameJa: "産後骨盤ケア", category: "self_pay" as const, price: 6600, duration: 50, desc: "産後の骨盤・姿勢・内臓下垂ケア" },
  { nameJa: "鍼灸セッション", category: "self_pay" as const, price: 7700, duration: 60, desc: "東洋医学ベースの全身鍼灸" },
  { nameJa: "スポーツコンディショニング", category: "self_pay" as const, price: 8800, duration: 60, desc: "アスリート向けパフォーマンス調整" },
  { nameJa: "姿勢サポートインソール", category: "product" as const, price: 12_000, duration: 15, desc: "オーダーメイド物販" },
];

export const menus: Menu[] = tenants.flatMap((t, tIdx) =>
  MENU_TEMPLATE.map((m, i) => ({
    id: `menu-${t.id.slice(-2)}-${String(i + 1).padStart(2, "0")}`,
    tenantId: t.id,
    name: m.nameJa,
    category: m.category,
    price: m.price + tIdx * 0, // 将来店舗ごとに価格差つけられる
    durationMinutes: m.duration,
    description: m.desc,
    sortOrder: i + 1,
    isActive: !(tIdx === 2 && m.nameJa === "姿勢サポートインソール"), // 横浜院は物販なし
  }))
);

// ================================================
// Patient generator
// ================================================
const LAST_NAMES = ["山田", "佐藤", "鈴木", "田中", "高橋", "伊藤", "渡辺", "中村", "小林", "加藤", "吉田", "山本", "松本", "井上", "木村", "林", "斎藤", "清水", "森", "池田"];
const LAST_NAMES_KANA = ["ヤマダ", "サトウ", "スズキ", "タナカ", "タカハシ", "イトウ", "ワタナベ", "ナカムラ", "コバヤシ", "カトウ", "ヨシダ", "ヤマモト", "マツモト", "イノウエ", "キムラ", "ハヤシ", "サイトウ", "シミズ", "モリ", "イケダ"];
const FIRST_NAMES_M = ["大輔", "翔", "健", "翼", "陸", "颯太", "蓮", "湊", "悠真", "海斗"];
const FIRST_NAMES_M_KANA = ["ダイスケ", "ショウ", "ケン", "ツバサ", "リク", "ソウタ", "レン", "ミナト", "ユウマ", "カイト"];
const FIRST_NAMES_F = ["優奈", "美咲", "結菜", "葵", "陽菜", "さくら", "美月", "凛", "愛莉", "芽生"];
const FIRST_NAMES_F_KANA = ["ユウナ", "ミサキ", "ユイナ", "アオイ", "ヒナ", "サクラ", "ミヅキ", "リン", "アイリ", "メイ"];
const OCCUPATION_DISTRIBUTION: { enum: Occupation; label: string }[] = [
  { enum: "desk_work", label: "デスクワーク" },
  { enum: "desk_work", label: "会社員" },
  { enum: "standing", label: "販売員" },
  { enum: "physical_labor", label: "建設作業員" },
  { enum: "physical_labor", label: "介護士" },
  { enum: "athlete", label: "アスリート" },
  { enum: "student", label: "学生" },
  { enum: "homemaker", label: "主婦" },
  { enum: "retired", label: "退職" },
  { enum: "other", label: "自営業" },
  { enum: "other", label: "フリーランス" },
];
const ALL_TAGS: PatientTag[] = ["VIP", "紹介", "保険", "自費", "要観察"];
const REFERRAL_SOURCES: Patient["referralSource"][] = ["web", "flyer", "sns", "referral", "walk_in", "other"];

// 店舗別の設定
const BRANCH_CONFIGS: {
  tenantId: string;
  patientCount: number;
  reservationDaysBack: number;
  dropoutCount: number; // 離脱傾向の患者数
  treatingStaff: string[];
  addressHint: string;
  indexBase: number;
}[] = [
  {
    tenantId: TENANT_ID,
    patientCount: 50,
    reservationDaysBack: 90,
    dropoutCount: 8,
    treatingStaff: ["staff-01", "staff-02", "staff-03"],
    addressHint: "東京都世田谷区三軒茶屋",
    indexBase: 0,
  },
  {
    tenantId: TENANT_ID_2,
    patientCount: 35,
    reservationDaysBack: 60,
    dropoutCount: 5,
    treatingStaff: ["staff-05", "staff-06"],
    addressHint: "東京都世田谷区太子堂",
    indexBase: 1000,
  },
  {
    tenantId: TENANT_ID_3,
    patientCount: 22,
    reservationDaysBack: 45,
    dropoutCount: 2,
    treatingStaff: ["staff-08", "staff-09"],
    addressHint: "神奈川県横浜市西区",
    indexBase: 2000,
  },
];

function generatePatientsForBranch(cfg: (typeof BRANCH_CONFIGS)[number]): Patient[] {
  return Array.from({ length: cfg.patientCount }, (_, i) => {
    const globalIdx = cfg.indexBase + i;
    const lnIdx = Math.floor(rand() * LAST_NAMES.length);
    const gender: Patient["gender"] = rand() < 0.55 ? "female" : "male";
    const fnIdx = Math.floor(rand() * FIRST_NAMES_M.length);
    const lastName = LAST_NAMES[lnIdx];
    const lastNameKana = LAST_NAMES_KANA[lnIdx];
    const firstName = gender === "male" ? FIRST_NAMES_M[fnIdx] : FIRST_NAMES_F[fnIdx];
    const firstNameKana = gender === "male" ? FIRST_NAMES_M_KANA[fnIdx] : FIRST_NAMES_F_KANA[fnIdx];
    const age = 20 + Math.floor(rand() * 60);
    const birthYear = NOW.getFullYear() - age;
    const birthDate = `${birthYear}-${String(Math.floor(rand() * 12) + 1).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}`;
    const firstVisitDaysAgo = 30 + Math.floor(rand() * Math.min(720, cfg.reservationDaysBack * 8));
    const firstVisitDate = dateOnly(addDays(NOW, -firstVisitDaysAgo));
    const isDropout = i < cfg.dropoutCount;
    const lastVisitDaysAgo = isDropout
      ? 60 + Math.floor(rand() * 90)
      : Math.floor(rand() * 45);
    const lastVisitDate = dateOnly(addDays(NOW, -lastVisitDaysAgo));
    const totalVisits = isDropout ? 2 + Math.floor(rand() * 8) : 5 + Math.floor(rand() * 30);
    const totalSpent = totalVisits * (2000 + Math.floor(rand() * 6000));
    const tags = pickMultiple(ALL_TAGS, 2);
    const lineLinked = rand() < 0.6;
    const hasFamily = rand() < 0.1;
    const preferredStaffId = pick(cfg.treatingStaff);
    const occ = pick(OCCUPATION_DISTRIBUTION);

    return {
      id: `patient-${String(globalIdx + 1).padStart(4, "0")}`,
      tenantId: cfg.tenantId,
      familyGroupId: hasFamily ? `family-${cfg.tenantId.slice(-2)}-${Math.floor(i / 2) + 1}` : undefined,
      lastName,
      firstName,
      lastNameKana,
      firstNameKana,
      gender,
      birthDate,
      phone: `090-${String(1000 + Math.floor(rand() * 9000))}-${String(1000 + Math.floor(rand() * 9000))}`,
      email: rand() < 0.7 ? `${lastNameKana.toLowerCase()}${globalIdx}@example.com` : undefined,
      postalCode: `154-00${String(Math.floor(rand() * 90) + 10)}`,
      address: cfg.addressHint + (Math.floor(rand() * 5) + 1) + "-" + (Math.floor(rand() * 30) + 1),
      occupation: occ.enum,
      occupationLabel: occ.label,
      referralSource: pick(REFERRAL_SOURCES),
      medicalHistory: rand() < 0.3 ? pick(["高血圧", "糖尿病境界型", "椎間板ヘルニア既往", "喘息"]) : undefined,
      allergies: rand() < 0.15 ? pick(["花粉", "そば", "ラテックス"]) : undefined,
      tags,
      lineUserId: lineLinked ? `U${Math.random().toString(36).slice(2, 12)}` : undefined,
      lineLinkedAt: lineLinked ? iso(addDays(NOW, -Math.floor(rand() * 180))) : undefined,
      preferredStaffId,
      notes: rand() < 0.2 ? "セルフケア熱心。再来院意欲高い。" : undefined,
      firstVisitDate,
      lastVisitDate,
      totalVisits,
      totalSpent,
      isActive: !isDropout || rand() < 0.3,
      createdAt: iso(addDays(NOW, -firstVisitDaysAgo)),
      updatedAt: iso(addDays(NOW, -lastVisitDaysAgo)),
    };
  });
}

export const patients: Patient[] = BRANCH_CONFIGS.flatMap(generatePatientsForBranch);

// ================================================
// Reservations（店舗別）
// ================================================
function generateReservationsForBranch(cfg: (typeof BRANCH_CONFIGS)[number], startIdx: number): { reservations: Reservation[]; nextIdx: number } {
  const out: Reservation[] = [];
  const START = addDays(NOW, -cfg.reservationDaysBack);
  const END = addDays(NOW, 7);
  let cursor = new Date(START);
  let idCounter = startIdx;
  const branchPatients = patients.filter((p) => p.tenantId === cfg.tenantId);
  const branchMenus = menus.filter((m) => m.tenantId === cfg.tenantId && m.category !== "product");
  // 本院、駅前院、横浜院の1日あたり予約規模
  const dailyMin = cfg.tenantId === TENANT_ID ? 10 : cfg.tenantId === TENANT_ID_2 ? 7 : 5;
  const dailyMax = cfg.tenantId === TENANT_ID ? 16 : cfg.tenantId === TENANT_ID_2 ? 10 : 7;

  while (cursor <= END) {
    const dow = cursor.getDay();
    if (dow !== 0) {
      const dailyCount = dailyMin + Math.floor(rand() * dailyMax);
      for (let i = 0; i < dailyCount; i++) {
        const hour = 9 + Math.floor(rand() * 10);
        const minute = rand() < 0.5 ? 0 : 30;
        const start = setTime(cursor, hour, minute);
        const menu = pick(branchMenus);
        const staffId = pick(cfg.treatingStaff);
        const patient = pick(branchPatients);
        const end = new Date(start.getTime() + menu.durationMinutes * 60 * 1000);
        const isFuture = start > NOW;
        const status: Reservation["status"] = isFuture
          ? "reserved"
          : rand() < 0.05
          ? "cancelled"
          : rand() < 0.03
          ? "no_show"
          : "paid";
        const isDesignated = rand() < 0.55;
        out.push({
          id: `res-${cfg.tenantId.slice(-2)}-${String(idCounter++).padStart(5, "0")}`,
          tenantId: cfg.tenantId,
          patientId: patient.id,
          staffId,
          menuId: menu.id,
          startAt: iso(start),
          endAt: iso(end),
          status,
          cancelReason: status === "cancelled" ? pick(["体調不良", "急な予定", "その他"]) : undefined,
          reminderSentAt: !isFuture ? iso(addDays(start, -1)) : undefined,
          source: pick(["manual", "online", "line"] as const),
          isDesignated,
          notes: undefined,
          createdAt: iso(addDays(start, -(Math.floor(rand() * 14) + 1))),
        });
      }
    }
    cursor = addDays(cursor, 1);
  }
  return { reservations: out, nextIdx: idCounter };
}

export const reservations: Reservation[] = (() => {
  const all: Reservation[] = [];
  let idx = 1;
  for (const cfg of BRANCH_CONFIGS) {
    const { reservations: r, nextIdx } = generateReservationsForBranch(cfg, idx);
    all.push(...r);
    idx = nextIdx;
  }
  return all;
})();

// ================================================
// Payments
// ================================================
const INSURANCE_TYPES: InsuranceType[] = ["health", "workers_comp", "auto_liability", "life", "none"];

export const payments: Payment[] = reservations
  .filter((r) => r.status === "paid")
  .map((r, i) => {
    const menu = menus.find((m) => m.id === r.menuId)!;
    const subtotal = menu.price;
    const tax = 0;
    const method = pick(["cash", "credit", "qr", "coupon"] as const);
    const isInsuranceMenu = menu.category === "insurance";
    return {
      id: `pay-${String(i + 1).padStart(6, "0")}`,
      tenantId: r.tenantId,
      reservationId: r.id,
      patientId: r.patientId,
      items: [
        {
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          isInsurance: isInsuranceMenu,
        },
      ],
      subtotal,
      discount: 0,
      tax,
      total: subtotal + tax,
      paymentMethod: method,
      insuranceType: isInsuranceMenu ? pick(INSURANCE_TYPES.filter((t) => t !== "none")) : "none",
      receiptNumber: `R-${r.tenantId.slice(-2)}-${String(i + 1).padStart(6, "0")}`,
      paidAt: r.endAt,
    };
  });

// ================================================
// Medical Records
// ================================================
const SOAP_S = ["肩が重だるい", "腰に違和感", "膝が痛む", "朝起きると首が痛い", "長時間座ると腰が張る", "スポーツ後の筋肉痛"];
const SOAP_O = ["僧帽筋の緊張あり", "腰部可動域制限", "膝関節の腫れ軽度", "頸椎アライメント乱れ", "骨盤前傾姿勢", "下腿三頭筋短縮"];
const SOAP_A = ["慢性肩こり", "腰痛症", "変形性膝関節症疑い", "頸肩腕症候群", "骨盤ゆがみ", "スポーツ外傷（軽度）"];
const SOAP_P = ["週2回の施術を4週継続", "骨盤矯正導入", "ストレッチ指導", "鍼灸併用で継続観察", "セルフケアを自宅実施", "次回2週間後"];
const ALL_COMPLAINTS: ChiefComplaint[] = ["肩こり", "腰痛", "膝痛", "首痛", "頭痛", "骨盤ゆがみ", "スポーツ外傷", "ヘルニア", "五十肩", "坐骨神経痛", "四十肩", "股関節痛"];
const ALL_MODALITIES: Modality[] = ["手技", "超音波", "電気", "鍼", "灸", "テーピング", "矯正", "運動療法", "牽引", "温熱"];
const CAUSES: RecordCause[] = ["daily_life", "sports", "work", "accident", "aging", "postpartum", "other"];
const OUTCOMES: RecordOutcome[] = ["improving", "recovered", "maintenance", "discontinued", "referred"];
const TREATMENT_AREAS = ["肩", "腰", "膝", "首", "股関節", "足首", "肘", "手首"];

export const medicalRecords: MedicalRecord[] = patients.flatMap((p) => {
  const count = 2 + Math.floor(rand() * 7);
  const patientReservations = reservations
    .filter((r) => r.patientId === p.id && r.status === "paid")
    .slice(0, count);
  return patientReservations.map((r, idx) => ({
    id: `rec-${p.id}-${idx}`,
    tenantId: p.tenantId,
    patientId: p.id,
    reservationId: r.id,
    staffId: r.staffId,
    soapS: pick(SOAP_S),
    soapO: pick(SOAP_O),
    soapA: pick(SOAP_A),
    soapP: pick(SOAP_P),
    chiefComplaints: pickMultiple(ALL_COMPLAINTS, 2),
    modalities: pickMultiple(ALL_MODALITIES, 3),
    cause: pick(CAUSES),
    outcome: pick(OUTCOMES),
    treatmentAreas: pickMultiple(TREATMENT_AREAS, 2),
    painScale: Math.floor(rand() * 10) + 1,
    isFirstVisit: idx === 0,
    recordedAt: r.endAt,
  }));
});

// ================================================
// Coupons
// ================================================
export const coupons: Coupon[] = (() => {
  const out: Coupon[] = [];
  BRANCH_CONFIGS.forEach((cfg, bIdx) => {
    const branchPatients = patients.filter((p) => p.tenantId === cfg.tenantId);
    const count = cfg.tenantId === TENANT_ID ? 10 : cfg.tenantId === TENANT_ID_2 ? 6 : 3;
    for (let i = 0; i < count; i++) {
      const patient = branchPatients[i * 3 % branchPatients.length];
      const total = 5 + Math.floor(rand() * 6);
      const used = i < 3 ? total : i < 6 ? Math.floor(total * 0.6) : Math.floor(total * 0.2);
      const daysToExpire = i === 2 ? -20 : i === 1 ? 10 : 60 + Math.floor(rand() * 200);
      const status: Coupon["status"] = daysToExpire < 0 ? "expired" : used >= total ? "fully_used" : "active";
      out.push({
        id: `coupon-${cfg.tenantId.slice(-2)}-${String(i + 1).padStart(3, "0")}`,
        tenantId: cfg.tenantId,
        patientId: patient.id,
        name: pick(["骨盤矯正5回券", "鍼灸4回券", "産後ケア6回券", "スポーツ調整10回券"]),
        totalCount: total,
        usedCount: used,
        price: 25_000 + Math.floor(rand() * 30_000),
        expiresAt: dateOnly(addDays(NOW, daysToExpire)),
        purchasedAt: iso(addDays(NOW, -(180 - daysToExpire))),
        status,
      });
    }
    void bIdx;
  });
  return out;
})();

// ================================================
// Alerts（店舗別）
// ================================================
export const alerts: AlertItem[] = (() => {
  const out: AlertItem[] = [];
  BRANCH_CONFIGS.forEach((cfg) => {
    const branchPatients = patients.filter((p) => p.tenantId === cfg.tenantId);
    const dropoutPatients = branchPatients.slice(0, cfg.dropoutCount);
    dropoutPatients.forEach((p) => {
      out.push({
        id: `alert-dropout-${p.id}`,
        type: "dropout",
        title: `${p.lastName} ${p.firstName} 様が離脱傾向`,
        detail: `最終来院から ${Math.floor((NOW.getTime() - new Date(p.lastVisitDate).getTime()) / 86400_000)} 日経過`,
        patientId: p.id,
        severity: "warning",
        createdAt: iso(NOW),
      });
    });
  });
  // グループ共通アラート
  out.push(
    {
      id: "alert-coupon-01",
      type: "coupon_expiring",
      title: "回数券の期限が10日以内",
      detail: "3枚の回数券が10日以内に期限切れ予定",
      severity: "warning",
      createdAt: iso(NOW),
    },
    {
      id: "alert-target-01",
      type: "target_behind",
      title: "今月の売上目標進捗が遅れ気味",
      detail: "横浜院の進捗率 58%（目安 75%）",
      severity: "info",
      createdAt: iso(NOW),
    },
    {
      id: "alert-birthday-01",
      type: "birthday",
      title: "今月の誕生日患者: 9名",
      detail: "グループ全体・バースデークーポンの送信を検討",
      severity: "info",
      createdAt: iso(NOW),
    }
  );
  return out;
})();

// ================================================
// Tenant-scoping helper
// ================================================
export function scopeByTenant<T extends { tenantId: string }>(items: T[], tenantId: string): T[] {
  if (tenantId === "all") return items;
  return items.filter((i) => i.tenantId === tenantId);
}

// ================================================
// 店舗別KPI（GroupOwner比較レポート用）
// ================================================
export const branchKpis = tenants.map((t) => {
  const tPayments = payments.filter((p) => p.tenantId === t.id);
  const tReservations = reservations.filter((r) => r.tenantId === t.id);
  const tPatients = patients.filter((p) => p.tenantId === t.id);
  // 過去30日でフィルタ
  const thirtyDaysAgo = addDays(NOW, -30);
  const recentPayments = tPayments.filter((p) => new Date(p.paidAt) >= thirtyDaysAgo);
  const monthlyRevenue = recentPayments.reduce((s, p) => s + p.total, 0);
  const monthlyVisits = recentPayments.length;
  const newPatients = tPatients.filter((p) => new Date(p.firstVisitDate) >= thirtyDaysAgo).length;
  const cancelRate = Math.round(
    (tReservations.filter((r) => r.status === "cancelled").length / Math.max(tReservations.length, 1)) *
      100 *
      10
  ) / 10;
  const avgTicket = monthlyVisits === 0 ? 0 : Math.round(monthlyRevenue / monthlyVisits);
  const staffCount = staffList.filter((s) => s.tenantId === t.id).length;
  const target = t.id === TENANT_ID ? 4_500_000 : t.id === TENANT_ID_2 ? 3_000_000 : 2_200_000;
  const repeatRate = t.id === TENANT_ID ? 74 : t.id === TENANT_ID_2 ? 68 : 58;
  return {
    tenantId: t.id,
    monthlyRevenue,
    monthlyVisits,
    newPatients,
    repeatRate,
    cancelRate,
    avgTicket,
    staffCount,
    target,
  };
});

// ================================================
// 集計関数（tenantId 対応）
// ================================================
const resolveTenantId = (tenantId?: string) => tenantId ?? "all";

export function getDailyRevenueLast30(tenantId?: string): { date: string; revenue: number; visits: number }[] {
  const tid = resolveTenantId(tenantId);
  const scoped = scopeByTenant(payments, tid);
  const out: { date: string; revenue: number; visits: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = dateOnly(addDays(NOW, -i));
    const dayPayments = scoped.filter((p) => p.paidAt.slice(0, 10) === d);
    out.push({
      date: d,
      revenue: dayPayments.reduce((sum, p) => sum + p.total, 0),
      visits: dayPayments.length,
    });
  }
  return out;
}

export function getHeatmap(tenantId?: string): { day: number; hour: number; count: number }[] {
  const tid = resolveTenantId(tenantId);
  const scoped = scopeByTenant(reservations, tid);
  const cells: { day: number; hour: number; count: number }[] = [];
  for (let day = 1; day <= 6; day++) {
    for (let hour = 9; hour <= 19; hour++) {
      const c = scoped.filter((r) => {
        const d = new Date(r.startAt);
        return d.getDay() === day && d.getHours() === hour && r.status !== "cancelled";
      }).length;
      cells.push({ day, hour, count: c });
    }
  }
  return cells;
}

export function getPatientFlow(tenantId?: string): { month: string; newPatients: number; repeat: number; dropout: number }[] {
  const tid = resolveTenantId(tenantId);
  const scoped = scopeByTenant(patients, tid);
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(NOW);
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months.map((m) => {
    const newCount = scoped.filter((p) => p.firstVisitDate.slice(0, 7) === m).length;
    const repeatCount = 15 + Math.floor(rand() * 20);
    const dropoutCount = Math.floor(rand() * 5);
    return { month: m, newPatients: newCount || Math.floor(rand() * 6) + 3, repeat: repeatCount, dropout: dropoutCount };
  });
}

export function getTodayStats(tenantId?: string): {
  reservations: number;
  arrived: number;
  revenue: number;
  newPatients: number;
} {
  const tid = resolveTenantId(tenantId);
  const today = dateOnly(NOW);
  const scopedRes = scopeByTenant(reservations, tid);
  const scopedPay = scopeByTenant(payments, tid);
  const todayRes = scopedRes.filter((r) => r.startAt.slice(0, 10) === today);
  const todayPayments = scopedPay.filter((p) => p.paidAt.slice(0, 10) === today);
  return {
    reservations: todayRes.length,
    arrived: todayRes.filter((r) => r.status !== "reserved" && r.status !== "cancelled").length,
    revenue: todayPayments.reduce((s, p) => s + p.total, 0),
    newPatients: Math.max(1, Math.floor(todayRes.length / 10)),
  };
}

export function getKpis(tenantId?: string) {
  const tid = resolveTenantId(tenantId);
  const last30 = getDailyRevenueLast30(tid);
  const totalRevenue30 = last30.reduce((s, d) => s + d.revenue, 0);
  const totalVisits30 = last30.reduce((s, d) => s + d.visits, 0);
  const avgTicket = totalVisits30 === 0 ? 0 : Math.round(totalRevenue30 / totalVisits30);
  const scopedRes = scopeByTenant(reservations, tid);
  const scopedPatients = scopeByTenant(patients, tid);
  const cancelRate = scopedRes.length === 0 ? 0 : (scopedRes.filter((r) => r.status === "cancelled").length / scopedRes.length) * 100;
  const newPatients30 = scopedPatients.filter((p) => daysAgo(p.firstVisitDate) <= 30).length;
  const repeatRate = tid === TENANT_ID_3 ? 58 : tid === TENANT_ID_2 ? 68 : 72;
  const utilization = tid === TENANT_ID_3 ? 54 : tid === TENANT_ID_2 ? 62 : 68;
  const designatedRate = scopedRes.length === 0 ? 0 : Math.round(
    (scopedRes.filter((r) => r.isDesignated).length / scopedRes.length) * 100
  );
  return {
    newPatients30,
    repeatRate,
    cancelRate: Math.round(cancelRate * 10) / 10,
    avgTicket,
    utilization,
    totalRevenue30,
    totalVisits30,
    designatedRate,
  };
}

function daysAgo(isoDate: string): number {
  return Math.floor((NOW.getTime() - new Date(isoDate).getTime()) / 86400_000);
}

export function getStaffRanking(tenantId?: string) {
  const tid = resolveTenantId(tenantId);
  const scopedStaff = tid === "all" ? staffList : staffList.filter((s) => s.tenantId === tid);
  return scopedStaff
    .filter((s) => s.role !== "group_owner" && s.roleLabel !== "受付")
    .map((s) => {
      const sPayments = payments.filter((p) => {
        const res = reservations.find((r) => r.id === p.reservationId);
        return res?.staffId === s.id;
      });
      const revenue = sPayments.reduce((sum, p) => sum + p.total, 0);
      const count = sPayments.length;
      const designated = reservations.filter((r) => r.staffId === s.id && r.isDesignated).length;
      const total = reservations.filter((r) => r.staffId === s.id).length;
      const referralRate = total === 0 ? 0 : Math.round((designated / total) * 100);
      return {
        staff: s,
        revenue,
        treatmentCount: count,
        referralRate,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}
