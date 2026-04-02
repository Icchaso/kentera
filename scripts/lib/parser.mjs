// 撮影台本 Markdown パーサー
// 入力: ## 【スライドN】タイトル で区切られた台本ファイル
// 出力: SlideData[] 配列

import { readFileSync } from 'fs';

/**
 * @typedef {Object} SlideData
 * @property {number} number - スライド番号
 * @property {string} title - スライドタイトル
 * @property {string} narration - 読み上げ台本フルテキスト
 * @property {string[]} keyPoints - 要点リスト
 * @property {string|null} layoutHint - 台本から推測されるレイアウントヒント
 */

export function parseScript(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return parseScriptContent(content);
}

export function parseScriptContent(content) {
  // メタ情報を抽出（タイトル行）
  const titleMatch = content.match(/^#\s+(.+?)(?:\s*──\s*(.+))?$/m);
  const docTitle = titleMatch ? titleMatch[1].replace(/^[A-Z]\d+[：:]/, '').trim() : '';
  const docId = extractId(content);

  // 制作メモ以降は無視
  const mainContent = content.split(/^##\s+制作メモ/m)[0];

  // 【スライドN】で分割
  const slideRegex = /^##\s+【スライド(\d+)】(.+)$/gm;
  const sections = [];
  let match;
  const matches = [];

  while ((match = slideRegex.exec(mainContent)) !== null) {
    matches.push({ index: match.index, number: parseInt(match[1]), title: match[2].trim() });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : mainContent.length;
    const block = mainContent.slice(start, end);

    // ヘッダー行と目安尺を除いたナレーション本文
    const lines = block.split('\n');
    const narrationLines = lines.filter(line => {
      if (line.match(/^##\s+【スライド/)) return false;
      if (line.match(/^\*\*目安尺/)) return false;
      if (line.trim() === '---') return false;
      return true;
    });
    const narration = narrationLines.join('\n').trim();

    sections.push({
      number: matches[i].number,
      title: matches[i].title,
      narration,
      keyPoints: extractKeyPoints(narration),
      layoutHint: detectLayoutHint(narration, matches[i].title),
    });
  }

  return { docId, docTitle, slides: sections };
}

function extractId(content) {
  const m = content.match(/^#\s+([A-Z]\d+)[：:]/m);
  return m ? m[1] : 'XX';
}

/** ナレーションから要点を抽出 */
function extractKeyPoints(narration) {
  const points = [];
  const lines = narration.split('\n').filter(l => l.trim());

  for (const line of lines) {
    const trimmed = line.trim();

    // ステップ・番号付き項目（①②③ or 1. 2. 等）
    if (trimmed.match(/^[①②③④⑤⑥⑦⑧⑨⑩]/)) {
      points.push(trimmed);
      continue;
    }

    // 矢印フロー（→ で繋がれた項目）
    if ((trimmed.match(/→/g) || []).length >= 2) {
      points.push(trimmed);
      continue;
    }

    // 「」で囲まれたキーフレーズを含む文
    if (trimmed.match(/「.+」/) && trimmed.length < 80) {
      points.push(trimmed);
      continue;
    }

    // 数値データ
    if (trimmed.match(/\d+[〜~%％]/)) {
      points.push(trimmed);
      continue;
    }

    // 短い強調文（〜です。〜んです。で終わる短文）
    if (trimmed.length < 40 && trimmed.match(/[。！]$/)) {
      points.push(trimmed);
      continue;
    }
  }

  // 重複除去して最大6件
  return [...new Set(points)].slice(0, 6);
}

/** ナレーション内容からレイアウトヒントを推測 */
function detectLayoutHint(narration, title) {
  // 統計データ（優先度高 — 数値がある場合はステップより優先）
  if (narration.match(/\d+[〜~]\d+%/) || narration.match(/\d+%/)) {
    return 'stats';
  }
  // 対比構造
  if (narration.includes('従来') || narration.includes('今まで') ||
      narration.match(/vs|VS|対/) || title.includes('限界')) {
    return 'vs';
  }
  // ステップ・プロセス（3つ以上の→、または①②③がある場合）
  if (narration.match(/[①②③④]/) || (narration.match(/→/g) || []).length >= 3 ||
      title.includes('順番')) {
    return 'steps';
  }
  // 個別ステップ説明（ステップN: → BEFORE/AFTER や 説明向き）
  if (title.match(/ステップ\d/) || title.match(/STEP\s*\d/i)) {
    return 'detail';
  }
  // アクション・実践
  if (title.includes('実践') || title.includes('アクション') || narration.includes('やってみて')) {
    return 'action';
  }
  // 質問・フック
  if (title.includes('？') || title.includes('?') || narration.match(/ありませんか[。？]/)) {
    return 'hook';
  }
  // まとめ
  if (title.includes('まとめ') || title.includes('次の動画')) {
    return 'summary';
  }
  return null;
}
