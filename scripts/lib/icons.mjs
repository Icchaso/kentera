// react-icons → sharp → PNG base64 変換パイプライン
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';

// アイコンキャッシュ（同一セッション内の再利用）
const cache = new Map();

/**
 * React Icon コンポーネントを PNG base64 文字列に変換
 * @param {Function} IconComponent - react-icons コンポーネント
 * @param {string} color - カラーコード（#付き）
 * @param {number} size - ピクセルサイズ
 * @returns {Promise<string>} "image/png;base64,..." 形式
 */
export async function iconToBase64(IconComponent, color = '#FFFFFF', size = 256) {
  const key = `${IconComponent.name}_${color}_${size}`;
  if (cache.has(key)) return cache.get(key);

  const svg = renderToStaticMarkup(
    createElement(IconComponent, { color, size: String(size) })
  );

  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer();

  const result = 'image/png;base64,' + pngBuffer.toString('base64');
  cache.set(key, result);
  return result;
}

/** よく使うアイコンを一括ロード */
export async function loadIconSet() {
  const { FaGraduationCap, FaMicroscope, FaChartLine, FaCheckCircle,
          FaUsers, FaLightbulb, FaArrowRight, FaExclamationTriangle,
          FaBook, FaHandshake, FaStar, FaBullseye,
          FaClipboardList, FaCog } = await import('react-icons/fa');

  const icons = {
    education: FaGraduationCap,
    measurement: FaMicroscope,
    growth: FaChartLine,
    check: FaCheckCircle,
    patients: FaUsers,
    idea: FaLightbulb,
    arrow: FaArrowRight,
    warning: FaExclamationTriangle,
    book: FaBook,
    handshake: FaHandshake,
    star: FaStar,
    target: FaBullseye,
    checklist: FaClipboardList,
    settings: FaCog,
  };

  return icons;
}

/**
 * キーワードに基づいてアイコンを選択
 * @param {string} text - テキスト内容
 * @returns {string} アイコンキー
 */
export function selectIconKey(text) {
  if (text.match(/教育|学習|KENTERA|動画/)) return 'education';
  if (text.match(/測定|オリゴスキャン|数値|検査/)) return 'measurement';
  if (text.match(/成約|成長|向上|LTV|売上/)) return 'growth';
  if (text.match(/実践|アクション|やって/)) return 'checklist';
  if (text.match(/患者|先生|院/)) return 'patients';
  if (text.match(/ポイント|重要|大事/)) return 'idea';
  if (text.match(/問題|課題|限界|疲れ/)) return 'warning';
  if (text.match(/契約|継続|紹介/)) return 'handshake';
  if (text.match(/まとめ|結論/)) return 'star';
  if (text.match(/目標|ゴール/)) return 'target';
  return 'idea';
}
