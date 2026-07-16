import type { jsPDF } from "jspdf";
import type { GovernanceCanvas, CanvasSection } from "@/types/governance";

// ─────────────────────────────────────────────────────────────
// Shared layout + measurement for the Governance Canvas PDF.
//
// Fixed-width / variable-height approach: the page is always ~297mm wide
// (so the two columns work), and the page HEIGHT is computed from the
// real content. Font size is constant and legible — content is NEVER
// scaled down and NEVER truncated. Everything always fits.
//
// Columns are laid out independently (decoupled). The taller column sets
// the page height; the shorter column stretches its cards to balance,
// but only up to MAX_STRETCH over natural height — beyond that it leaves
// honest whitespace instead of near-empty stretched cards.
// ─────────────────────────────────────────────────────────────

// ── Page geometry (mm). Width fixed (A4-landscape width); height computed. ──
export const PAGE = { w: 297, mx: 14 } as const;
export const GAP = 3;
const USABLE_W = PAGE.w - PAGE.mx * 2; // 269
export const HALF_W = (USABLE_W - GAP) / 2; // 133
export const INNER_COL_W = (HALF_W - GAP) / 2; // 65

export const GRID_START_Y = 30;
export const CAT_H = 9;
export const ROW1_Y = GRID_START_Y + CAT_H + GAP; // 42 — first card top

// ── Vertical margins for the computed page height ──
const BOTTOM_GAP = 12; // breathing room between tallest card and footer line
const FOOTER_BAND = 14; // footer line → page bottom (line + flag + text)
const MAX_PAGE_H = 5000; // safety clamp (~PDF spec 200in limit); warn only, never truncates

// ── Balance: cap how much a short column's cards may stretch ──
const MAX_STRETCH = 0.4; // a card grows at most 40% over its natural height

// ── Fixed typography (mm-based sizes, legible, never scaled) ──
export const METRICS = {
  pad: 4,
  cardTop: 3,
  titleFS: 9,
  titleAdvance: 4.5,
  descFS: 6.5,
  descLH: 3,
  gapAfterDesc: 2,
  contentFS: 7.5,
  contentLH: 3.2,
} as const;

const DESC_CAP = 2; // descriptions are boilerplate: cap at 2 lines

// ── Column structure (decoupled). Same 10 canonical ids as the app. ──
type RowDef = { kind: "full" | "split"; ids: string[] };

const STRATEGY_ROWS: RowDef[] = [
  { kind: "full", ids: ["lab-objectives"] },
  { kind: "split", ids: ["decision-making", "leadership"] },
  { kind: "full", ids: ["citizen-involvement"] },
  { kind: "split", ids: ["finances", "legal-status"] },
];
const OPERATIONS_ROWS: RowDef[] = [
  { kind: "full", ids: ["operations-management"] },
  { kind: "split", ids: ["working-groups", "stakeholders"] },
  { kind: "full", ids: ["internal-communication"] },
];

// ── Plan returned to the drawer ──
export interface CardPlan {
  section: CanvasSection;
  x: number;
  y: number;
  w: number;
  h: number;
  descLines: string[];
  contentLines: string[];
  contentEmpty: boolean;
}

export interface CanvasLayout {
  cards: CardPlan[];
  pageHeight: number;
}

// ── Text wrapping (measured against the current pdf font) ──
export const wrapText = (pdf: jsPDF, text: string, maxWidth: number): string[] => {
  if (!text) return [];
  const paragraphs = text.split("\n");
  const allLines: string[] = [];
  for (const para of paragraphs) {
    if (!para.trim()) {
      allLines.push("");
      continue;
    }
    const words = para.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (pdf.getTextWidth(test) > maxWidth) {
        if (line) allLines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) allLines.push(line);
  }
  return allLines;
};

// Wrapped content lines (with bullet prefixes) for a section at a given width.
const buildContentLines = (pdf: jsPDF, section: CanvasSection, innerW: number): string[] => {
  const raw = section.content?.trim() ?? "";
  if (!raw) return [];
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(METRICS.contentFS);
  const isMulti = section.content.includes("\n");
  const paragraphs = section.content.split("\n").filter((p) => p.trim());
  const lines: string[] = [];
  for (const para of paragraphs) {
    const wrapped = wrapText(pdf, para, innerW - (isMulti ? 4 : 2));
    for (let i = 0; i < wrapped.length; i++) {
      const prefix = isMulti && i === 0 ? "• " : isMulti ? "  " : "";
      lines.push(`${prefix}${wrapped[i]}`);
    }
  }
  return lines;
};

const cardHeight = (descCount: number, contentCount: number): number =>
  METRICS.pad * 2 +
  METRICS.cardTop +
  METRICS.titleAdvance +
  descCount * METRICS.descLH +
  METRICS.gapAfterDesc +
  contentCount * METRICS.contentLH;

interface CardMeasure {
  section: CanvasSection;
  w: number;
  descLines: string[];
  contentLines: string[];
  contentEmpty: boolean;
  height: number;
}

const measureCard = (pdf: jsPDF, section: CanvasSection | undefined, w: number): CardMeasure | null => {
  if (!section) return null;
  const innerW = w - METRICS.pad * 2;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(METRICS.descFS);
  const descLines = wrapText(pdf, section.description, innerW - 4).slice(0, DESC_CAP);

  const contentLines = buildContentLines(pdf, section, innerW);
  const contentEmpty = contentLines.length === 0;
  const contentCount = contentEmpty ? 1 : contentLines.length; // empty reserves 1 hint line
  const height = cardHeight(descLines.length, contentCount);

  return { section, w, descLines, contentLines, contentEmpty, height };
};

interface MeasuredRow {
  def: RowDef;
  cards: CardMeasure[];
  height: number;
}

const measureColumn = (
  pdf: jsPDF,
  rows: RowDef[],
  find: (id: string) => CanvasSection | undefined,
): { rows: MeasuredRow[]; total: number } => {
  const measured: MeasuredRow[] = [];
  for (const def of rows) {
    const w = def.kind === "full" ? HALF_W : INNER_COL_W;
    const cards = def.ids
      .map((id) => measureCard(pdf, find(id), w))
      .filter((c): c is CardMeasure => c !== null);
    const height = cards.reduce((m, c) => Math.max(m, c.height), 0);
    measured.push({ def, cards, height });
  }
  const total = measured.reduce((sum, r) => sum + r.height, 0) + GAP * (measured.length - 1);
  return { rows: measured, total };
};

export const computeCanvasLayout = (pdf: jsPDF, project: GovernanceCanvas): CanvasLayout => {
  const strategy = project.sections.filter((s) => s.category === "strategy");
  const operations = project.sections.filter((s) => s.category === "operations");
  const find = (id: string) =>
    strategy.find((s) => s.id === id) || operations.find((s) => s.id === id);

  const left = measureColumn(pdf, STRATEGY_ROWS, find);
  const right = measureColumn(pdf, OPERATIONS_ROWS, find);
  const contentH = Math.max(left.total, right.total);

  let pageHeight = ROW1_Y + contentH + BOTTOM_GAP + FOOTER_BAND;
  if (pageHeight > MAX_PAGE_H) {
    console.warn(
      `[pdf] Canvas height ${Math.round(pageHeight)}mm exceeds the ${MAX_PAGE_H}mm safety limit; ` +
        `page clamped. Content may extend beyond the page — consider splitting this canvas.`,
    );
    pageHeight = MAX_PAGE_H;
  }

  const cards: CardPlan[] = [];

  // Each column fills up to contentH; the shorter one stretches its cards to
  // balance, capped at MAX_STRETCH, leaving honest whitespace beyond the cap.
  const layoutColumn = (measured: { rows: MeasuredRow[]; total: number }, colX: number) => {
    const slack = Math.max(0, contentH - measured.total);
    const totalNat = measured.rows.reduce((s, r) => s + r.height, 0) || 1;

    let y = ROW1_Y;
    for (const row of measured.rows) {
      const wanted = slack * (row.height / totalNat);
      const rowH = row.height + Math.min(wanted, row.height * MAX_STRETCH);
      row.cards.forEach((card, i) => {
        const x = row.def.kind === "full" ? colX : colX + i * (INNER_COL_W + GAP);
        cards.push({
          section: card.section,
          x,
          y,
          w: card.w,
          h: rowH,
          descLines: card.descLines,
          contentLines: card.contentLines,
          contentEmpty: card.contentEmpty,
        });
      });
      y += rowH + GAP;
    }
  };

  layoutColumn(left, PAGE.mx);
  layoutColumn(right, PAGE.mx + HALF_W + GAP);

  return { cards, pageHeight };
};
