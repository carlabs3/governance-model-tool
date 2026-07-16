import { useState } from "react";
import { jsPDF } from "jspdf";
import type { GovernanceCanvas } from "@/types/governance";
import {
  computeCanvasLayout,
  type CardPlan,
  METRICS,
  PAGE,
  GAP,
  GRID_START_Y,
  CAT_H,
  HALF_W,
} from "@/lib/pdfCanvasLayout";
import logoSrc from "@/assets/NEU-logo_RGB_main-color.png";
import euFlagSrc from "@/assets/eu-flag.png";

const BRAND_PRIMARY = { r: 102, g: 196, b: 217 };
const BRAND_SECONDARY = { r: 175, g: 203, b: 114 };
const TEXT_DARK = { r: 35, g: 40, b: 50 };
const TEXT_MUTED = { r: 150, g: 150, b: 155 };
const BORDER = { r: 220, g: 220, b: 225 };
const EMPTY_TEXT = { r: 200, g: 200, b: 205 };

const loadImageAsBase64 = (src: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });

const drawCard = (pdf: jsPDF, card: CardPlan): void => {
  const { x, y, w, h } = card;

  // Card background + border
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, 3, 3, "F");
  pdf.setDrawColor(225, 225, 230);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, h, 3, 3, "S");

  let curY = y + METRICS.pad + METRICS.cardTop;

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(METRICS.titleFS);
  pdf.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
  pdf.text(card.section.title, x + METRICS.pad, curY);
  curY += METRICS.titleAdvance;

  // Description
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(METRICS.descFS);
  pdf.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
  for (const line of card.descLines) {
    pdf.text(line, x + METRICS.pad, curY);
    curY += METRICS.descLH;
  }
  curY += METRICS.gapAfterDesc;

  // Content (full font size, never scaled or truncated)
  if (!card.contentEmpty) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(METRICS.contentFS);
    pdf.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
    for (const line of card.contentLines) {
      pdf.text(line, x + METRICS.pad + 1, curY);
      curY += METRICS.contentLH;
    }
  } else {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(METRICS.contentFS);
    pdf.setTextColor(EMPTY_TEXT.r, EMPTY_TEXT.g, EMPTY_TEXT.b);
    pdf.text("Click to add content...", x + METRICS.pad, curY);
  }
};

export const usePdfExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async (project: GovernanceCanvas) => {
    setIsExporting(true);
    try {
      let logoData: string | null = null;
      let euFlagData: string | null = null;
      try {
        [logoData, euFlagData] = await Promise.all([
          loadImageAsBase64(logoSrc).catch(() => null),
          loadImageAsBase64(euFlagSrc).catch(() => null),
        ]);
      } catch {}

      // Measure first (text width is independent of page size), then create the
      // real page at exactly the height the content needs.
      const measurePdf = new jsPDF({ unit: "mm", format: [PAGE.w, 1000] });
      const layout = computeCanvasLayout(measurePdf, project);

      const pageW = PAGE.w;
      const pageH = layout.pageHeight;
      const mx = PAGE.mx;
      const pdf = new jsPDF({ unit: "mm", format: [pageW, pageH] });

      // ── Two-tone top bar ──
      const barH = 2;
      pdf.setFillColor(BRAND_PRIMARY.r, BRAND_PRIMARY.g, BRAND_PRIMARY.b);
      pdf.rect(0, 0, pageW / 2, barH, "F");
      pdf.setFillColor(BRAND_SECONDARY.r, BRAND_SECONDARY.g, BRAND_SECONDARY.b);
      pdf.rect(pageW / 2, 0, pageW / 2, barH, "F");

      // ── Header ──
      const headerY = 15;
      const logoH = 8;
      const logoW = logoH * 2.96;
      if (logoData) {
        pdf.addImage(logoData, "PNG", pageW - mx - logoW, headerY - 3, logoW, logoH);
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
      pdf.text(project.name, mx, headerY + 2);

      const subtitleY = headerY + 7;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
      pdf.text("Governance Model Canvas", mx, subtitleY);

      const code = project.accessCode || "—";
      const codeLabel = "Access Code: ";
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      const codeW = pdf.getTextWidth(code);
      const codeRightX = pageW - mx;
      const codeY = subtitleY + 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
      const codeLabelW = pdf.getTextWidth(codeLabel);
      pdf.text(codeLabel, codeRightX - codeW - codeLabelW, codeY);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(BRAND_PRIMARY.r, BRAND_PRIMARY.g, BRAND_PRIMARY.b);
      pdf.text(code, codeRightX - codeW, codeY);

      const sepY = subtitleY + 3;
      pdf.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
      pdf.setLineWidth(0.25);
      pdf.line(mx, sepY, pageW - mx, sepY);

      // ── Category headers ──
      pdf.setFillColor(BRAND_PRIMARY.r, BRAND_PRIMARY.g, BRAND_PRIMARY.b);
      pdf.roundedRect(mx, GRID_START_Y, HALF_W, CAT_H, 2, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("STRATEGY", mx + HALF_W / 2, GRID_START_Y + 6, { align: "center" });

      pdf.setFillColor(BRAND_SECONDARY.r, BRAND_SECONDARY.g, BRAND_SECONDARY.b);
      pdf.roundedRect(mx + HALF_W + GAP, GRID_START_Y, HALF_W, CAT_H, 2, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("OPERATIONS", mx + HALF_W + GAP + HALF_W / 2, GRID_START_Y + 6, { align: "center" });

      // ── Canvas cards ──
      for (const card of layout.cards) {
        drawCard(pdf, card);
      }

      // ── Footer ──
      const footerY = pageH - 8;
      pdf.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
      pdf.setLineWidth(0.2);
      pdf.line(mx, footerY - 4, pageW - mx, footerY - 4);

      if (euFlagData) {
        pdf.addImage(euFlagData, "PNG", mx, footerY - 2, 8, 5);
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
      const euTextX = euFlagData ? mx + 10 : mx;
      pdf.text("Co-funded by the European Union", euTextX, footerY + 1);

      const fullDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      pdf.text(`Exported: ${fullDate}`, pageW - mx, footerY + 1, { align: "right" });

      pdf.save(`${project.name.replace(/\s+/g, "-").toLowerCase()}-governance-canvas.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, exportToPdf };
};
