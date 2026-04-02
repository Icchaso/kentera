# KENTERA スライド生成 & 台本サイト運用システム

## 全体フロー

```
読み上げ台本を受け取る
  ↓
要点を抽出 → スライドの図解設計
  ↓
PptxGenJS でスライド生成 → QA → 修正
  ↓
3箇所に納品:
  ① Finder フォルダ（PPTX / PDF / 台本MD / スライド画像）
  ② Google Drive（PPTX → Googleスライドで編集可能）
  ③ 台本サイト更新（presentations.json + スライド画像 → git push → 自動デプロイ）
```

---

## 入力形式

### パターンA: 読み上げ台本のみ（推奨・通常運用）

```
【スライド1】
こんにちは、廣瀬です。今日は……（話し言葉のフル台本）

【スライド2】
では、なぜ多くの院で……
```

→ Claude Code が各スライドの要点を抽出し、図解・レイアウトを自動設計する。

### パターンB: 読み上げ台本 + スライド用台本（図解を指定したい場合）

読み上げ台本に加えて、スライド構成の指示がある場合はそちらを優先する:

```
## 3. 結論：4つのステップ
- ① 教育 → ② 測定 → ③ バックエンド成約 → ④ LTV向上
- ポイントは「いきなり提案しない」
画像：4ステップの矢印フロー図
```

→ 「画像：」行のキーワードに合わせたレイアウトパターンを選択する。

### 要点抽出のルール（パターンAの場合）

読み上げ台本から以下を抽出してスライド要素にする:
- **キーワード・固有名詞**: 「KENTERA」「オリゴスキャン」「60〜70%」等 → 図解の見出し・統計表示に
- **対比構造**: 「従来は〜、KENTERAモデルでは〜」→ VS対比レイアウト
- **ステップ・順番**: 「教育→測定→成約→LTV」→ 横並びステップカード
- **比喩・例え**: 「水やりで例えると〜」→ 図解のモチーフに活用
- **数値データ**: 「60〜70%」→ 統計ハイライト

**スライドには要点のみ載せる。台本の文章をそのまま載せない。**

---

## 出力ファイル（台本1本あたり）

| ファイル | 用途 |
|---------|------|
| `{ID}_{タイトル}.pptx` | Googleスライドで編集用 |
| `{ID}_{タイトル}.pdf` | 閲覧・共有用 |
| `{ID}_{タイトル}_台本.md` | 読み上げ台本（フルテキスト） |
| `slides/slide-1.jpg 〜 slide-N.jpg` | 台本サイト表示用スライド画像 |

---

## 納品先

### ① Finder

```
/Users/itsukiiwai/プロジェクト/KENTERA/治療家スライド完成版/
  └── T01_KENTERAモデルの全体像/
      ├── T01_KENTERAモデルの全体像.pptx
      ├── T01_KENTERAモデルの全体像.pdf
      ├── T01_KENTERAモデルの全体像_台本.md
      └── slides/
          ├── slide-1.jpg
          ├── slide-2.jpg
          └── ...
```

### ② Google Drive

`KENTERA/治療家スライド完成版/` フォルダにPPTXをアップロード。
Googleスライドで直接開いて編集可能な状態にする。

### ③ 台本サイト（GitHub → Cloudflare Pages）

リポジトリ: `Icchaso/kentera-scripts`

```
kentera-scripts/
  ├── public/
  │   └── slides/
  │       ├── T01/
  │       │   ├── slide-1.jpg
  │       │   ├── slide-2.jpg
  │       │   └── ...
  │       └── T02/
  │           └── ...
  ├── src/
  │   ├── App.jsx          ← メインアプリ
  │   └── presentations.json ← 全台本のデータ
  └── package.json
```

**presentations.json の構造:**

```json
[
  {
    "id": "T01",
    "title": "KENTERAモデルの全体像",
    "subtitle": "売り込みゼロで院の数字が変わる仕組み",
    "created": "2026-04-02",
    "slides": [
      {
        "number": 1,
        "title": "タイトル",
        "image": "slides/T01/slide-1.jpg",
        "script": "こんにちは、廣瀬です。今日は……（フル台本テキスト）"
      }
    ]
  }
]
```

---

## スクリプト実行方法

### スライド生成

```bash
cd kentera
node scripts/generate-slides.mjs <台本MDファイルパス>
```

例:
```bash
node scripts/generate-slides.mjs 02_toB_治療家向け/FANTS/T_モデル理解/T01_モデル全体像_撮影台本.md
```

### QA

```bash
# コンテンツQA
python3 -m markitdown scripts/output/T01_KENTERAモデルの全体像.pptx

# PDF変換
python3 scripts/office/soffice.py scripts/output/T01_KENTERAモデルの全体像.pptx scripts/output/

# JPEG書き出し
pdftoppm -jpeg -r 150 scripts/output/T01_KENTERAモデルの全体像.pdf scripts/output/slide
```

---

## Googleスライド互換ルール

```
フォント : Arial のみ（Bold / Regular）
```

- グラデーション塗り禁止
- 影は `blur: 4, offset: 2` 程度の控えめな値
- 透過矩形は装飾用途のみ
- アイコンは PNG（base64）埋め込み
- フォントサイズ・位置はインチ単位で明示指定

---

## デザインシステム

### カラーパレット

```
アクセント（Primary）   : 28AE6A
アクセント薄め          : E8F5EE
アクセント濃いめ        : 1E8A52
ダーク背景              : 1A1A2E
白                      : FFFFFF
オフホワイト            : F8F9FA
テキスト黒              : 2D2D2D
テキストグレー          : 6B7280
ライトボーダー          : E5E7EB
赤系（課題用）          : DC2626 / FEE2E2 / FECACA
ステップ色段階          : 28AE6A → 1E8A52 → 0F766E → 065F46
```

### タイポグラフィ

```
スライドタイトル    : Arial  28-32pt  Bold   2D2D2D
STEPバッジ          : Arial  11-12pt  Bold   FFFFFF
セクションヘッダー  : Arial  18-20pt  Bold   2D2D2D
本文                : Arial  12-14pt  Regular 2D2D2D
キャプション        : Arial  10-12pt  Regular 6B7280
数値・統計          : Arial  44-48pt  Bold   28AE6A
```

### スライド構成

**全体**: ダーク（タイトル）→ 白系（コンテンツ）→ ダーク（締め）

**タイトルスライド**: 背景 `1A1A2E`、左に緑縦帯、透過装飾矩形、白38pt + 緑18pt
**コンテンツスライド**: 白背景、STEPバッジ付き、図解必須、隣接で同レイアウト禁止
**締めスライド**: 背景 `1A1A2E`、ミニフロー + メインメッセージ + 次回予告

### レイアウトパターン（ローテーション用）

| パターン | 構成 | 向いている内容 |
|---------|------|-------------|
| **A. 収束フロー** | 複数課題 → 原因 → 解決策 | 問題提起 |
| **B. VS対比** | 赤系（従来）vs 緑系（新） | 比較 |
| **C. 横並びステップ** | カード3-4枚 + 矢印 | プロセス全体像 |
| **D. BEFORE→AFTER** | 赤BOX → 矢印 → 緑BOX | 機能説明 |
| **E. 統計＋ポイント** | 大きな数値 + 番号付きポイント | データ訴求 |
| **F. ファネル型** | 入力バー → 成果カード3枚 | 成果説明 |
| **G. 左パネル＋右カード** | ダーク左1/3 + 番号カード右2/3 | アクション |

### コード厳守ルール

```
✅ カラーコード # なし       : "28AE6A"
✅ オプション毎回新規生成    : cardShadow() ファクトリ関数
✅ bullet: true で箇条書き   : Unicode「•」禁止
✅ breakLine: true で複数行
✅ RECTANGLE を使う          : ROUNDED_RECTANGLE + アクセント枠禁止
✅ shadow.offset 非負値のみ
✅ shadow.opacity 0.0-1.0    : 8桁hex禁止
✅ マージン 0.5" 以上
✅ フォント Arial のみ
```

---

## QA手順（省略不可）

### コンテンツQA

```bash
python3 -m markitdown output.pptx
```

### ビジュアルQA（サブエージェント必須）

```bash
python3 scripts/office/soffice.py output.pptx
rm -f slide-*.jpg
pdftoppm -jpeg -r 150 output.pdf slide
ls -1 "$PWD"/slide-*.jpg
```

**修正→再変換→再検査を最低1サイクル。0件でも1回はサブエージェントに通す。**

---

## チェックリスト（台本1本あたり）

- [ ] 全スライドに図解・アイコン等の視覚要素がある
- [ ] 読み上げ台本の要点がスライドに正しく反映されている
- [ ] アクセントカラー `28AE6A` が一貫している
- [ ] 隣接スライドでレイアウトが異なる
- [ ] フォントは Arial のみ
- [ ] ビジュアルQA 最低1サイクル実施済み
- [ ] Finder `治療家スライド完成版/{ID}_{タイトル}/` に4種配置済み
- [ ] Google Drive にPPTXアップ済み
- [ ] 台本サイトの presentations.json + 画像更新 → git push 済み
