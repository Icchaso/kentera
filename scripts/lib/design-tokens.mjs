// KENTERA スライド デザインシステム定数
// PptxGenJS ルール: カラーコードは # なし

export const COLORS = {
  PRIMARY: '28AE6A',
  PRIMARY_LIGHT: 'E8F5EE',
  PRIMARY_DARK: '1E8A52',
  DARK_BG: '1A1A2E',
  WHITE: 'FFFFFF',
  OFF_WHITE: 'F8F9FA',
  TEXT_BLACK: '2D2D2D',
  TEXT_GRAY: '6B7280',
  BORDER_LIGHT: 'E5E7EB',
  RED: 'DC2626',
  RED_LIGHT: 'FEE2E2',
  RED_LIGHTER: 'FECACA',
  STEP_COLORS: ['28AE6A', '1E8A52', '0F766E', '065F46'],
};

export const FONTS = {
  FACE: 'Arial',
};

export const TYPOGRAPHY = {
  SLIDE_TITLE: { fontFace: FONTS.FACE, fontSize: 30, bold: true, color: COLORS.TEXT_BLACK },
  STEP_BADGE: { fontFace: FONTS.FACE, fontSize: 11, bold: true, color: COLORS.WHITE },
  SECTION_HEADER: { fontFace: FONTS.FACE, fontSize: 19, bold: true, color: COLORS.TEXT_BLACK },
  BODY: { fontFace: FONTS.FACE, fontSize: 13, bold: false, color: COLORS.TEXT_BLACK },
  CAPTION: { fontFace: FONTS.FACE, fontSize: 11, bold: false, color: COLORS.TEXT_GRAY },
  STAT_NUMBER: { fontFace: FONTS.FACE, fontSize: 46, bold: true, color: COLORS.PRIMARY },
};

export const SLIDE = {
  WIDTH: 13.333,
  HEIGHT: 7.5,
  MARGIN: 0.5,
};

// Shadow ファクトリ関数 — 毎回新規オブジェクト生成（PptxGenJS の共有バグ対策）
export function cardShadow(opts = {}) {
  return {
    type: 'outer',
    color: '000000',
    blur: opts.blur ?? 4,
    offset: Math.max(0, opts.offset ?? 2),
    opacity: Math.min(1.0, Math.max(0.0, opts.opacity ?? 0.3)),
    angle: opts.angle ?? 135,
  };
}

// STEPバッジ用の小さめ影
export function badgeShadow() {
  return cardShadow({ blur: 2, offset: 1, opacity: 0.2 });
}
