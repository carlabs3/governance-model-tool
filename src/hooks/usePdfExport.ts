import { useState } from "react";
import { jsPDF } from "jspdf";
import type { GovernanceCanvas, CanvasSection } from "@/types/governance";
import logoSrc from "@/assets/NEU-logo_RGB_main-color.png";
import euFlagSrc from "@/assets/eu-flag.png";

const BRAND_PRIMARY = { r: 102, g: 196, b: 217 };
const BRAND_SECONDARY = { r: 175, g: 203, b: 114 };
const TEXT_DARK = { r: 35, g: 40, b: 50 };
const TEXT_MUTED = { r: 150, g: 150, b: 155 };
const BORDER = { r: 220, g: 220, b: 225 };
const DIVIDER = { r: 235, g: 235, b: 238 };
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

const wrapText = (pdf: jsPDF, text: string, maxWidth: number): string[] => {
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
const calcCardHeight = (pdf: jsPDF, section: CanvasSection, w: number): number => {
  const padding = 4;
  const innerW = w - padding * 2;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  const descLines = wrapText(pdf, section.description, innerW - 4).slice(0, 2);
  const descH = descLines.length * 3.2;

  pdf.setFontSize(7.5);
  const contentLines = section.content?.trim() ? wrapText(pdf, section.content, innerW - 2) : [];
  const contentH = contentLines.length > 0 ? contentLines.length * 3.2 : 3.2;

  return padding + 3 + 5 + descH + 3 + 0.15 + 4 + contentH + padding;
};

const drawSectionCard = (pdf: jsPDF, section: CanvasSection, x: number, y: number, w: number, cardH: number): void => {
  const padding = 4;
  const innerW = w - padding * 2;
  const isStrategy = section.category === "strategy";
  const catColor = isStrategy ? BRAND_PRIMARY : BRAND_SECONDARY;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  const descLines = wrapText(pdf, section.description, innerW - 4).slice(0, 2);

  pdf.setFontSize(7.5);
  const contentLines = section.content?.trim() ? wrapText(pdf, section.content, innerW - 2) : [];

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, cardH, 3, 3, "F");

  pdf.setDrawColor(225, 225, 230);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, w, cardH, 3, 3, "S");

  let curY = y + padding + 3;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
  pdf.text(section.title, x + padding, curY);
  curY += 4.5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
  for (const line of descLines) {
    pdf.text(line, x + padding, curY);
    curY += 3;
  }
  curY += 2;

  if (section.content?.trim()) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
    const isMultiLine = section.content.includes("\n");
    const paragraphs = section.content.split("\n").filter((p) => p.trim());
    for (const para of paragraphs) {
      const paraLines = wrapText(pdf, para, innerW - (isMultiLine ? 4 : 2));
      for (let i = 0; i < paraLines.length; i++) {
        const prefix = isMultiLine && i === 0 ? "• " : isMultiLine ? "  " : "";
        pdf.text(`${prefix}${paraLines[i]}`, x + padding + 1, curY);
        curY += 3.2;
      }
    }
  } else {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7.5);
    pdf.setTextColor(EMPTY_TEXT.r, EMPTY_TEXT.g, EMPTY_TEXT.b);
    pdf.text("Click to add content...", x + padding, curY);
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

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const mx = 14;
      const usableW = pageW - mx * 2;

      // ── Two-tone top bar ──
      const barH = 2;
      pdf.setFillColor(BRAND_PRIMARY.r, BRAND_PRIMARY.g, BRAND_PRIMARY.b);
      pdf.rect(0, 0, pageW / 2, barH, "F");
      pdf.setFillColor(BRAND_SECONDARY.r, BRAND_SECONDARY.g, BRAND_SECONDARY.b);
      pdf.rect(pageW / 2, 0, pageW / 2, barH, "F");

      // ── Header ──
      const headerY = 15;

      // Logo (fixed height, aspect-ratio-aware width)
      const logoH = 8;
      const logoW = logoH * 2.96;
      if (logoData) {
        pdf.addImage(logoData, "PNG", pageW - mx - logoW, headerY - 3, logoW, logoH);
      }

      // Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
      pdf.text(project.name, mx, headerY + 2);

      // Subtitle row
      const subtitleY = headerY + 7;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
      pdf.text("Governance Model Canvas", mx, subtitleY);

      // Access code (right-aligned on subtitle row)
      const code = project.accessCode || "—";
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
      const codeLabel = "Access Code: ";
      const codeLabelW = pdf.getTextWidth(codeLabel);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      const codeW = pdf.getTextWidth(code);
      const codeRightX = pageW - mx;
      const codeY = subtitleY + 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
      pdf.text(codeLabel, codeRightX - codeW - codeLabelW, codeY);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(BRAND_PRIMARY.r, BRAND_PRIMARY.g, BRAND_PRIMARY.b);
      pdf.text(code, codeRightX - codeW, codeY);

      // Separator line below subtitle
      const sepY = subtitleY + 3;
      pdf.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
      pdf.setLineWidth(0.25);
      pdf.line(mx, sepY, pageW - mx, sepY);

      // ── Canvas grid ──
      const gridStartY = sepY + 5;
      const gap = 3;
      const halfW = (usableW - gap) / 2;
      const innerColW = (halfW - gap) / 2;

      const strategySections = project.sections.filter((s) => s.category === "strategy");
      const operationsSections = project.sections.filter((s) => s.category === "operations");
      const findSection = (id: string) =>
        strategySections.find((s) => s.id === id) || operationsSections.find((s) => s.id === id);

      const labObj = findSection("lab-objectives");
      const decMak = findSection("decision-making");
      const leader = findSection("leadership");
      const citInv = findSection("citizen-involvement");
      const financ = findSection("finances");
      const legal = findSection("legal-status");
      const opsMgmt = findSection("operations-management");
      const intComm = findSection("internal-communication");
      const workGrp = findSection("working-groups");
      const stakeh = findSection("stakeholders");

      // ── Category headers ──
      const catH = 9;

      pdf.setFillColor(BRAND_PRIMARY.r, BRAND_PRIMARY.g, BRAND_PRIMARY.b);
      pdf.roundedRect(mx, gridStartY, halfW, catH, 2, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("STRATEGY", mx + halfW / 2, gridStartY + 6, { align: "center" });

      pdf.setFillColor(BRAND_SECONDARY.r, BRAND_SECONDARY.g, BRAND_SECONDARY.b);
      pdf.roundedRect(mx + halfW + gap, gridStartY, halfW, catH, 2, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("OPERATIONS", mx + halfW + gap + halfW / 2, gridStartY + 6, { align: "center" });

      // ── Row positions (shared height per row) ──
      const r1y = gridStartY + catH + gap;

      const r1H = Math.max(
        labObj ? calcCardHeight(pdf, labObj, halfW) : 0,
        opsMgmt ? calcCardHeight(pdf, opsMgmt, halfW) : 0,
      );

      const r2y = r1y + r1H + gap;
      const r2H = Math.max(
        decMak ? calcCardHeight(pdf, decMak, innerColW) : 0,
        leader ? calcCardHeight(pdf, leader, innerColW) : 0,
      );

      const r3y = r2y + r2H + gap;
      const r3H = Math.max(citInv ? calcCardHeight(pdf, citInv, halfW) : 0);

      const r4y = r3y + r3H + gap;
      const r4H = Math.max(
        financ ? calcCardHeight(pdf, financ, innerColW) : 0,
        legal ? calcCardHeight(pdf, legal, innerColW) : 0,
        intComm ? calcCardHeight(pdf, intComm, halfW) : 0,
      );

      // Working Groups y Stakeholders spanean r2 + r3
      const tallH = r2H + gap + r3H;

      // ── Strategy ──
      if (labObj) drawSectionCard(pdf, labObj, mx, r1y, halfW, r1H);
      if (decMak) drawSectionCard(pdf, decMak, mx, r2y, innerColW, r2H);
      if (leader) drawSectionCard(pdf, leader, mx + innerColW + gap, r2y, innerColW, r2H);
      if (citInv) drawSectionCard(pdf, citInv, mx, r3y, halfW, r3H);
      if (financ) drawSectionCard(pdf, financ, mx, r4y, innerColW, r4H);
      if (legal) drawSectionCard(pdf, legal, mx + innerColW + gap, r4y, innerColW, r4H);

      // ── Operations ──
      const ox = mx + halfW + gap;
      if (opsMgmt) drawSectionCard(pdf, opsMgmt, ox, r1y, halfW, r1H);
      if (workGrp) drawSectionCard(pdf, workGrp, ox, r2y, innerColW, tallH);
      if (stakeh) drawSectionCard(pdf, stakeh, ox + innerColW + gap, r2y, innerColW, tallH);
      if (intComm) drawSectionCard(pdf, intComm, ox, r4y, halfW, r4H);
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
