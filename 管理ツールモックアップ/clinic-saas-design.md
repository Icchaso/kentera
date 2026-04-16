# 治療院経営管理SaaS「CureBoard（仮）」設計書

> **作成日**: 2026-04-15
> **フェーズ**: Phase 0 — モックアップ（Claude Code で構築）
> **スタック**: Next.js + Supabase + Tailwind CSS
> **補足**: LINE連携はUI上で存在を示すのみ（実装はPhase 2以降）

---

## 1. プロダクト概要

### 1-1. コンセプト

治療院（整体院・整骨院・鍼灸院・接骨院）の経営に必要な業務を
**ひとつのダッシュボードで完結**させるクラウド型SaaS。

- **治療院側**: ログインして日々の予約・カルテ・売上・スタッフを管理
- **提供側（IDMS）**: 全院のデータを匿名化・集約し、業界ビッグデータとして分析・活用

### 1-2. ユーザー種別

3段階のシンプルな権限構成とする。

| ロール | 説明 |
|---|---|
| **SuperAdmin**（提供側） | 全院横断のデータ閲覧、院のアカウント管理、プラン管理 |
| **GroupOwner**（グループオーナー） | 複数店舗の全データ閲覧・管理。店舗間の比較レポート。スタッフの異動。単店舗の場合はOwnerと同義 |
| **Owner**（店長・院長） | 自店舗の全機能にアクセス。スタッフ管理・売上確認・予約管理・カルテ管理・設定変更 |
| **Staff**（一般スタッフ） | 自分の予約・カルテ・シフトの閲覧・編集。患者の受付・会計処理。店舗全体の売上や他スタッフのデータは見えない |

### 1-3. マルチテナント構造（複数店舗対応）

#### 基本構造

```
IDMS（SuperAdmin）
  ├── ○○整骨院グループ（group_id: uuid）← 複数店舗を持つ法人
  │     ├── ○○整骨院 本院（tenant_id: 001）
  │     │     ├── Owner: 院長A
  │     │     ├── Staff: 施術者1, 施術者2, 受付1
  │     │     └── LINE公式: ○○整骨院 本院
  │     ├── ○○整骨院 駅前院（tenant_id: 002）
  │     │     ├── Owner: 院長B
  │     │     ├── Staff: 施術者3
  │     │     └── LINE公式: ○○整骨院 駅前院
  │     └── GroupOwner: 代表C（全店舗を横断で管理）
  │
  ├── Bはり灸院（tenant_id: 003, group_id: null）← 単店舗
  └── C整体院（tenant_id: 004, group_id: null）← 単店舗
```

全テーブルに `tenant_id` を付与し、RLS（Row Level Security）でデータを完全分離する。
単店舗の院は `group_id = null` で、これまで通りの動作。
複数店舗の場合は `tenant_groups` テーブルで紐付け、GroupOwner が全店舗を横断管理できる。

#### 複数店舗用テーブル

```
tenant_groups
├── id (uuid, PK)
├── name (text)  -- "○○整骨院グループ"
├── owner_user_id (uuid, FK → auth.users)  -- グループ代表
├── created_at / updated_at

tenants（既存テーブルに追加）
├── group_id (uuid, FK → tenant_groups, nullable)
├── branch_name (text, nullable)  -- "本院", "駅前院" 等
├── ...既存カラム
```

#### 管理画面での店舗切り替え UI

GroupOwner がログインすると、ヘッダーに店舗切り替えドロップダウンが表示される。

```
┌──────────────────────────────────────────────┐
│ ○○整骨院グループ  [▼ 本院 / 駅前院 / 全店舗]    │
├──────────────────────────────────────────────┤
│ 「本院」選択   → 本院のデータだけ表示            │
│ 「全店舗」選択 → グループ全体の集計・比較表示      │
└──────────────────────────────────────────────┘
```

単店舗の Owner がログインした場合はドロップダウンは表示されず、従来通りの画面。

### 1-4. ロール別アクセス権限マトリクス

| 機能 | SuperAdmin | GroupOwner | Owner | Staff |
|---|---|---|---|---|
| **全テナント管理** | ✅ | - | - | - |
| **店舗切り替え（グループ内）** | ✅ | ✅ | - | - |
| **店舗間比較レポート** | ✅ | ✅ | - | - |
| **スタッフの店舗異動** | ✅ | ✅ | - | - |
| **ダッシュボード（店舗全体）** | ✅ | ✅ | ✅ | - |
| **予約の閲覧（全スタッフ分）** | ✅ | ✅ | ✅ | - |
| **予約の作成・編集** | ✅ | ✅ | ✅ | 自分のみ |
| **カルテの作成・編集** | - | ✅ | ✅ | 自分のみ |
| **カルテの閲覧** | - | ✅ | ✅ | 自分のみ |
| **患者管理** | - | ✅ | ✅ | 閲覧のみ |
| **会計処理** | - | ✅ | ✅ | ✅ |
| **売上レポート（店舗全体）** | ✅ | ✅ | ✅ | - |
| **売上レポート（個人）** | ✅ | ✅ | ✅ | 自分のみ |
| **スタッフ管理** | ✅ | ✅ | ✅ | - |
| **シフト管理** | - | ✅ | ✅ | 閲覧のみ |
| **メニュー管理** | ✅ | ✅ | ✅ | - |
| **院設定・LINE連携設定** | ✅ | ✅ | ✅ | - |

**ポイント:**
- **Staff** は日常業務（自分の予約確認・カルテ記入・会計処理）に必要な機能のみ
- **Owner** は自店舗の経営管理に必要なすべての機能
- **GroupOwner** は Owner の権限 + 複数店舗の横断管理

#### RLS ポリシーの実装方針

```sql
-- 基本: 自テナントのデータのみ
CREATE POLICY "tenant_isolation" ON [table]
  USING (tenant_id = (
    SELECT tenant_id FROM staff WHERE user_id = auth.uid()
  ));

-- GroupOwner: グループ内の全テナントにアクセス
CREATE POLICY "group_owner_access" ON [table]
  USING (
    tenant_id IN (
      SELECT t.id FROM tenants t
      JOIN tenant_groups g ON t.group_id = g.id
      WHERE g.owner_user_id = auth.uid()
    )
  );

-- Staff: 自分の予約・カルテのみ
CREATE POLICY "staff_own_data" ON reservations
  USING (
    staff_id = (SELECT id FROM staff WHERE user_id = auth.uid())
    OR
    (SELECT role FROM staff WHERE user_id = auth.uid())
      IN ('owner', 'group_owner')
  );

-- SuperAdmin: 全テナントアクセス
CREATE POLICY "superadmin_access" ON [table]
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );
```

---

## 2. 機能一覧と詳細設計

---

### 2-1. 📅 予約管理

治療院の売上はすべて「予約 → 来院」から始まる。最重要モジュール。

#### 機能詳細

| 機能 | 説明 | モック対応 |
|---|---|---|
| カレンダービュー | 日・週・月表示。スタッフ別のレーン表示 | ✅ |
| 予約作成 | 患者選択 → メニュー選択 → スタッフ・日時指定 → 確定 | ✅ |
| 予約ステータス管理 | 予約済 → 来院 → 施術中 → 完了 → 会計済 | ✅ |
| ドラッグ&ドロップ変更 | カレンダー上で予約をドラッグして日時変更 | ✅ |
| 予約キャンセル | キャンセル理由の記録、キャンセル率の集計 | ✅ |
| リマインド通知 | 前日・当日にLINEで自動通知 | UIのみ |
| 再来院促進 | 最終来院から○日経過した患者にLINEで自動送信 | UIのみ |
| ネット予約受付 | 患者が自分で予約できる外部公開ページ | Phase 1 |
| 予約枠設定 | 営業時間・休憩・休診日・スタッフ別稼働枠 | ✅ |
| 同時施術制限 | ベッド数・スタッフ数に応じた上限設定 | ✅ |

#### データモデル（主要カラム）

```
reservations
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── patient_id (uuid, FK)
├── staff_id (uuid, FK)
├── menu_id (uuid, FK)
├── start_at (timestamptz)
├── end_at (timestamptz)
├── status (enum: reserved / arrived / in_treatment / completed / paid / cancelled / no_show)
├── cancel_reason (text, nullable)
├── reminder_sent_at (timestamptz, nullable)
├── source (enum: manual / online / line)
├── notes (text)
├── created_at / updated_at
```

#### ビッグデータ収集ポイント
- 曜日・時間帯別の予約密度 → 業界全体の繁忙パターン
- キャンセル率・ノーショー率 → 地域・業種別の傾向
- リマインド送信 → 来院率の変化（LINE効果測定）
- 平均リードタイム（予約日〜来院日の差）

---

### 2-2. 📋 カルテ管理（電子カルテ）

施術記録を蓄積し、患者の状態推移を可視化する。

#### 機能詳細

| 機能 | 説明 | モック対応 |
|---|---|---|
| カルテ作成 | 施術後にSOAP形式で記録 | ✅ |
| 身体図記入 | 人体図に痛み・症状のある部位をタップでマーク | ✅（簡易版） |
| テンプレート管理 | 院ごとにカルテテンプレートを作成・選択 | ✅ |
| 写真・画像添付 | 患部の写真をアップロード | ✅ |
| 経過記録 | 時系列で症状の推移をグラフ表示（痛みスケール等） | ✅ |
| AI要約（将来） | 過去のカルテからAIが状態サマリーを生成 | UIのみ |
| 同意書管理 | 初回問診票・施術同意書の電子署名 | Phase 1 |
| カルテ検索 | 症状・部位・期間でカルテを横断検索 | ✅ |

#### SOAP形式

```
S（Subjective） : 患者の主訴・自覚症状
O（Objective）  : 検査所見・他覚的所見・バイタル
A（Assessment） : 評価・見立て
P（Plan）       : 施術内容・次回の計画
```

#### データモデル

```
medical_records
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── patient_id (uuid, FK)
├── reservation_id (uuid, FK, nullable)
├── staff_id (uuid, FK)  -- 担当施術者
├── template_id (uuid, FK, nullable)
├── soap_s (text)
├── soap_o (text)
├── soap_a (text)
├── soap_p (text)
├── pain_scale (integer, 0-10)
├── body_marks (jsonb)  -- [{x, y, label, side: "front"|"back"}]
├── attachments (jsonb)  -- [{url, type, note}]
├── is_first_visit (boolean)
├── recorded_at (timestamptz)
├── created_at / updated_at
```

#### ビッグデータ収集ポイント
- 主訴の分布（肩こり・腰痛・膝痛…）→ 症状トレンド
- 年齢×症状のクロス分析
- 痛みスケールの推移パターン → 平均改善回数
- 施術メニュー×症状の組み合わせ効果

---

### 2-3. 👤 患者管理（CRM）

予約・カルテ・売上をつなぐ中心テーブル。

#### 機能詳細

| 機能 | 説明 | モック対応 |
|---|---|---|
| 患者登録 | 基本情報・既往歴・アレルギー | ✅ |
| 患者検索 | 名前・電話番号・カナで即時検索 | ✅ |
| 患者プロフィール | 来院履歴・カルテ一覧・売上合計を一画面で | ✅ |
| タグ管理 | 自由タグ（VIP、紹介、保険、自費 等） | ✅ |
| LINE連携ステータス | LINE友だち登録済か否かの表示 | UIのみ |
| 離脱アラート | 最終来院から○日経過で自動フラグ | ✅ |
| 紹介元追跡 | どの経路で来院したか（紹介・チラシ・Web・SNS） | ✅ |
| 誕生日リスト | 今月の誕生日患者を一覧表示 | ✅ |
| 家族リンク | 家族で通院している患者同士を紐付け | ✅ |

#### データモデル

```
patients
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── family_group_id (uuid, nullable)
├── last_name / first_name (text)
├── last_name_kana / first_name_kana (text)
├── gender (enum: male / female / other)
├── birth_date (date)
├── phone (text)
├── email (text, nullable)
├── postal_code (text, nullable)
├── address (text, nullable)
├── occupation (text, nullable)
├── referral_source (enum: referral / flyer / web / sns / walk_in / other)
├── referral_patient_id (uuid, nullable)  -- 紹介者
├── medical_history (text)  -- 既往歴
├── allergies (text)
├── tags (text[])
├── line_user_id (text, nullable)
├── line_linked_at (timestamptz, nullable)
├── notes (text)
├── first_visit_date (date)
├── last_visit_date (date)  -- 自動更新
├── total_visits (integer)  -- 自動更新
├── is_active (boolean)
├── created_at / updated_at
```

#### ビッグデータ収集ポイント
- 年齢・性別・職業の分布 → 治療院の典型的患者像
- 集客経路の効果比較
- 平均来院回数・LTV
- 離脱タイミングのパターン

---

### 2-4. 💰 売上管理・会計

日次〜月次の売上を可視化し、経営判断の土台を作る。

#### 機能詳細

| 機能 | 説明 | モック対応 |
|---|---|---|
| 会計処理 | 施術完了後にメニュー合計を自動計算、支払い登録 | ✅ |
| 支払い方法 | 現金・クレカ・QR決済・回数券・保険 | ✅ |
| 回数券・プリペイド管理 | 発行・残数管理・有効期限 | ✅ |
| 日次レポート | 本日の売上・来院数・キャンセル数 | ✅ |
| 月次レポート | 月別推移グラフ、前年比、目標対比 | ✅ |
| スタッフ別売上 | 施術者ごとの売上・施術件数 | ✅ |
| メニュー別売上 | どのメニューが稼いでいるかの分析 | ✅ |
| 保険請求管理 | 保険施術の点数・請求ステータス管理 | ✅（簡易版） |
| 売上目標設定 | 月次目標を設定して達成率を表示 | ✅ |
| 経費記録 | 家賃・光熱費・消耗品等の支出を記録 | ✅ |
| 損益サマリー | 売上 − 経費 = 営業利益の簡易P/L | ✅ |

#### データモデル

```
payments
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── reservation_id (uuid, FK)
├── patient_id (uuid, FK)
├── items (jsonb)  -- [{menu_id, name, price, quantity, is_insurance}]
├── subtotal (integer)
├── discount (integer)
├── tax (integer)
├── total (integer)
├── payment_method (enum: cash / credit / qr / coupon / insurance / mixed)
├── payment_details (jsonb)  -- mixed時の内訳
├── coupon_id (uuid, nullable)
├── receipt_number (text)
├── paid_at (timestamptz)
├── created_at / updated_at

coupons（回数券）
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── patient_id (uuid, FK)
├── coupon_type_id (uuid, FK)
├── total_count (integer)
├── used_count (integer)
├── expires_at (date)
├── purchased_at (timestamptz)
├── status (enum: active / expired / fully_used)

expenses
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── category (enum: rent / utilities / supplies / labor / marketing / equipment / other)
├── amount (integer)
├── description (text)
├── date (date)
├── created_at / updated_at

sales_targets
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── year_month (text)  -- "2026-04"
├── target_amount (integer)
├── created_at / updated_at
```

#### ビッグデータ収集ポイント
- 業種別の平均客単価・月商・LTV
- メニュー価格帯の市場分布
- 支払い方法の比率推移
- 回数券購入率と継続率の相関
- 保険 vs 自費の比率トレンド

---

### 2-5. 👥 スタッフ管理

#### 機能詳細

| 機能 | 説明 | モック対応 |
|---|---|---|
| スタッフ登録 | 名前・資格・得意施術・プロフィール写真 | ✅ |
| ロール・権限設定 | Owner / Manager / Staff / Reception の切り替え | ✅ |
| シフト管理 | 月間シフト表の作成・編集 | ✅ |
| 勤怠記録 | 出勤・退勤・休憩の打刻 | ✅ |
| スタッフ別ダッシュボード | 自分の今日の予約・売上・施術件数 | ✅ |
| 指名率 | 患者が特定スタッフを指名した率 | ✅ |
| 目標設定 | スタッフ個人の月次売上・施術数目標 | ✅ |
| 資格管理 | 柔道整復師・鍼灸師等の資格と有効期限 | ✅ |
| 休暇申請 | スタッフが休暇を申請 → Owner承認 | Phase 1 |

#### データモデル

```
staff
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── user_id (uuid, FK → auth.users)
├── display_name (text)
├── role (enum: group_owner / owner / staff)
├── qualifications (jsonb)  -- [{name, license_number, expires_at}]
├── specialties (text[])  -- 得意施術
├── avatar_url (text, nullable)
├── color (text)  -- カレンダー表示色
├── is_active (boolean)
├── created_at / updated_at

shifts
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── staff_id (uuid, FK)
├── date (date)
├── start_time (time)
├── end_time (time)
├── break_start (time, nullable)
├── break_end (time, nullable)
├── status (enum: scheduled / confirmed / absent)
├── created_at / updated_at

attendance
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── staff_id (uuid, FK)
├── date (date)
├── clock_in (timestamptz)
├── clock_out (timestamptz, nullable)
├── break_minutes (integer)
├── overtime_minutes (integer)
├── notes (text)
```

#### ビッグデータ収集ポイント
- 院あたりの平均スタッフ数・構成比
- スタッフ1人あたりの施術件数・売上
- 指名率と売上の相関
- 資格種別の市場分布

---

### 2-6. 🍽️ メニュー管理

#### 機能詳細

| 機能 | 説明 | モック対応 |
|---|---|---|
| メニュー登録 | メニュー名・料金・所要時間・カテゴリ | ✅ |
| カテゴリ分類 | 保険施術 / 自費施術 / 物販 | ✅ |
| コース設定 | 複数メニューを組み合わせたコース | ✅ |
| 表示順設定 | ネット予約ページでの並び順 | ✅ |
| 有効/無効切替 | 季節メニュー等の出し入れ | ✅ |
| 回数券タイプ設定 | メニューと紐づく回数券のテンプレート | ✅ |

#### データモデル

```
menus
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── name (text)
├── category (enum: insurance / self_pay / product)
├── price (integer)
├── duration_minutes (integer)
├── description (text)
├── sort_order (integer)
├── is_active (boolean)
├── created_at / updated_at

coupon_types
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── menu_id (uuid, FK)
├── name (text)  -- "骨盤矯正5回券"
├── count (integer)
├── price (integer)  -- 回数券自体の販売価格
├── valid_days (integer)  -- 有効日数
├── is_active (boolean)
```

---

### 2-7. 📊 ダッシュボード・分析

院長が毎朝見る「経営コックピット」。

#### 機能詳細

| 機能 | 説明 | モック対応 |
|---|---|---|
| 本日のサマリー | 予約数・来院数・売上（リアルタイム） | ✅ |
| KPIカード | 新患数・再来院率・キャンセル率・客単価・稼働率 | ✅ |
| 売上推移グラフ | 日次・週次・月次の推移 | ✅ |
| 患者動態 | 新患 / リピート / 離脱の推移 | ✅ |
| 時間帯ヒートマップ | 曜日×時間帯の予約密度 | ✅ |
| スタッフランキング | 売上・施術数・指名率のランキング | ✅ |
| メニューランキング | 売上・件数でのメニューランキング | ✅ |
| アラート一覧 | 離脱患者・回数券期限切れ間近・目標未達など | ✅ |
| 業界ベンチマーク（将来） | 同規模・同地域の院との比較 | UIのみ |

---

### 2-8. ⚙️ 院設定

| 機能 | 説明 | モック対応 |
|---|---|---|
| 院情報 | 名称・住所・電話・営業時間・休診日 | ✅ |
| ベッド数設定 | 同時施術の上限 | ✅ |
| 予約枠設定 | 最小予約単位（15分/30分/60分） | ✅ |
| LINE連携設定 | LINE公式アカウントの接続（チャネルID等） | UIのみ |
| 通知設定 | リマインド送信タイミング・再来院促進の日数 | UIのみ |
| カルテテンプレート設定 | テンプレートの作成・編集 | ✅ |
| レシート設定 | 院名・住所・ロゴの印字内容 | Phase 1 |

---

### 2-9. 🔐 SuperAdmin（提供側管理画面）

IDMS側で利用する全院横断の管理画面。

| 機能 | 説明 | モック対応 |
|---|---|---|
| テナント一覧 | 全院のリスト・ステータス・プラン | ✅ |
| テナント作成 | 新規院のアカウント発行 | ✅ |
| 利用状況モニタ | 各院のアクティブユーザー数・ログイン頻度 | ✅ |
| ビッグデータダッシュボード | 全院集約の統計（匿名化） | ✅ |
| プラン管理 | Free / Basic / Pro のプラン設定 | ✅ |
| お知らせ配信 | 全院への一斉通知 | Phase 1 |

#### ビッグデータダッシュボード（収集項目まとめ）

```
■ 市場データ
  - 業種別（整体/整骨/鍼灸/接骨）の平均月商・客単価
  - 地域別の集客経路効果
  - 保険 vs 自費の比率推移

■ 患者データ（匿名化）
  - 年齢・性別・職業別の来院パターン
  - 症状トレンド（季節変動含む）
  - 平均来院回数・LTV・離脱タイミング
  - 痛みスケールの改善パターン

■ オペレーションデータ
  - 曜日×時間帯の稼働率
  - スタッフ1人あたりの生産性
  - キャンセル率・ノーショー率
  - リマインド→来院の転換率

■ メニューデータ
  - 人気メニューランキング
  - 価格帯の市場分布
  - 回数券の継続率
  - メニュー×症状の効果相関
```

---

## 3. 技術設計

### 3-1. スタック

| レイヤー | 技術 | 備考 |
|---|---|---|
| フロントエンド | Next.js (App Router) | TypeScript |
| スタイリング | Tailwind CSS + shadcn/ui | |
| バックエンド/DB | Supabase | PostgreSQL + Auth + Storage + RLS |
| 認証 | Supabase Auth | メール/パスワード（将来LINE Login追加） |
| ホスティング | Cloudflare Pages | 本番 |
| プレビュー | Vercel | クライアント確認用のみ |
| 決済（将来） | Stripe | サブスク課金 |
| 自動化（将来） | n8n (Railway) | LINE通知・リマインド・プロビジョニング |
| LINE連携（将来） | LINE Messaging API | リマインド・再来院促進・ネット予約通知 |

### 3-2. ディレクトリ構成（モックアップ時点）

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          -- サイドバー + ヘッダー
│   │   ├── page.tsx            -- ダッシュボード
│   │   ├── reservations/
│   │   │   ├── page.tsx        -- カレンダービュー
│   │   │   └── [id]/page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx        -- 患者一覧
│   │   │   └── [id]/page.tsx   -- 患者プロフィール
│   │   ├── records/
│   │   │   ├── page.tsx        -- カルテ一覧
│   │   │   └── new/page.tsx    -- カルテ作成
│   │   ├── sales/
│   │   │   ├── page.tsx        -- 売上ダッシュボード
│   │   │   ├── payments/page.tsx
│   │   │   └── expenses/page.tsx
│   │   ├── staff/
│   │   │   ├── page.tsx        -- スタッフ一覧
│   │   │   ├── shifts/page.tsx -- シフト表
│   │   │   └── attendance/page.tsx
│   │   ├── menus/page.tsx
│   │   └── settings/page.tsx
│   └── (superadmin)/
│       ├── layout.tsx
│       ├── tenants/page.tsx
│       └── analytics/page.tsx   -- ビッグデータダッシュボード
├── components/
│   ├── ui/                      -- shadcn/ui コンポーネント
│   ├── calendar/                -- 予約カレンダー関連
│   ├── charts/                  -- Recharts ラッパー
│   └── body-map/                -- 身体図マーキング
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts             -- Supabase generated types
│   └── utils.ts
├── hooks/
└── types/
```

### 3-3. Supabase テーブル一覧

```
-- マルチテナント
tenant_groups          -- 複数店舗グループ（法人）
tenants                -- 院情報（group_id で紐付け）
tenant_settings        -- 院ごとの設定値

-- 認証・権限
staff                  -- スタッフ（auth.users と紐付け）

-- 予約
reservations           -- 予約
reservation_slots      -- 予約枠テンプレート

-- 患者
patients               -- 患者マスタ

-- カルテ
medical_records        -- 施術記録
record_templates       -- カルテテンプレート

-- メニュー
menus                  -- 施術メニュー
coupon_types           -- 回数券テンプレート
coupons                -- 発行済み回数券

-- 売上
payments               -- 支払い記録
expenses               -- 経費記録
sales_targets          -- 売上目標

-- スタッフ
shifts                 -- シフト
attendance             -- 勤怠

-- LINE（将来）
line_messages          -- 送信ログ
line_templates         -- メッセージテンプレート

-- ビッグデータ（SuperAdmin用）
analytics_snapshots    -- 日次集計スナップショット（匿名化済み）
```

### 3-4. RLS ポリシー方針

→ **セクション 1-4** のロール別アクセス権限マトリクスおよびRLS実装方針を参照。
  GroupOwner・Owner・Staff 等のロール別制御、グループ横断アクセスを含む。

---

## 4. LINE連携設計（将来実装・UIのみモックで表示）

### 4-1. 基本方針：Lステップ等を使わず自前構築する理由

LINE連携にあたり、Lステップ・L Message等の既存ツールを利用するか、
LINE Messaging API を直接利用して自前構築するかを検討した結果、
**自前構築を採用する。**

| 観点 | Lステップ等を利用 | 自前構築（採用） |
|---|---|---|
| データの所在 | Lステップ側のサーバーに保持される | Supabase（自社DB）に直接保存 |
| 管理画面との連携 | API制限あり。リアルタイム同期が困難 | 同一DBなので即座に反映 |
| 治療院側の追加コスト | SaaS月額 + Lステップ月額（二重課金） | SaaS月額に含めて提供可能 |
| カスタマイズ性 | フォーム・配信ロジックがツール側の制約内 | 完全自由 |
| ビッグデータ収集 | 外部ツールからのデータ取得が必要 | 全データが最初からSupabaseに存在 |

**結論**: 患者データをCureBoardに一元化し、管理画面とのリアルタイム連携・
ビッグデータ収集を実現するために、LINE Messaging API + LIFF で自前構築する。

### 4-2. LINE公式アカウントの運用構造

各治療院が**個別のLINE公式アカウント**を持つ構成とする。
ただし、LINE Developersのプロバイダーは**IDMSが一括管理**する。

```
IDMS（LINE Developersプロバイダー）
  ├── チャネル: A整骨院のLINE公式アカウント
  │     └── Webhook → CureBoard API (共通エンドポイント)
  ├── チャネル: Bはり灸院のLINE公式アカウント
  │     └── Webhook → CureBoard API (共通エンドポイント)
  └── チャネル: C整体院のLINE公式アカウント
        └── Webhook → CureBoard API (共通エンドポイント)
```

**この構成のメリット:**
- 患者から見ると「○○整骨院」の公式アカウントに見える（自然な体験）
- LINE通信費は各院のアカウント単位で管理される（コスト分離）
- 開発側はWebhookエンドポイントを1つ管理するだけ
- IDMSがプロバイダー権限を持つので、全院の設定を一元管理可能
- 治療院側はLINE Developersの操作を一切する必要がない

#### テナント別LINE設定テーブル

```
tenant_line_configs
├── id (uuid, PK)
├── tenant_id (uuid, FK → tenants)
├── line_channel_id (text)
├── line_channel_secret (text, encrypted)
├── line_channel_access_token (text, encrypted)
├── liff_id (text)
├── webhook_verified (boolean)
├── rich_menu_id (text, nullable)
├── greeting_message (text)  -- 友だち追加時のメッセージ
├── reminder_hours_before (integer, default: 24)  -- リマインド送信タイミング
├── recall_days (integer, default: 30)  -- 再来院促進の日数
├── is_active (boolean)
├── created_at / updated_at
```

### 4-3. 患者側の体験フロー

#### 初回登録フロー

```
1. 患者が治療院の店頭QRコードを読み取り
2. LINE公式アカウント（○○整骨院）を友だち追加
3. 自動で挨拶メッセージ + リッチメニュー表示
4. リッチメニューから「初回登録」をタップ
5. LIFF（LINE内ブラウザ）で問診フォームが開く
   - 名前・フリガナ・生年月日・性別
   - 電話番号・住所
   - 既往歴・アレルギー
   - 来院のきっかけ（紹介/チラシ/Web/SNS等）
6. 送信 → Supabase の patients テーブルに保存
   - line_user_id が自動で紐付く
   - tenant_id はチャネルIDから自動判別
7. 治療院の管理画面に即座に患者情報が表示される
```

#### 予約〜来院フロー

```
1. 患者がリッチメニューから「予約」をタップ
2. LIFF画面で空き状況を確認 → 日時・メニュー・スタッフを選択
3. 予約確定 → LINEにメッセージで予約確認通知
4. 管理画面のカレンダーに即座に予約が反映
5. 前日（設定可能）に自動リマインドメッセージ送信
6. 来院・施術・会計完了
7. 次回予約の案内メッセージ送信
```

#### 再来院促進フロー

```
1. n8n が毎日 patients.last_visit_date をチェック
2. 設定日数（デフォルト30日）を超えた患者を抽出
3. 各院のLINE公式アカウント経由でメッセージ送信
   「○○さん、最後のご来院から1ヶ月が経ちました。
    お体の調子はいかがですか？ご予約はこちらから▼」
4. 送信ログを line_messages テーブルに記録
```

#### 患者がLINEから確認できる情報

```
リッチメニュー
  ├── 予約する（LIFF → 予約画面）
  ├── 予約確認（LIFF → 自分の予約一覧・変更・キャンセル）
  ├── 回数券残数（LIFF → 保有回数券と残り回数）
  ├── 次回のご案内（直近の予約情報をメッセージで返答）
  └── お問い合わせ（テキストチャットで院に問い合わせ）
```

### 4-4. Webhook の仕組み（マルチテナント対応）

```
患者がLINEで操作
  ↓
LINE Platform → Webhook POST
  ↓
CureBoard API（共通エンドポイント: /api/line/webhook）
  ↓ リクエストヘッダーの署名を検証
  ↓ channel_id からテナントを特定
  ↓
イベント種別で分岐:
  ├── follow（友だち追加）→ 患者レコード作成 or LINE紐付け
  ├── message（テキスト）→ 自動応答 or 院への通知
  ├── postback（ボタン操作）→ 予約確認・キャンセル等の処理
  └── unfollow（ブロック）→ line_user_id を無効化
  ↓
Supabase に保存 → 管理画面にリアルタイム反映
```

### 4-5. オンボーディングフロー（治療院の導入手順）

治療院側の作業を最小限にする設計。

```
Step 1: 治療院がCureBoardに申し込み（Stripe決済）
Step 2: IDMS側で自動 or 手動で以下を実行
  a. Supabase にテナント作成
  b. LINE Developers でチャネル作成
  c. LINE公式アカウントの基本設定（名前・アイコン・挨拶文）
  d. LIFF アプリ登録
  e. Webhook URL 設定
  f. リッチメニュー作成・設定
  g. tenant_line_configs に接続情報を保存
Step 3: 治療院に以下を納品
  - LINE友だち追加用のQRコード / URL
  - 管理画面のログイン情報
  - 簡易マニュアル
Step 4: 治療院は店頭にQRコードを掲示するだけ
```

**将来的な自動化目標:**
Stripe決済完了 → n8n が自動で Step 2 の a〜g を実行 → 治療院に自動メール通知

### 4-6. スケーラビリティ

| 規模 | データ量 | 対応 |
|---|---|---|
| 10院 × 200患者 | 2,000人 | Supabase Free/Pro で十分 |
| 50院 × 300患者 | 15,000人 | Supabase Pro（$25/月）で余裕 |
| 100院 × 500患者 | 50,000人 | インデックス適切なら問題なし |
| 500院 × 500患者 | 250,000人 | Supabase Team への移行を検討 |

PostgreSQL は数百万行でもパフォーマンスに問題なし。
ボトルネックになりうるのはDBの行数ではなく以下の2点:

1. **LINE Messaging API の通数制限**: 各院のアカウント単位なので分散される
2. **同時アクセス**: Supabase Pro のコネクション数で十分対応可能

#### 推奨インデックス

```sql
CREATE INDEX idx_patients_tenant_search
  ON patients(tenant_id, last_name_kana);
CREATE INDEX idx_patients_line_user
  ON patients(line_user_id) WHERE line_user_id IS NOT NULL;
CREATE INDEX idx_reservations_tenant_date
  ON reservations(tenant_id, start_at);
CREATE INDEX idx_payments_tenant_date
  ON payments(tenant_id, paid_at);
CREATE INDEX idx_tenant_line_channel
  ON tenant_line_configs(line_channel_id);
```

### 4-7. LINE通数とSaaS料金の関係

LINE公式アカウントのメッセージ通数はアカウント単位で課金される。
SaaS料金にLINE通数を含める形で設計する。

| SaaSプラン | LINE通数目安 | LINE側プラン | SaaS月額に含む |
|---|---|---|---|
| Free | LINE連携なし | - | - |
| Basic（¥9,800） | 〜5,000通/月 | ライトプラン | ✅ |
| Pro（¥19,800） | 〜30,000通/月 | スタンダードプラン | ✅ |
| Enterprise | 要相談 | 要相談 | ✅ |

### 4-8. モックでの表現（Phase 0）

LINE連携は実装しないが、UIで「将来こうなる」ことを伝える。

- 予約詳細画面に「LINEリマインド送信済 ✓」のバッジ
- 患者プロフィールに「LINE連携: 済/未」のステータス
- 設定画面に「LINE連携設定」セクション（入力フォームはあるが保存しない）
- ダッシュボードに「LINE経由予約: 24件」のようなダミーKPI
- 患者登録画面に「LINEから登録された患者」のラベル表示

---

## 5. モックアップ実装方針

### 5-1. Phase 0 の目標

**「治療院の院長にデモして、これ欲しい！と言ってもらう」**

- すべてダミーデータで動作する
- Supabase は接続するが、初期データを seed で投入
- LINE連携はUIだけ。ボタンを押すと「この機能は近日公開です」のトースト
- レスポンシブは後回し（PC表示のみでOK）

### 5-2. ダミーデータ seed

```
- テナント: 1院（デモ整骨院）
- スタッフ: 4名（院長、施術者2名、受付1名）
- 患者: 50名（年齢・性別バラつきあり）
- 予約: 過去3ヶ月分 + 向こう1週間分
- カルテ: 過去3ヶ月分（各患者2〜8件）
- 売上: 過去3ヶ月分
- メニュー: 8種類（保険3、自費4、物販1）
- 回数券: 10件（アクティブ6、使用済3、期限切れ1）
```

### 5-3. Claude Code での作業順序

```
Step 1: プロジェクト初期化
  → Next.js + Tailwind + shadcn/ui セットアップ
  → Supabase プロジェクト作成 & テーブル定義

Step 2: 認証 + レイアウト
  → ログイン画面
  → ダッシュボードレイアウト（サイドバー + ヘッダー）

Step 3: 患者管理
  → 一覧 + 検索 + 登録 + プロフィール画面

Step 4: メニュー管理
  → CRUD画面

Step 5: 予約管理
  → カレンダービュー + 予約作成モーダル

Step 6: カルテ管理
  → SOAP入力フォーム + 身体図 + 一覧

Step 7: 売上管理
  → 会計処理 + 日次/月次レポート + グラフ

Step 8: スタッフ管理
  → 一覧 + シフト表 + 勤怠

Step 9: ダッシュボード
  → KPIカード + グラフ + アラート

Step 10: SuperAdmin画面
  → テナント一覧 + ビッグデータダッシュボード

Step 11: seed データ投入 & デモ準備
```

---

## 6. 料金プラン設計（案）

| プラン | 月額（税別） | 対象 | 主な制限 |
|---|---|---|---|
| **Free** | ¥0 | お試し | スタッフ2名まで、患者100名まで、LINE連携なし、1店舗のみ |
| **Basic** | ¥9,800 | 小規模院 | スタッフ5名、患者無制限、LINE連携あり（〜5,000通/月）、1店舗 |
| **Pro** | ¥19,800 | 中規模院 | スタッフ無制限、全機能、LINE（〜30,000通/月）、1店舗 |
| **Enterprise** | 要相談 | グループ院 | 複数店舗管理、GroupOwnerアクセス、店舗間比較レポート、API連携、専用サポート |

---

## 7. 将来拡張ロードマップ

| Phase | 内容 | 目安 |
|---|---|---|
| **Phase 0** | モックアップ（本設計書の範囲） | 2週間 |
| **Phase 1** | 本番データ運用、Stripe課金、ネット予約 | +1ヶ月 |
| **Phase 2** | LINE連携（リマインド・再来院促進） | +2週間 |
| **Phase 3** | AI機能（カルテ要約・問診AI・需要予測） | +1ヶ月 |
| **Phase 4** | ビッグデータ分析・業界ベンチマーク提供 | 継続 |
| **Phase 5** | ネイティブアプリ（患者向けアプリ） | 要検討 |
