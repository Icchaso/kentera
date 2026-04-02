// QAパイプライン — コンテンツQA + ビジュアルQA
import { execSync } from 'child_process';
import { existsSync, readdirSync, unlinkSync } from 'fs';
import { resolve, dirname, basename } from 'path';

/**
 * コンテンツQA: markitdown でPPTXからテキスト抽出
 * @param {string} pptxPath - PPTXファイルパス
 * @returns {string} 抽出されたテキスト
 */
export function contentQA(pptxPath) {
  console.log('\n=== コンテンツQA（markitdown） ===');
  try {
    const output = execSync(`python3 -m markitdown "${pptxPath}"`, {
      encoding: 'utf-8',
      timeout: 60000,
    });
    console.log(output.substring(0, 2000));
    if (output.length > 2000) console.log('... (省略)');
    return output;
  } catch (err) {
    console.error('markitdown 実行失敗:', err.message);
    return '';
  }
}

/**
 * ビジュアルQA: PPTX → PDF → JPEG 変換
 * @param {string} pptxPath - PPTXファイルパス
 * @param {string} outputDir - 出力ディレクトリ
 * @returns {string[]} 生成されたJPEGファイルパスの配列
 */
export function visualQA(pptxPath, outputDir) {
  console.log('\n=== ビジュアルQA ===');
  const dir = outputDir || dirname(pptxPath);
  const baseName = basename(pptxPath, '.pptx');
  const scriptDir = dirname(new URL(import.meta.url).pathname);

  // 1. PDF変換
  console.log('1. PDF変換中...');
  try {
    execSync(`python3 "${resolve(scriptDir, '../office/soffice.py')}" "${pptxPath}" "${dir}"`, {
      encoding: 'utf-8',
      timeout: 120000,
      stdio: 'inherit',
    });
  } catch (err) {
    console.error('PDF変換失敗:', err.message);
    return [];
  }

  const pdfPath = resolve(dir, `${baseName}.pdf`);
  if (!existsSync(pdfPath)) {
    console.error(`PDFが見つかりません: ${pdfPath}`);
    return [];
  }

  // 2. 既存のslide-*.jpgを削除
  const existingJpgs = readdirSync(dir).filter(f => f.match(/^slide-\d+\.jpg$/));
  for (const f of existingJpgs) {
    unlinkSync(resolve(dir, f));
  }

  // 3. JPEG書き出し
  console.log('2. JPEG書き出し中...');
  try {
    execSync(`pdftoppm -jpeg -r 150 "${pdfPath}" "${resolve(dir, 'slide')}"`, {
      encoding: 'utf-8',
      timeout: 60000,
    });
  } catch (err) {
    console.error('pdftoppm 実行失敗:', err.message);
    return [];
  }

  // 4. 生成されたJPEGファイルをリスト
  const jpgFiles = readdirSync(dir)
    .filter(f => f.match(/^slide-\d+\.jpg$/))
    .sort()
    .map(f => resolve(dir, f));

  console.log(`JPEG ${jpgFiles.length} 枚生成:`);
  jpgFiles.forEach(f => console.log(`  ${f}`));

  return jpgFiles;
}

/**
 * フルQAパイプライン実行
 */
export function runFullQA(pptxPath, outputDir) {
  const content = contentQA(pptxPath);
  const jpgFiles = visualQA(pptxPath, outputDir);
  return { content, jpgFiles };
}
