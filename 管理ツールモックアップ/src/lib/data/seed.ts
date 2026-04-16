import type {
  Tenant,
  Staff,
  Patient,
  Menu,
  Reservation,
  Payment,
  MedicalRecord,
  Coupon,
  AlertItem,
  PatientTag,
} from "@/types";

// 決定的な擬似乱数（再現性確保）
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
const rand = mulberry32(20260415);
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
const NOW = new Date("2026-04-15T09:00:00+09:00");

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
// Tenant
// ================================================
export const tenant: Tenant = {
  id: TENANT_ID,
  name: "デモ整骨院",
  address: "東京都世田谷区三軒茶屋1-2-3 三茶ビル2F",
  phone: "03-1234-5678",
  email: "info@demo-seikotsuin.example",
  businessHours: { open: "09:00", close: "20:00" },
  closedDays: [0], // 日曜休
  bedCount: 4,
  reservationSlotMinutes: 30,
  logoColor: "#2563eb",
  plan: "pro",
};

// ================================================
// Staff
// ================================================
export const staffList: Staff[] = [
  {
    id: "staff-01",
    tenantId: TENANT_ID,
    displayName: "山田 健一",
    role: "owner",
    email: "yamada@demo.example",
    qualifications: [
      { name: "柔道整復師", licenseNumber: "JU-12345", expiresAt: "2028-03-31" },
      { name: "鍼灸師", licenseNumber: "HA-67890", expiresAt: "2028-03-31" },
    ],
    specialties: ["骨盤矯正", "スポーツ外傷", "鍼灸"],
    color: "#2563eb",
    isActive: true,
    monthlyTarget: 1_200_000,
  },
  {
    id: "staff-02",
    tenantId: TENANT_ID,
    displayName: "佐藤 美咲",
    role: "manager",
    email: "sato@demo.example",
    qualifications: [{ name: "柔道整復師", licenseNumber: "JU-23456", expiresAt: "2027-09-30" }],
    specialties: ["産後ケア", "骨盤矯正", "小顔矯正"],
    color: "#0ea5e9",
    isActive: true,
    monthlyTarget: 900_000,
  },
  {
    id: "staff-03",
    tenantId: TENANT_ID,
    displayName: "鈴木 拓海",
    role: "staff",
    email: "suzuki@demo.example",
    qualifications: [{ name: "柔道整復師", licenseNumber: "JU-34567", expiresAt: "2029-01-31" }],
    specialties: ["肩こり・腰痛", "スポーツ外傷"],
    color: "#10b981",
    isActive: true,
    monthlyTarget: 700_000,
  },
  {
    id: "staff-04",
    tenantId: TENANT_ID,
    displayName: "田中 葵",
    role: "reception",
    email: "tanaka@demo.example",
    qualifications: [],
    specialties: [],
    color: "#f59e0b",
    isActive: true,
  },
];

// ================================================
// Menus
// ================================================
export const menus: Menu[] = [
  { id: "menu-01", tenantId: TENANT_ID, name: "保険施術（初診）", category: "insurance", price: 1500, durationMinutes: 30, description: "初診時の保険適用施術", sortOrder: 1, isActive: true },
  { id: "menu-02", tenantId: TENANT_ID, name: "保険施術（再診）", category: "insurance", price: 800, durationMinutes: 20, description: "再診時の保険適用施術", sortOrder: 2, isActive: true },
  { id: "menu-03", tenantId: TENANT_ID, name: "保険＋自費ミックス", category: "insurance", price: 2500, durationMinutes: 40, description: "保険施術に自費オプション", sortOrder: 3, isActive: true },
  { id: "menu-04", tenantId: TENANT_ID, name: "骨盤矯正", category: "self_pay", price: 5500, durationMinutes: 40, description: "骨格バランスを整える人気メニュー", sortOrder: 4, isActive: true },
  { id: "menu-05", tenantId: TENANT_ID, name: "産後骨盤ケア", category: "self_pay", price: 6600, durationMinutes: 50, description: "産後の骨盤・姿勢・内臓下垂ケア", sortOrder: 5, isActive: true },
  { id: "menu-06", tenantId: TENANT_ID, name: "鍼灸セッション", category: "self_pay", price: 7700, durationMinutes: 60, description: "東洋医学ベースの全身鍼灸", sortOrder: 6, isActive: true },
  { id: "menu-07", tenantId: TENANT_ID, name: "スポーツコンディショニング", category: "self_pay", price: 8800, durationMinutes: 60, description: "アスリート向けパフォーマンス調整", sortOrder: 7, isActive: true },
  { id: "menu-08", tenantId: TENANT_ID, name: "姿勢サポートインソール", category: "product", price: 12_000, durationMinutes: 15, description: "オーダーメイド物販", sortOrder: 8, isActive: true },
];

// ================================================
// Patients (50名)
// ================================================
const LAST_NAMES = ["山田", "佐藤", "鈴木", "田中", "高橋", "伊藤", "渡辺", "中村", "小林", "加藤", "吉田", "山本", "松本", "井上", "木村", "林", "斎藤", "清水", "森", "池田"];
const LAST_NAMES_KANA = ["ヤマダ", "サトウ", "スズキ", "タナカ", "タカハシ", "イトウ", "ワタナベ", "ナカムラ", "コバヤシ", "カトウ", "ヨシダ", "ヤマモト", "マツモト", "イノウエ", "キムラ", "ハヤシ", "サイトウ", "シミズ", "モリ", "イケダ"];
const FIRST_NAMES_M = ["大輔", "翔", "健", "翼", "陸", "颯太", "蓮", "湊", "悠真", "海斗"];
const FIRST_NAMES_M_KANA = ["ダイスケ", "ショウ", "ケン", "ツバサ", "リク", "ソウタ", "レン", "ミナト", "ユウマ", "カイト"];
const FIRST_NAMES_F = ["優奈", "美咲", "結菜", "葵", "陽菜", "さくら", "美月", "凛", "愛莉", "芽生"];
const FIRST_NAMES_F_KANA = ["ユウナ", "ミサキ", "ユイナ", "アオイ", "ヒナ", "サクラ", "ミヅキ", "リン", "アイリ", "メイ"];
const OCCUPATIONS = ["会社員", "主婦", "自営業", "看護師", "教員", "エンジニア", "学生", "公務員", "介護士", "営業職", "フリーランス", "退職"];
const ALL_TAGS: PatientTag[] = ["VIP", "紹介", "保険", "自費", "要観察"];
const REFERRAL_SOURCES: Patient["referralSource"][] = ["web", "flyer", "sns", "referral", "walk_in", "other"];

export const patients: Patient[] = Array.from({ length: 50 }, (_, i) => {
  const lnIdx = Math.floor(rand() * LAST_NAMES.length);
  const gender: Patient["gender"] = rand() < 0.55 ? "female" : "male";
  const fnIdx = Math.floor(rand() * FIRST_NAMES_M.length);
  const lastName = LAST_NAMES[lnIdx];
  const lastNameKana = LAST_NAMES_KANA[lnIdx];
  const firstName = gender === "male" ? FIRST_NAMES_M[fnIdx] : FIRST_NAMES_F[fnIdx];
  const firstNameKana = gender === "male" ? FIRST_NAMES_M_KANA[fnIdx] : FIRST_NAMES_F_KANA[fnIdx];
  const age = 20 + Math.floor(rand() * 60); // 20〜79
  const birthYear = NOW.getFullYear() - age;
  const birthDate = `${birthYear}-${String(Math.floor(rand() * 12) + 1).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}`;
  const firstVisitDaysAgo = 30 + Math.floor(rand() * 720); // 1ヶ月〜2年前
  const firstVisitDate = dateOnly(addDays(NOW, -firstVisitDaysAgo));
  // 離脱対象は約16%（8名）
  const isDropout = i < 8;
  const lastVisitDaysAgo = isDropout
    ? 60 + Math.floor(rand() * 90)
    : Math.floor(rand() * 45);
  const lastVisitDate = dateOnly(addDays(NOW, -lastVisitDaysAgo));
  const totalVisits = isDropout ? 2 + Math.floor(rand() * 8) : 5 + Math.floor(rand() * 30);
  const totalSpent = totalVisits * (2000 + Math.floor(rand() * 6000));
  const tags = pickMultiple(ALL_TAGS, 2);
  // 60%にLINE連携
  const lineLinked = rand() < 0.6;
  // 家族リンク（10%）
  const hasFamily = rand() < 0.1;
  const preferredStaffId = pick(["staff-01", "staff-02", "staff-03"]);

  return {
    id: `patient-${String(i + 1).padStart(3, "0")}`,
    tenantId: TENANT_ID,
    familyGroupId: hasFamily ? `family-${Math.floor(i / 2) + 1}` : undefined,
    lastName,
    firstName,
    lastNameKana,
    firstNameKana,
    gender,
    birthDate,
    phone: `090-${String(1000 + Math.floor(rand() * 9000))}-${String(1000 + Math.floor(rand() * 9000))}`,
    email: rand() < 0.7 ? `${lastNameKana.toLowerCase()}${i}@example.com` : undefined,
    postalCode: `154-00${String(Math.floor(rand() * 90) + 10)}`,
    address: "東京都世田谷区三軒茶屋" + (Math.floor(rand() * 5) + 1) + "-" + (Math.floor(rand() * 30) + 1),
    occupation: pick(OCCUPATIONS),
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

// ================================================
// Reservations — 過去3ヶ月＋向こう1週間
// ================================================
function generateReservations(): Reservation[] {
  const out: Reservation[] = [];
  const START = addDays(NOW, -90);
  const END = addDays(NOW, 7);
  let cursor = new Date(START);
  let idCounter = 1;
  const treatingStaff = ["staff-01", "staff-02", "staff-03"];

  while (cursor <= END) {
    const dow = cursor.getDay();
    if (dow !== 0) {
      // 月〜土は10〜25件／日
      const dailyCount = 10 + Math.floor(rand() * 16);
      for (let i = 0; i < dailyCount; i++) {
        const hour = 9 + Math.floor(rand() * 10); // 9〜18
        const minute = rand() < 0.5 ? 0 : 30;
        const start = setTime(cursor, hour, minute);
        const menu = pick(menus.filter((m) => m.category !== "product"));
        const staffId = pick(treatingStaff);
        const patient = pick(patients);
        const end = new Date(start.getTime() + menu.durationMinutes * 60 * 1000);
        const isFuture = start > NOW;
        const status: Reservation["status"] = isFuture
          ? "reserved"
          : rand() < 0.05
          ? "cancelled"
          : rand() < 0.03
          ? "no_show"
          : "paid";
        out.push({
          id: `res-${String(idCounter++).padStart(5, "0")}`,
          tenantId: TENANT_ID,
          patientId: patient.id,
          staffId,
          menuId: menu.id,
          startAt: iso(start),
          endAt: iso(end),
          status,
          cancelReason: status === "cancelled" ? pick(["体調不良", "急な予定", "その他"]) : undefined,
          reminderSentAt: !isFuture ? iso(addDays(start, -1)) : undefined,
          source: pick(["manual", "online", "line"] as const),
          notes: undefined,
          createdAt: iso(addDays(start, -(Math.floor(rand() * 14) + 1))),
        });
      }
    }
    cursor = addDays(cursor, 1);
  }
  return out;
}
export const reservations: Reservation[] = generateReservations();

// ================================================
// Payments — 完了（paid）予約に対して作成
// ================================================
export const payments: Payment[] = reservations
  .filter((r) => r.status === "paid")
  .map((r, i) => {
    const menu = menus.find((m) => m.id === r.menuId)!;
    const subtotal = menu.price;
    const tax = 0; // 税込価格とする
    return {
      id: `pay-${String(i + 1).padStart(5, "0")}`,
      tenantId: TENANT_ID,
      reservationId: r.id,
      patientId: r.patientId,
      items: [
        {
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          isInsurance: menu.category === "insurance",
        },
      ],
      subtotal,
      discount: 0,
      tax,
      total: subtotal + tax,
      paymentMethod: pick(["cash", "credit", "qr", "coupon"] as const),
      receiptNumber: `R-${String(i + 1).padStart(6, "0")}`,
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

export const medicalRecords: MedicalRecord[] = patients.flatMap((p) => {
  const count = 2 + Math.floor(rand() * 7); // 2〜8件
  const patientReservations = reservations
    .filter((r) => r.patientId === p.id && r.status === "paid")
    .slice(0, count);
  return patientReservations.map((r, idx) => ({
    id: `rec-${p.id}-${idx}`,
    tenantId: TENANT_ID,
    patientId: p.id,
    reservationId: r.id,
    staffId: r.staffId,
    soapS: pick(SOAP_S),
    soapO: pick(SOAP_O),
    soapA: pick(SOAP_A),
    soapP: pick(SOAP_P),
    painScale: Math.floor(rand() * 10) + 1,
    isFirstVisit: idx === 0,
    recordedAt: r.endAt,
  }));
});

// ================================================
// Coupons — 10件
// ================================================
export const coupons: Coupon[] = Array.from({ length: 10 }, (_, i) => {
  const patient = patients[i * 3];
  const total = 5 + Math.floor(rand() * 6); // 5〜10回
  const used = i < 3 ? total : i < 6 ? Math.floor(total * 0.6) : Math.floor(total * 0.2);
  const daysToExpire = i === 7 ? -20 : i === 6 ? 10 : 60 + Math.floor(rand() * 200);
  const status: Coupon["status"] = daysToExpire < 0 ? "expired" : used >= total ? "fully_used" : "active";
  return {
    id: `coupon-${String(i + 1).padStart(3, "0")}`,
    tenantId: TENANT_ID,
    patientId: patient.id,
    name: pick(["骨盤矯正5回券", "鍼灸4回券", "産後ケア6回券", "スポーツ調整10回券"]),
    totalCount: total,
    usedCount: used,
    price: 25_000 + Math.floor(rand() * 30_000),
    expiresAt: dateOnly(addDays(NOW, daysToExpire)),
    purchasedAt: iso(addDays(NOW, -(180 - daysToExpire))),
    status,
  };
});

// ================================================
// Alerts
// ================================================
export const alerts: AlertItem[] = [
  ...patients.slice(0, 8).map<AlertItem>((p) => ({
    id: `alert-dropout-${p.id}`,
    type: "dropout",
    title: `${p.lastName} ${p.firstName} 様が離脱傾向`,
    detail: `最終来院から ${Math.floor((NOW.getTime() - new Date(p.lastVisitDate).getTime()) / (86400_000))} 日経過`,
    patientId: p.id,
    severity: "warning",
    createdAt: iso(NOW),
  })),
  {
    id: "alert-coupon-01",
    type: "coupon_expiring",
    title: "回数券の期限が10日以内",
    detail: `${patients[18].lastName} ${patients[18].firstName} 様の骨盤矯正5回券（残3回）`,
    patientId: patients[18].id,
    severity: "warning",
    createdAt: iso(NOW),
  },
  {
    id: "alert-target-01",
    type: "target_behind",
    title: "今月の売上目標進捗が遅れ気味",
    detail: "進捗率 62%（目安 75%）— 残り2週間で +¥420,000 必要",
    severity: "info",
    createdAt: iso(NOW),
  },
  {
    id: "alert-birthday-01",
    type: "birthday",
    title: "今月の誕生日患者: 4名",
    detail: "バースデークーポンの送信を検討",
    severity: "info",
    createdAt: iso(NOW),
  },
];

// helper: 集計
export function getMonthlyRevenue(): { month: string; revenue: number }[] {
  const map = new Map<string, number>();
  payments.forEach((p) => {
    const key = p.paidAt.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + p.total);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
}

export function getDailyRevenueLast30(): { date: string; revenue: number; visits: number }[] {
  const out: { date: string; revenue: number; visits: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = dateOnly(addDays(NOW, -i));
    const dayPayments = payments.filter((p) => p.paidAt.slice(0, 10) === d);
    out.push({
      date: d,
      revenue: dayPayments.reduce((sum, p) => sum + p.total, 0),
      visits: dayPayments.length,
    });
  }
  return out;
}

export function getHeatmap(): { day: number; hour: number; count: number }[] {
  const cells: { day: number; hour: number; count: number }[] = [];
  for (let day = 1; day <= 6; day++) {
    for (let hour = 9; hour <= 19; hour++) {
      const c = reservations.filter((r) => {
        const d = new Date(r.startAt);
        return d.getDay() === day && d.getHours() === hour && r.status !== "cancelled";
      }).length;
      cells.push({ day, hour, count: c });
    }
  }
  return cells;
}

export function getPatientFlow(): { month: string; newPatients: number; repeat: number; dropout: number }[] {
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(NOW);
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months.map((m) => {
    const newCount = patients.filter((p) => p.firstVisitDate.slice(0, 7) === m).length;
    const repeatCount = 15 + Math.floor(rand() * 20);
    const dropoutCount = Math.floor(rand() * 5);
    return { month: m, newPatients: newCount || Math.floor(rand() * 6) + 3, repeat: repeatCount, dropout: dropoutCount };
  });
}

export function getTodayStats(): {
  reservations: number;
  arrived: number;
  revenue: number;
  newPatients: number;
} {
  const today = dateOnly(NOW);
  const todayRes = reservations.filter((r) => r.startAt.slice(0, 10) === today);
  const todayPayments = payments.filter((p) => p.paidAt.slice(0, 10) === today);
  return {
    reservations: todayRes.length,
    arrived: todayRes.filter((r) => r.status !== "reserved" && r.status !== "cancelled").length,
    revenue: todayPayments.reduce((s, p) => s + p.total, 0),
    newPatients: 2,
  };
}

export function getKpis() {
  const last30 = getDailyRevenueLast30();
  const totalRevenue30 = last30.reduce((s, d) => s + d.revenue, 0);
  const totalVisits30 = last30.reduce((s, d) => s + d.visits, 0);
  const avgTicket = totalVisits30 === 0 ? 0 : Math.round(totalRevenue30 / totalVisits30);
  const cancelRate = (reservations.filter((r) => r.status === "cancelled").length / reservations.length) * 100;
  const newPatients30 = patients.filter((p) => daysAgo(p.firstVisitDate) <= 30).length;
  const repeatRate = 72;
  const utilization = 68;
  return {
    newPatients30,
    repeatRate,
    cancelRate: Math.round(cancelRate * 10) / 10,
    avgTicket,
    utilization,
    totalRevenue30,
    totalVisits30,
  };
}

function daysAgo(isoDate: string): number {
  return Math.floor((NOW.getTime() - new Date(isoDate).getTime()) / 86400_000);
}

export function getStaffRanking() {
  return staffList
    .filter((s) => s.role !== "reception")
    .map((s) => {
      const sPayments = payments.filter((p) => {
        const res = reservations.find((r) => r.id === p.reservationId);
        return res?.staffId === s.id;
      });
      const revenue = sPayments.reduce((sum, p) => sum + p.total, 0);
      const count = sPayments.length;
      return {
        staff: s,
        revenue,
        treatmentCount: count,
        referralRate: 40 + Math.floor(rand() * 40),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}
