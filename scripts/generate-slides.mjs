#!/usr/bin/env node
// KENTERA スライド生成メインスクリプト
// Usage: node scripts/generate-slides.mjs <台本MDファイルパス>

import { resolve, dirname, basename } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { parseScript } from './lib/parser.mjs';
import { buildPptx } from './lib/slide-builder.mjs';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/generate-slides.mjs <台本MDファイルパス>');
  console.error('例: node scripts/generate-slides.mjs 02_toB_治療家向け/FANTS/T_モデル理解/T01_モデル全体像_撮影台本.md');
  process.exit(1);
}

const inputPath = resolve(args[0]);
if (!existsSync(inputPath)) {
  console.error(`ファイルが見つかりません: ${inputPath}`);
  process.exit(1);
}

// 出力ディレクトリ
const scriptDir = dirname(new URL(import.meta.url).pathname);
const outputDir = resolve(scriptDir, 'output');
mkdirSync(outputDir, { recursive: true });

console.log(`\n=== KENTERA スライド生成 ===`);
console.log(`入力: ${inputPath}`);

// 1. 台本をパース
const parsed = parseScript(inputPath);
console.log(`台本ID: ${parsed.docId}`);
console.log(`タイトル: ${parsed.docTitle}`);
console.log(`スライド数: ${parsed.slides.length} (+ タイトル + 締め = ${parsed.slides.length + 2}枚)`);

// 各スライドの要点を表示
for (const s of parsed.slides) {
  console.log(`  [${s.number}] ${s.title} (ヒント: ${s.layoutHint || 'なし'})`);
  for (const kp of s.keyPoints) {
    console.log(`      - ${kp.substring(0, 60)}${kp.length > 60 ? '...' : ''}`);
  }
}

// 2. PPTX 生成
const outputName = `${parsed.docId}_${parsed.docTitle}`;
const pptxPath = resolve(outputDir, `${outputName}.pptx`);

try {
  await buildPptx(parsed, pptxPath);
  console.log(`\n✅ PPTX 生成成功: ${pptxPath}`);
} catch (err) {
  console.error(`\n❌ PPTX 生成失敗:`, err);
  process.exit(1);
}

// 生成結果のサマリー
console.log(`\n=== 生成サマリー ===`);
console.log(`PPTX: ${pptxPath}`);
console.log(`\n次のステップ:`);
console.log(`  1. コンテンツQA: python -m markitdown "${pptxPath}"`);
console.log(`  2. PDF変換: python scripts/office/soffice.py "${pptxPath}" "${outputDir}"`);
console.log(`  3. JPEG書き出し: pdftoppm -jpeg -r 150 "${outputDir}/${outputName}.pdf" "${outputDir}/slide"`);
