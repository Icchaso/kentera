// 納品自動化 — Finder / Google Drive / 台本サイト
import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, basename } from 'path';
import { execSync } from 'child_process';

// 設定（ローカルMac環境用パス）
const FINDER_BASE = '/Users/itsukiiwai/プロジェクト/KENTERA/治療家スライド完成版';
const SCRIPTS_REPO = process.env.KENTERA_SCRIPTS_REPO || '~/kentera-scripts';

/**
 * Finderフォルダに納品
 */
export function deliverToFinder(opts) {
  const { id, title, pptxPath, pdfPath, scriptMdPath, slideJpgs } = opts;
  const folder = `${id}_${title}`;
  const dest = resolve(FINDER_BASE, folder);

  console.log(`\n=== Finder 納品 ===`);
  console.log(`宛先: ${dest}`);

  if (!existsSync(FINDER_BASE)) {
    console.log(`⚠️  Finderベースパスが存在しません: ${FINDER_BASE}`);
    console.log('   ローカルMac環境で実行してください。');
    return false;
  }

  mkdirSync(resolve(dest, 'slides'), { recursive: true });

  if (existsSync(pptxPath)) cpSync(pptxPath, resolve(dest, basename(pptxPath)));
  if (pdfPath && existsSync(pdfPath)) cpSync(pdfPath, resolve(dest, basename(pdfPath)));
  if (scriptMdPath && existsSync(scriptMdPath)) cpSync(scriptMdPath, resolve(dest, basename(scriptMdPath)));

  for (const jpg of (slideJpgs || [])) {
    if (existsSync(jpg)) {
      const destName = basename(jpg);
      cpSync(jpg, resolve(dest, 'slides', destName));
    }
  }

  console.log('✅ Finder 納品完了');
  return true;
}

/**
 * 台本マークダウンを生成
 */
export function generateScriptMd(parsed, outputPath) {
  const today = new Date().toISOString().split('T')[0];

  let md = `---
tags:
  - KENTERA
  - 動画台本
created: ${today}
---

# ${parsed.docId}：${parsed.docTitle}

## 読み上げ台本

`;

  for (const slide of parsed.slides) {
    md += `### 【スライド${slide.number}】${slide.title}\n\n`;
    md += `${slide.narration}\n\n---\n\n`;
  }

  writeFileSync(outputPath, md, 'utf-8');
  console.log(`台本MD生成: ${outputPath}`);
  return outputPath;
}

/**
 * presentations.json を更新（既存データに追加 or 該当IDを上書き）
 */
export function updatePresentationsJson(jsonPath, newEntry) {
  let data = [];
  if (existsSync(jsonPath)) {
    data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  }

  // 既存IDがあれば上書き、なければ追加
  const idx = data.findIndex(e => e.id === newEntry.id);
  if (idx >= 0) {
    data[idx] = newEntry;
    console.log(`presentations.json: ${newEntry.id} を上書き`);
  } else {
    data.push(newEntry);
    console.log(`presentations.json: ${newEntry.id} を追加`);
  }

  writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  return jsonPath;
}

/**
 * 台本サイト（kentera-scripts）に納品
 */
export function deliverToScriptSite(opts) {
  const { id, title, parsed, slideJpgs } = opts;
  const repo = resolve(SCRIPTS_REPO.replace('~', process.env.HOME || '/root'));

  console.log(`\n=== 台本サイト納品 ===`);
  console.log(`リポジトリ: ${repo}`);

  if (!existsSync(repo)) {
    console.log(`⚠️  kentera-scripts リポジトリが見つかりません: ${repo}`);
    console.log('   KENTERA_SCRIPTS_REPO 環境変数で指定してください。');
    return false;
  }

  // スライド画像をコピー
  const slidesDir = resolve(repo, 'public/slides', id);
  mkdirSync(slidesDir, { recursive: true });

  for (const jpg of (slideJpgs || [])) {
    if (existsSync(jpg)) {
      cpSync(jpg, resolve(slidesDir, basename(jpg)));
    }
  }

  // presentations.json を更新
  const jsonPath = resolve(repo, 'src/presentations.json');
  const today = new Date().toISOString().split('T')[0];

  const entry = {
    id,
    title,
    subtitle: parsed.slides[0]?.title || '',
    created: today,
    slides: parsed.slides.map((s, i) => ({
      number: i + 1,
      title: s.title,
      image: `slides/${id}/slide-${String(i + 1).padStart(2, '0')}.jpg`,
      script: s.narration,
    })),
  };

  // タイトル・締めスライドも含める場合はここで追加
  updatePresentationsJson(jsonPath, entry);

  console.log('✅ 台本サイト納品完了');
  return true;
}

/**
 * git push（台本サイト用）
 */
export function pushScriptSite(id, title) {
  const repo = resolve(SCRIPTS_REPO.replace('~', process.env.HOME || '/root'));
  if (!existsSync(repo)) return false;

  try {
    execSync(`cd "${repo}" && git add . && git commit -m "Add/Update ${id} ${title}" && git push origin main`, {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: 'inherit',
    });
    console.log('✅ git push 完了（台本サイト自動デプロイ開始）');
    return true;
  } catch (err) {
    console.error('git push 失敗:', err.message);
    return false;
  }
}
