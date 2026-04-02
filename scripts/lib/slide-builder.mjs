// PptxGenJS スライド生成オーケストレーション
import PptxGenJS from 'pptxgenjs';
import { COLORS, TYPOGRAPHY, SLIDE, cardShadow } from './design-tokens.mjs';
import { assignLayouts, getLayoutFunction } from './layouts.mjs';
import { iconToBase64, loadIconSet, selectIconKey } from './icons.mjs';

/**
 * 台本データからPPTXを生成
 * @param {Object} parsed - parseScript() の戻り値
 * @param {string} outputPath - 出力ファイルパス
 * @returns {Promise<string>} 出力ファイルパス
 */
export async function buildPptx(parsed, outputPath) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'KENTERA';
  pptx.company = 'KENTERA';
  pptx.subject = parsed.docTitle;

  // アイコンセットをロード
  let iconImages = {};
  try {
    const iconSet = await loadIconSet();
    const entries = await Promise.all(
      Object.entries(iconSet).map(async ([key, Comp]) => {
        const white = await iconToBase64(Comp, '#FFFFFF', 128);
        const green = await iconToBase64(Comp, `#${COLORS.PRIMARY}`, 128);
        return [key, { white, green }];
      })
    );
    iconImages = Object.fromEntries(entries);
  } catch (e) {
    console.warn('アイコンロードをスキップ:', e.message);
  }

  // レイアウト割り当て
  assignLayouts(parsed.slides);

  // 1. タイトルスライド
  addTitleSlide(pptx, parsed, iconImages);

  // 2. コンテンツスライド
  for (const slideData of parsed.slides) {
    addContentSlide(pptx, slideData, iconImages);
  }

  // 3. 締めスライド
  addClosingSlide(pptx, parsed, iconImages);

  await pptx.writeFile({ fileName: outputPath });
  console.log(`PPTX 生成完了: ${outputPath}`);
  return outputPath;
}

// ────────────────────────────────────────
// タイトルスライド（ダーク背景）
// ────────────────────────────────────────
function addTitleSlide(pptx, parsed, iconImages) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.DARK_BG };

  // 左の緑縦帯
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.15, h: SLIDE.HEIGHT,
    fill: { color: COLORS.PRIMARY },
  });

  // 装飾用透過矩形
  slide.addShape(pptx.ShapeType.rect, {
    x: 9, y: 0, w: 4.333, h: SLIDE.HEIGHT,
    fill: { color: COLORS.PRIMARY },
    transparency: 90,
  });

  // KENTERAラベル
  slide.addText('KENTERA', {
    x: 0.6, y: 0.5, w: 3, h: 0.5,
    fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.PRIMARY,
  });

  // ID ラベル
  slide.addText(parsed.docId, {
    x: 0.6, y: 1.2, w: 2, h: 0.6,
    fontFace: 'Arial', fontSize: 16, bold: true, color: COLORS.TEXT_GRAY,
  });

  // メインタイトル
  slide.addText(parsed.docTitle, {
    x: 0.6, y: 2.2, w: 10, h: 2,
    fontFace: 'Arial', fontSize: 38, bold: true, color: COLORS.WHITE,
    valign: 'middle',
    wrap: true,
  });

  // サブタイトル（最初のスライドのタイトルをサブに使用）
  if (parsed.slides.length > 0) {
    slide.addText(parsed.slides[0].title, {
      x: 0.6, y: 4.4, w: 10, h: 0.8,
      fontFace: 'Arial', fontSize: 18, color: COLORS.PRIMARY,
      valign: 'top',
    });
  }

  // 下部ライン
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 6.2, w: 5, h: 0.04,
    fill: { color: COLORS.PRIMARY },
  });

  slide.addText('治療家向け動画シリーズ', {
    x: 0.6, y: 6.4, w: 5, h: 0.5,
    fontFace: 'Arial', fontSize: 12, color: COLORS.TEXT_GRAY,
  });
}

// ────────────────────────────────────────
// コンテンツスライド（白背景）
// ────────────────────────────────────────
function addContentSlide(pptx, slideData, iconImages) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.WHITE };

  // 下部のアクセントライン
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: SLIDE.HEIGHT - 0.06, w: SLIDE.WIDTH, h: 0.06,
    fill: { color: COLORS.PRIMARY },
  });

  // レイアウト関数を呼び出し
  const layoutFn = getLayoutFunction(slideData.layout);
  layoutFn(slide, slideData, pptx, iconImages);
}

// ────────────────────────────────────────
// 締めスライド（ダーク背景）
// ────────────────────────────────────────
function addClosingSlide(pptx, parsed, iconImages) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.DARK_BG };

  // 左の緑縦帯
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.15, h: SLIDE.HEIGHT,
    fill: { color: COLORS.PRIMARY },
  });

  // まとめラベル
  slide.addText('SUMMARY', {
    x: 0.6, y: 0.5, w: 3, h: 0.5,
    fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.PRIMARY,
  });

  // ミニフロー（4ステップの要約を表示）
  const stepLabels = ['教育', '測定', 'バックエンド成約', 'LTV向上'];
  const flowCards = stepLabels.length;
  const cardW = 2.2;
  const gap = 0.5;
  const totalW = flowCards * cardW + (flowCards - 1) * gap;
  const startX = (SLIDE.WIDTH - totalW) / 2;

  stepLabels.forEach((label, i) => {
    const x = startX + i * (cardW + gap);
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.3, w: cardW, h: 0.6,
      fill: { color: COLORS.STEP_COLORS[i % COLORS.STEP_COLORS.length] },
      transparency: 30,
    });
    slide.addText(label, {
      x, y: 1.3, w: cardW, h: 0.6,
      fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.WHITE,
      align: 'center', valign: 'middle',
    });
    if (i < flowCards - 1) {
      slide.addText('→', {
        x: x + cardW, y: 1.3, w: gap, h: 0.6,
        fontFace: 'Arial', fontSize: 16, color: COLORS.PRIMARY,
        align: 'center', valign: 'middle',
      });
    }
  });

  // メインメッセージ
  slide.addText('ご視聴ありがとうございました', {
    x: 0.6, y: 3, w: SLIDE.WIDTH - 1.2, h: 1.5,
    fontFace: 'Arial', fontSize: 32, bold: true, color: COLORS.WHITE,
    align: 'center', valign: 'middle',
  });

  // 次回予告
  slide.addShape(pptx.ShapeType.rect, {
    x: SLIDE.WIDTH / 2 - 4, y: 5, w: 8, h: 1.2,
    fill: { color: COLORS.PRIMARY },
    transparency: 80,
    shadow: cardShadow(),
  });
  slide.addText('次の動画もぜひご覧ください', {
    x: SLIDE.WIDTH / 2 - 4, y: 5, w: 8, h: 1.2,
    fontFace: 'Arial', fontSize: 18, bold: true, color: COLORS.WHITE,
    align: 'center', valign: 'middle',
  });
}
