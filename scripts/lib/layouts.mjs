// 7つのレイアウトパターン（A-G）
// 各関数: (slide, slideData, pptx, iconImages) => void
// ルール: RECTANGLE のみ、bullet: true、breakLine: true、shadow ファクトリ使用

import { COLORS, TYPOGRAPHY, SLIDE, cardShadow, badgeShadow } from './design-tokens.mjs';

const M = SLIDE.MARGIN;

// ────────────────────────────────────────
// ヘルパー
// ────────────────────────────────────────

function addStepBadge(slide, slideNumber, pptx) {
  slide.addShape(pptx.ShapeType.rect, {
    x: M, y: M,
    w: 1.4, h: 0.4,
    fill: { color: COLORS.PRIMARY },
    shadow: badgeShadow(),
  });
  slide.addText(`STEP ${String(slideNumber - 1).padStart(2, '0')}`, {
    x: M, y: M,
    w: 1.4, h: 0.4,
    align: 'center',
    valign: 'middle',
    ...TYPOGRAPHY.STEP_BADGE,
  });
}

function addSlideTitle(slide, title, opts = {}) {
  slide.addText(title, {
    x: opts.x ?? (M + 1.6),
    y: opts.y ?? M,
    w: opts.w ?? (SLIDE.WIDTH - M * 2 - 1.6),
    h: opts.h ?? 0.5,
    ...TYPOGRAPHY.SLIDE_TITLE,
    fontSize: opts.fontSize ?? 26,
    align: opts.align ?? 'left',
    valign: 'middle',
  });
}

// ────────────────────────────────────────
// A. 収束フロー — 複数課題 → 原因 → 解決策
// ────────────────────────────────────────
export function layoutA(slide, data, pptx, iconImages) {
  addStepBadge(slide, data.number, pptx);
  addSlideTitle(slide, data.title);

  const points = data.keyPoints;
  const topPoints = points.slice(0, Math.min(3, points.length));
  const conclusion = points.length > 3 ? points[points.length - 1] : data.title;

  // 上段: 課題カード（横並び）
  const cardW = (SLIDE.WIDTH - M * 2 - 0.4 * (topPoints.length - 1)) / topPoints.length;
  topPoints.forEach((pt, i) => {
    const x = M + i * (cardW + 0.4);
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.4, w: cardW, h: 1.6,
      fill: { color: COLORS.RED_LIGHT },
      shadow: cardShadow(),
    });
    slide.addText(pt, {
      x: x + 0.2, y: 1.6, w: cardW - 0.4, h: 1.2,
      ...TYPOGRAPHY.BODY,
      valign: 'middle',
      wrap: true,
    });
  });

  // 矢印エリア
  slide.addText('▼', {
    x: SLIDE.WIDTH / 2 - 0.5, y: 3.2, w: 1, h: 0.5,
    ...TYPOGRAPHY.SLIDE_TITLE,
    fontSize: 24, color: COLORS.PRIMARY,
    align: 'center',
  });

  // 下段: 解決策BOX
  slide.addShape(pptx.ShapeType.rect, {
    x: M + 1, y: 3.9, w: SLIDE.WIDTH - M * 2 - 2, h: 2.2,
    fill: { color: COLORS.PRIMARY_LIGHT },
    shadow: cardShadow(),
  });
  slide.addText(conclusion, {
    x: M + 1.3, y: 4.1, w: SLIDE.WIDTH - M * 2 - 2.6, h: 1.8,
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.PRIMARY_DARK,
    valign: 'middle',
    align: 'center',
    wrap: true,
  });
}

// ────────────────────────────────────────
// B. VS対比 — 赤系（従来）vs 緑系（新）
// ────────────────────────────────────────
export function layoutB(slide, data, pptx, iconImages) {
  addStepBadge(slide, data.number, pptx);
  addSlideTitle(slide, data.title);

  const halfW = (SLIDE.WIDTH - M * 2 - 0.6) / 2;

  // 左: 従来（赤系）
  slide.addShape(pptx.ShapeType.rect, {
    x: M, y: 1.3, w: halfW, h: 4.8,
    fill: { color: COLORS.RED_LIGHT },
    shadow: cardShadow(),
  });
  slide.addText('従来のパターン', {
    x: M + 0.3, y: 1.5, w: halfW - 0.6, h: 0.5,
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.RED,
  });

  // 右: KENTERA（緑系）
  slide.addShape(pptx.ShapeType.rect, {
    x: M + halfW + 0.6, y: 1.3, w: halfW, h: 4.8,
    fill: { color: COLORS.PRIMARY_LIGHT },
    shadow: cardShadow(),
  });
  slide.addText('KENTERAモデル', {
    x: M + halfW + 0.9, y: 1.5, w: halfW - 0.6, h: 0.5,
    ...TYPOGRAPHY.SECTION_HEADER,
    color: COLORS.PRIMARY_DARK,
  });

  // VS ラベル
  slide.addShape(pptx.ShapeType.rect, {
    x: SLIDE.WIDTH / 2 - 0.4, y: 3.2, w: 0.8, h: 0.8,
    fill: { color: COLORS.TEXT_BLACK },
    shadow: cardShadow(),
  });
  slide.addText('VS', {
    x: SLIDE.WIDTH / 2 - 0.4, y: 3.2, w: 0.8, h: 0.8,
    fontFace: 'Arial', fontSize: 16, bold: true, color: COLORS.WHITE,
    align: 'center', valign: 'middle',
  });

  // ポイントを左右に分配
  const points = data.keyPoints;
  const leftPts = points.filter(p => p.match(/従来|今まで|説明して|断られ|限界/));
  const rightPts = points.filter(p => !leftPts.includes(p));

  if (leftPts.length > 0) {
    slide.addText(leftPts.map(p => ({ text: p, options: { bullet: true, breakLine: true } })), {
      x: M + 0.3, y: 2.2, w: halfW - 0.6, h: 3.5,
      ...TYPOGRAPHY.BODY,
      color: COLORS.RED,
      valign: 'top',
    });
  }
  if (rightPts.length > 0) {
    slide.addText(rightPts.map(p => ({ text: p, options: { bullet: true, breakLine: true } })), {
      x: M + halfW + 0.9, y: 2.2, w: halfW - 0.6, h: 3.5,
      ...TYPOGRAPHY.BODY,
      color: COLORS.PRIMARY_DARK,
      valign: 'top',
    });
  }
}

// ────────────────────────────────────────
// C. 横並びステップ — カード3-4枚 + 矢印
// ────────────────────────────────────────
export function layoutC(slide, data, pptx, iconImages) {
  addStepBadge(slide, data.number, pptx);
  addSlideTitle(slide, data.title);

  // ステップ項目を抽出（①②③④ or → で分割）
  let steps = data.keyPoints.filter(p => p.match(/^[①②③④⑤]/));
  if (steps.length < 2) {
    const flowLine = data.keyPoints.find(p => (p.match(/→/g) || []).length >= 2);
    if (flowLine) {
      steps = flowLine.split('→').map(s => s.trim()).filter(Boolean);
    }
  }
  if (steps.length < 2) steps = data.keyPoints.slice(0, 4);
  steps = steps.slice(0, 4);

  const gap = 0.3;
  const arrowW = 0.4;
  const totalArrowW = arrowW * (steps.length - 1);
  const totalGap = gap * (steps.length - 1);
  const cardW = (SLIDE.WIDTH - M * 2 - totalArrowW - totalGap) / steps.length;

  steps.forEach((step, i) => {
    const x = M + i * (cardW + arrowW + gap);
    const color = COLORS.STEP_COLORS[i % COLORS.STEP_COLORS.length];

    // カード上部のカラーバー
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.6, w: cardW, h: 0.15,
      fill: { color },
    });

    // カード本体
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.75, w: cardW, h: 4.2,
      fill: { color: COLORS.OFF_WHITE },
      shadow: cardShadow(),
    });

    // ステップ番号
    slide.addText(`${i + 1}`, {
      x: x + cardW / 2 - 0.3, y: 2.0, w: 0.6, h: 0.6,
      fontFace: 'Arial', fontSize: 22, bold: true, color,
      align: 'center', valign: 'middle',
    });

    // テキスト
    const text = step.replace(/^[①②③④⑤]\s*/, '');
    slide.addText(text, {
      x: x + 0.2, y: 2.8, w: cardW - 0.4, h: 2.8,
      ...TYPOGRAPHY.BODY,
      valign: 'top',
      wrap: true,
    });

    // 矢印（最後以外）
    if (i < steps.length - 1) {
      slide.addText('→', {
        x: x + cardW, y: 3.2, w: arrowW + gap, h: 0.8,
        fontFace: 'Arial', fontSize: 28, bold: true, color: COLORS.PRIMARY,
        align: 'center', valign: 'middle',
      });
    }
  });
}

// ────────────────────────────────────────
// D. BEFORE → AFTER — 赤BOX → 矢印 → 緑BOX
// ────────────────────────────────────────
export function layoutD(slide, data, pptx, iconImages) {
  addStepBadge(slide, data.number, pptx);
  addSlideTitle(slide, data.title);

  const boxW = (SLIDE.WIDTH - M * 2 - 2) / 2;

  // BEFORE (赤)
  slide.addShape(pptx.ShapeType.rect, {
    x: M, y: 1.6, w: boxW, h: 4.4,
    fill: { color: COLORS.RED_LIGHT },
    shadow: cardShadow(),
  });
  slide.addText('BEFORE', {
    x: M + 0.3, y: 1.8, w: boxW - 0.6, h: 0.5,
    fontFace: 'Arial', fontSize: 16, bold: true, color: COLORS.RED,
    align: 'center',
  });

  // 中央矢印
  slide.addText('→', {
    x: M + boxW, y: 3.2, w: 2, h: 1,
    fontFace: 'Arial', fontSize: 40, bold: true, color: COLORS.PRIMARY,
    align: 'center', valign: 'middle',
  });

  // AFTER (緑)
  slide.addShape(pptx.ShapeType.rect, {
    x: M + boxW + 2, y: 1.6, w: boxW, h: 4.4,
    fill: { color: COLORS.PRIMARY_LIGHT },
    shadow: cardShadow(),
  });
  slide.addText('AFTER', {
    x: M + boxW + 2.3, y: 1.8, w: boxW - 0.6, h: 0.5,
    fontFace: 'Arial', fontSize: 16, bold: true, color: COLORS.PRIMARY_DARK,
    align: 'center',
  });

  // ポイントをBEFORE/AFTERに分配
  const points = data.keyPoints;
  const mid = Math.ceil(points.length / 2);
  const beforePts = points.slice(0, mid);
  const afterPts = points.slice(mid);

  if (beforePts.length > 0) {
    slide.addText(beforePts.map(p => ({ text: p, options: { bullet: true, breakLine: true } })), {
      x: M + 0.3, y: 2.5, w: boxW - 0.6, h: 3.2,
      ...TYPOGRAPHY.BODY, valign: 'top',
    });
  }
  if (afterPts.length > 0) {
    slide.addText(afterPts.map(p => ({ text: p, options: { bullet: true, breakLine: true } })), {
      x: M + boxW + 2.3, y: 2.5, w: boxW - 0.6, h: 3.2,
      ...TYPOGRAPHY.BODY, valign: 'top',
    });
  }
}

// ────────────────────────────────────────
// E. 統計＋ポイント — 大きな数値 + 番号付きポイント
// ────────────────────────────────────────
export function layoutE(slide, data, pptx, iconImages) {
  addStepBadge(slide, data.number, pptx);
  addSlideTitle(slide, data.title);

  // 統計数値を抽出
  const statMatch = data.narration.match(/(\d+[〜~]\d+%|\d+%)/);
  const statText = statMatch ? statMatch[1] : '';

  // 左: 大きな数値
  if (statText) {
    slide.addText(statText, {
      x: M, y: 1.6, w: 4, h: 2.5,
      ...TYPOGRAPHY.STAT_NUMBER,
      align: 'center', valign: 'middle',
    });
    slide.addText('有害金属の慢性疾患関与率', {
      x: M, y: 3.8, w: 4, h: 0.5,
      ...TYPOGRAPHY.CAPTION,
      align: 'center',
    });
  }

  // 右: ポイントリスト
  const rightX = statText ? 4.5 : M;
  const rightW = statText ? (SLIDE.WIDTH - M - 4.5) : (SLIDE.WIDTH - M * 2);

  const points = data.keyPoints;
  if (points.length > 0) {
    const textItems = points.map((p, i) => ({
      text: p,
      options: { bullet: true, breakLine: true },
    }));
    slide.addText(textItems, {
      x: rightX, y: 1.6, w: rightW, h: 4.5,
      ...TYPOGRAPHY.BODY,
      valign: 'top',
      lineSpacingMultiple: 1.5,
    });
  }
}

// ────────────────────────────────────────
// F. ファネル型 — 入力バー → 成果カード3枚
// ────────────────────────────────────────
export function layoutF(slide, data, pptx, iconImages) {
  addStepBadge(slide, data.number, pptx);
  addSlideTitle(slide, data.title);

  // 上段: 入力バー（フルワイド）
  slide.addShape(pptx.ShapeType.rect, {
    x: M, y: 1.4, w: SLIDE.WIDTH - M * 2, h: 1.2,
    fill: { color: COLORS.PRIMARY },
    shadow: cardShadow(),
  });

  const headerText = data.keyPoints[0] || data.title;
  slide.addText(headerText, {
    x: M + 0.3, y: 1.4, w: SLIDE.WIDTH - M * 2 - 0.6, h: 1.2,
    fontFace: 'Arial', fontSize: 18, bold: true, color: COLORS.WHITE,
    align: 'center', valign: 'middle',
  });

  // 矢印
  slide.addText('▼', {
    x: SLIDE.WIDTH / 2 - 0.5, y: 2.7, w: 1, h: 0.5,
    fontFace: 'Arial', fontSize: 20, color: COLORS.PRIMARY,
    align: 'center',
  });

  // 成果カード3枚
  const cards = data.keyPoints.slice(1, 4);
  while (cards.length < 3) cards.push('');
  const cardW = (SLIDE.WIDTH - M * 2 - 0.6) / 3;

  cards.forEach((card, i) => {
    const x = M + i * (cardW + 0.3);
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 3.4, w: cardW, h: 2.8,
      fill: { color: COLORS.OFF_WHITE },
      shadow: cardShadow(),
    });
    // カード上のカラーバー
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 3.4, w: cardW, h: 0.12,
      fill: { color: COLORS.STEP_COLORS[i % COLORS.STEP_COLORS.length] },
    });
    if (card) {
      slide.addText(card, {
        x: x + 0.2, y: 3.7, w: cardW - 0.4, h: 2.2,
        ...TYPOGRAPHY.BODY,
        valign: 'top',
        wrap: true,
      });
    }
  });
}

// ────────────────────────────────────────
// G. 左パネル＋右カード — ダーク左1/3 + 番号カード右2/3
// ────────────────────────────────────────
export function layoutG(slide, data, pptx, iconImages) {
  // STEPバッジ（白背景部分に配置）
  addStepBadge(slide, data.number, pptx);
  addSlideTitle(slide, data.title);

  const leftW = SLIDE.WIDTH * 0.28;
  const rightX = leftW + 0.3;
  const rightW = SLIDE.WIDTH - rightX - M;

  // 左パネル（緑系背景 — 白背景ルール維持）
  slide.addShape(pptx.ShapeType.rect, {
    x: M, y: 1.2, w: leftW, h: 5.2,
    fill: { color: COLORS.PRIMARY_LIGHT },
    shadow: cardShadow(),
  });

  // 左パネルテキスト
  slide.addText(data.title, {
    x: M + 0.3, y: 1.6, w: leftW - 0.6, h: 2,
    fontFace: 'Arial', fontSize: 18, bold: true, color: COLORS.PRIMARY_DARK,
    valign: 'middle',
    wrap: true,
  });

  // アクセント帯
  slide.addShape(pptx.ShapeType.rect, {
    x: M + 0.3, y: 3.8, w: leftW - 0.6, h: 0.08,
    fill: { color: COLORS.PRIMARY },
  });

  // 右: 番号付きカード
  const points = data.keyPoints.length > 0 ? data.keyPoints : [data.title];
  const startY = 1.4;
  const cardH = Math.min(1.2, (SLIDE.HEIGHT - startY - M) / points.length - 0.15);

  points.forEach((pt, i) => {
    const y = startY + i * (cardH + 0.15);
    if (y + cardH > SLIDE.HEIGHT - M) return;

    slide.addShape(pptx.ShapeType.rect, {
      x: rightX, y, w: rightW, h: cardH,
      fill: { color: COLORS.OFF_WHITE },
      shadow: cardShadow(),
    });

    // 番号バッジ
    slide.addShape(pptx.ShapeType.rect, {
      x: rightX + 0.2, y: y + (cardH - 0.45) / 2, w: 0.45, h: 0.45,
      fill: { color: COLORS.STEP_COLORS[i % COLORS.STEP_COLORS.length] },
    });
    slide.addText(`${i + 1}`, {
      x: rightX + 0.2, y: y + (cardH - 0.45) / 2, w: 0.45, h: 0.45,
      fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.WHITE,
      align: 'center', valign: 'middle',
    });

    // テキスト
    slide.addText(pt, {
      x: rightX + 0.85, y, w: rightW - 1.1, h: cardH,
      ...TYPOGRAPHY.BODY,
      valign: 'middle',
      wrap: true,
    });
  });
}

// ────────────────────────────────────────
// レイアウト選択・割り当て
// ────────────────────────────────────────

const LAYOUT_MAP = {
  A: layoutA,
  B: layoutB,
  C: layoutC,
  D: layoutD,
  E: layoutE,
  F: layoutF,
  G: layoutG,
};

const HINT_TO_LAYOUT = {
  hook: 'A',
  vs: 'B',
  steps: 'C',
  detail: 'D',
  stats: 'E',
  action: 'G',
  summary: 'F',
};

/**
 * スライドにレイアウトを割り当て（隣接重複禁止）
 */
export function assignLayouts(slides) {
  const patterns = Object.keys(LAYOUT_MAP);
  let lastLayout = null;

  for (const slide of slides) {
    // ヒントからの推奨
    const hint = slide.layoutHint;
    let preferred = hint ? HINT_TO_LAYOUT[hint] : null;

    // 隣接重複チェック
    if (preferred === lastLayout) preferred = null;

    if (!preferred) {
      // ラウンドロビンで未使用パターンから選択
      const candidates = patterns.filter(p => p !== lastLayout);
      preferred = candidates[slide.number % candidates.length];
    }

    slide.layout = preferred;
    lastLayout = preferred;
  }
}

export function getLayoutFunction(layoutKey) {
  return LAYOUT_MAP[layoutKey] || layoutA;
}

export { LAYOUT_MAP };
