"use client";

import type { PdfBlock } from "./format";

/** Render structured blocks into a downloaded PDF using jsPDF (dynamically
 *  imported so it stays out of the main bundle). */
export async function exportPdf(
  filename: string,
  title: string,
  blocks: PdfBlock[],
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  function ensureSpace(height: number) {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function writeLines(
    text: string,
    fontSize: number,
    style: "normal" | "bold",
    indent = 0,
    gap = 4,
  ) {
    doc.setFont("helvetica", style);
    doc.setFontSize(fontSize);
    const lineHeight = fontSize * 1.35;
    const lines = doc.splitTextToSize(text, maxWidth - indent) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
    y += gap;
  }

  writeLines(title, 20, "bold", 0, 12);

  for (const block of blocks) {
    if (block.type === "h1") writeLines(block.text, 16, "bold", 0, 6);
    else if (block.type === "h2") writeLines(block.text, 13, "bold", 0, 4);
    else if (block.type === "p") writeLines(block.text, 11, "normal", 0, 8);
    else if (block.type === "bullets") {
      for (const item of block.items) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lineHeight = 11 * 1.35;
        const lines = doc.splitTextToSize(item, maxWidth - 16) as string[];
        lines.forEach((line, idx) => {
          ensureSpace(lineHeight);
          doc.text(idx === 0 ? `•  ${line}` : `   ${line}`, margin, y);
          y += lineHeight;
        });
      }
      y += 6;
    }
  }

  doc.save(filename);
}
