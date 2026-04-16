import { staffList, tenants } from "./seed";

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  body: string;
  sentAt: string; // ISO
  mentions?: string[];
  pinned?: boolean;
  kind?: "text" | "system";
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon: "hash" | "lock" | "megaphone" | "book";
  tenantId?: string; // 指定なしはグループ全体
  memberIds: string[];
  isPrivate?: boolean;
}

const TODAY = new Date("2026-04-16T09:00:00+09:00");
function iso(offsetMinutes: number): string {
  return new Date(TODAY.getTime() - offsetMinutes * 60_000).toISOString();
}

const honinStaff = staffList.filter((s) => s.tenantId === tenants[0].id).map((s) => s.id);
const ekimaeStaff = staffList.filter((s) => s.tenantId === tenants[1].id).map((s) => s.id);
const yokohamaStaff = staffList.filter((s) => s.tenantId === tenants[2].id).map((s) => s.id);
const allStaffIds = staffList.map((s) => s.id);

export const chatChannels: ChatChannel[] = [
  {
    id: "ch-group-general",
    name: "グループ全体",
    description: "全店舗スタッフの共有連絡",
    icon: "megaphone",
    memberIds: allStaffIds,
  },
  {
    id: "ch-group-sharing",
    name: "ナレッジ共有",
    description: "施術ノウハウ・症例共有",
    icon: "book",
    memberIds: allStaffIds,
  },
  {
    id: "ch-honin",
    name: "本院",
    description: "本院スタッフの連絡用",
    icon: "hash",
    tenantId: tenants[0].id,
    memberIds: honinStaff,
  },
  {
    id: "ch-ekimae",
    name: "駅前院",
    description: "駅前院スタッフの連絡用",
    icon: "hash",
    tenantId: tenants[1].id,
    memberIds: ekimaeStaff,
  },
  {
    id: "ch-yokohama",
    name: "横浜院",
    description: "横浜院スタッフの連絡用",
    icon: "hash",
    tenantId: tenants[2].id,
    memberIds: yokohamaStaff,
  },
  {
    id: "ch-owners",
    name: "院長・代表会議",
    description: "GroupOwner + Ownerのみ",
    icon: "lock",
    memberIds: staffList.filter((s) => s.role === "group_owner" || s.role === "owner").map((s) => s.id),
    isPrivate: true,
  },
];

export const chatMessages: ChatMessage[] = [
  // グループ全体
  {
    id: "m-001",
    channelId: "ch-group-general",
    senderId: "staff-00",
    body: "おはようございます。今月は横浜院の新患獲得がプラン超えで好調です。皆さん引き続きよろしくお願いします。",
    sentAt: iso(180),
    pinned: true,
  },
  {
    id: "m-002",
    channelId: "ch-group-general",
    senderId: "staff-01",
    body: "本院、昨日のLINE経由予約が 8件 でした。リッチメニュー効いてますね。",
    sentAt: iso(150),
  },
  {
    id: "m-003",
    channelId: "ch-group-general",
    senderId: "staff-05",
    body: "駅前院も再来院促進メッセージの反応がいいです。30日離脱目前の方が来院されました。",
    sentAt: iso(120),
  },
  {
    id: "m-004",
    channelId: "ch-group-general",
    senderId: "staff-08",
    body: "横浜院、GW期間の営業時間設定、そろそろ決めたほうが良さそうです。院長会議で議題にできますか？",
    sentAt: iso(60),
    mentions: ["staff-00"],
  },
  // ナレッジ共有
  {
    id: "m-010",
    channelId: "ch-group-sharing",
    senderId: "staff-02",
    body: "産後骨盤ケア、6回コースで痛みスケールが平均 -4 の改善データ出ました。近々スライドにまとめます。",
    sentAt: iso(300),
  },
  {
    id: "m-011",
    channelId: "ch-group-sharing",
    senderId: "staff-06",
    body: "助かります！駅前院でも産後骨盤の問い合わせ増えてるので、ぜひ共有お願いします 🙏",
    sentAt: iso(250),
  },
  {
    id: "m-012",
    channelId: "ch-group-sharing",
    senderId: "staff-09",
    body: "スポーツ外傷のテーピング手技、テンプレ化したいです。新人教育にも使いたいので。",
    sentAt: iso(90),
  },
  // 本院
  {
    id: "m-020",
    channelId: "ch-honin",
    senderId: "staff-04",
    body: "本日の予約、18:00の田中さんが30分遅れる連絡入りました。19:00のスロット繰り上げ可能ですか？",
    sentAt: iso(45),
  },
  {
    id: "m-021",
    channelId: "ch-honin",
    senderId: "staff-03",
    body: "OKです、こちらで対応します。",
    sentAt: iso(40),
  },
  {
    id: "m-022",
    channelId: "ch-honin",
    senderId: "staff-01",
    body: "ありがとう。田中さん、VIP枠なのでフォロー手厚めに。",
    sentAt: iso(35),
  },
  // 駅前院
  {
    id: "m-030",
    channelId: "ch-ekimae",
    senderId: "staff-07",
    body: "新患の山本さん、明日10時で入れました。問診票の記入はLIFFで完了済みです。",
    sentAt: iso(180),
  },
  {
    id: "m-031",
    channelId: "ch-ekimae",
    senderId: "staff-05",
    body: "確認しました。症状は腰痛でしたね、対応お願いします。",
    sentAt: iso(170),
  },
  // 横浜院
  {
    id: "m-040",
    channelId: "ch-yokohama",
    senderId: "staff-10",
    body: "消耗品（テーピング）の在庫が切れそうです。発注お願いします。",
    sentAt: iso(200),
  },
  {
    id: "m-041",
    channelId: "ch-yokohama",
    senderId: "staff-08",
    body: "了解、本日中に発注します。ありがとう。",
    sentAt: iso(190),
  },
  // 院長・代表会議
  {
    id: "m-050",
    channelId: "ch-owners",
    senderId: "staff-00",
    body: "来週の院長会議、議題追加あれば木曜までに連絡ください。",
    sentAt: iso(480),
    pinned: true,
  },
  {
    id: "m-051",
    channelId: "ch-owners",
    senderId: "staff-01",
    body: "本院の副院長候補の件、相談したいです。",
    sentAt: iso(420),
  },
  {
    id: "m-052",
    channelId: "ch-owners",
    senderId: "staff-08",
    body: "横浜院、物販メニュー展開の検討を議題にお願いします。",
    sentAt: iso(360),
  },
];
