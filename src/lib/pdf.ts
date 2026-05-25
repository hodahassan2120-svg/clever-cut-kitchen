import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { BoardResult, RodResult } from "./cutting";

export function exportBoardsPDF(result: BoardResult, title = "Boards Cutting Report") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.text(title, 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Total waste: ${(result.totalWaste / 10000).toFixed(2)} m2`, 105, 22, { align: "center" });

  let y = 30;
  result.assignments.forEach((a) => {
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    // Stock size: Board #i — W x L cm
    doc.text(`Board #${a.index}   |   Stock: ${a.stockWidth} x ${a.stockLength} cm`, 20, y);
    // Mini diagram
    const maxW = 170;
    const scale = Math.min(maxW / a.stockWidth, 180 / a.stockLength);
    const W = a.stockWidth * scale;
    const H = a.stockLength * scale;
    const startX = 20, startY = y + 4;
    doc.setDrawColor(0); doc.rect(startX, startY, W, H);
    a.placed.forEach((p) => {
      doc.setFillColor(194, 149, 107);
      doc.setDrawColor(60);
      doc.rect(startX + p.x * scale, startY + p.y * scale, p.w * scale, p.h * scale, "FD");
      doc.setFontSize(9);
      doc.setTextColor(0);
      // Show piece dimensions inside: W x L
      doc.text(`${p.w} x ${p.h}`, startX + (p.x + p.w / 2) * scale, startY + (p.y + p.h / 2) * scale + 1, { align: "center" });
    });
    y = startY + H + 6;
    autoTable(doc, {
      startY: y,
      head: [["#", "Width (cm)", "Length (cm)", "Rotated"]],
      body: a.placed.map((p, i) => [i + 1, p.w, p.h, p.rotated ? "Yes" : "No"]),
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [60, 60, 60] },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  });

  if (result.unfulfilled.length) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setTextColor(200, 0, 0);
    doc.text("Pieces not fitted:", 20, y);
    doc.setTextColor(0);
    autoTable(doc, { startY: y + 3, head: [["Width", "Length", "Qty"]], body: result.unfulfilled.map(u => [u.width, u.length, u.quantity]), styles: { fontSize: 9, halign: "center" } });
  }
  doc.save("boards-cutting.pdf");
}

export function exportRodsPDF(result: RodResult, title = "تقرير تقطيع الأعواد") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.text(title, 200, 15, { align: "right" });
  doc.setFontSize(10);
  doc.text(`Total waste: ${result.totalWaste.toFixed(1)} cm`, 200, 22, { align: "right" });

  let y = 32;
  result.assignments.forEach((a) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.text(`${a.stockName} #${a.index} — ${a.stockLength} cm`, 200, y, { align: "right" });
    const W = 170, startX = 20, startY = y + 3, H = 6;
    doc.setDrawColor(0); doc.rect(startX, startY, W, H);
    let cx = startX;
    a.cuts.forEach((c) => {
      const w = (c.length / a.stockLength) * W;
      doc.setFillColor(194, 149, 107);
      doc.rect(cx, startY, w, H, "FD");
      doc.setFontSize(7);
      doc.text(`${c.length}`, cx + w / 2, startY + H / 2 + 1, { align: "center" });
      cx += w;
    });
    if (a.waste > 0) {
      const w = (a.waste / a.stockLength) * W;
      doc.setFillColor(220, 80, 80); doc.rect(cx, startY, w, H, "FD");
    }
    y = startY + H + 8;
  });
  doc.save("rods-cutting.pdf");
}
