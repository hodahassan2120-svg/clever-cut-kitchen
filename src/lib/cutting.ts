// 1D bin packing — first-fit decreasing for rod cutting
export interface RodStock { id: string; length: number; quantity: number; name: string; }
export interface RodPiece { id: string; length: number; quantity: number; label?: string; }
export interface RodAssignment { stockId: string; stockName: string; stockLength: number; index: number; cuts: { label: string; length: number }[]; used: number; waste: number; }
export interface RodResult { assignments: RodAssignment[]; unfulfilled: { label: string; length: number; quantity: number }[]; totalWaste: number; }

export function cutRods(stocks: RodStock[], pieces: RodPiece[], kerf = 0): RodResult {
  // Expand pieces
  const items: { label: string; length: number }[] = [];
  for (const p of pieces) {
    for (let i = 0; i < p.quantity; i++) items.push({ label: p.label ?? p.id, length: p.length });
  }
  items.sort((a, b) => b.length - a.length);

  // Track available stock pool
  const pool: { stockId: string; name: string; length: number; index: number; remaining: number; cuts: { label: string; length: number }[] }[] = [];
  const stockCounter: Record<string, number> = {};
  for (const s of stocks) {
    stockCounter[s.id] = 0;
  }

  const unfulfilled: Record<string, { label: string; length: number; quantity: number }> = {};

  for (const item of items) {
    // Try existing opened stocks
    let placed = false;
    for (const bin of pool) {
      if (bin.remaining >= item.length + (bin.cuts.length > 0 ? kerf : 0)) {
        const used = item.length + (bin.cuts.length > 0 ? kerf : 0);
        bin.remaining -= used;
        bin.cuts.push(item);
        placed = true;
        break;
      }
    }
    if (placed) continue;
    // Open a new stock that fits
    const stock = stocks.find((s) => s.length >= item.length && stockCounter[s.id] < s.quantity);
    if (stock) {
      stockCounter[stock.id]++;
      pool.push({
        stockId: stock.id,
        name: stock.name,
        length: stock.length,
        index: stockCounter[stock.id],
        remaining: stock.length - item.length,
        cuts: [item],
      });
    } else {
      const key = `${item.label}-${item.length}`;
      if (!unfulfilled[key]) unfulfilled[key] = { label: item.label, length: item.length, quantity: 0 };
      unfulfilled[key].quantity++;
    }
  }

  const assignments: RodAssignment[] = pool.map((b) => ({
    stockId: b.stockId,
    stockName: b.name,
    stockLength: b.length,
    index: b.index,
    cuts: b.cuts,
    used: b.length - b.remaining,
    waste: b.remaining,
  }));
  const totalWaste = assignments.reduce((a, b) => a + b.waste, 0);
  return { assignments, unfulfilled: Object.values(unfulfilled), totalWaste };
}

// 2D guillotine bin packing for boards (simple, good-enough)
export interface BoardStock { id: string; name: string; width: number; length: number; quantity: number; }
export interface BoardPiece { id: string; label?: string; width: number; length: number; quantity: number; canRotate?: boolean; }
export interface PlacedPiece { label: string; x: number; y: number; w: number; h: number; rotated: boolean; }
export interface BoardAssignment { stockId: string; stockName: string; stockWidth: number; stockLength: number; index: number; placed: PlacedPiece[]; usedArea: number; wasteArea: number; }
export interface BoardResult { assignments: BoardAssignment[]; unfulfilled: { label: string; width: number; length: number; quantity: number }[]; totalWaste: number; }

interface FreeRect { x: number; y: number; w: number; h: number; }

function place(free: FreeRect[], pw: number, ph: number): { rect: FreeRect; rotated: boolean } | null {
  let best: { idx: number; rotated: boolean; score: number } | null = null;
  for (let i = 0; i < free.length; i++) {
    const r = free[i];
    if (r.w >= pw && r.h >= ph) {
      const score = Math.min(r.w - pw, r.h - ph);
      if (!best || score < best.score) best = { idx: i, rotated: false, score };
    }
    if (r.w >= ph && r.h >= pw) {
      const score = Math.min(r.w - ph, r.h - pw);
      if (!best || score < best.score) best = { idx: i, rotated: true, score };
    }
  }
  if (!best) return null;
  const rect = free[best.idx];
  free.splice(best.idx, 1);
  return { rect, rotated: best.rotated };
}

function splitFree(free: FreeRect[], rect: FreeRect, pw: number, ph: number) {
  // Right strip
  if (rect.w - pw > 0) free.push({ x: rect.x + pw, y: rect.y, w: rect.w - pw, h: ph });
  // Bottom strip
  if (rect.h - ph > 0) free.push({ x: rect.x, y: rect.y + ph, w: rect.w, h: rect.h - ph });
}

export function cutBoards(stocks: BoardStock[], pieces: BoardPiece[]): BoardResult {
  const items: { label: string; w: number; h: number; canRotate: boolean }[] = [];
  for (const p of pieces) {
    for (let i = 0; i < p.quantity; i++) {
      items.push({ label: p.label ?? p.id, w: p.width, h: p.length, canRotate: p.canRotate ?? true });
    }
  }
  items.sort((a, b) => b.w * b.h - a.w * a.h);

  interface Bin { stockId: string; name: string; W: number; H: number; idx: number; placed: PlacedPiece[]; free: FreeRect[]; }
  const bins: Bin[] = [];
  const stockCounter: Record<string, number> = {};
  for (const s of stocks) stockCounter[s.id] = 0;
  const unfulfilled: Record<string, { label: string; width: number; length: number; quantity: number }> = {};

  for (const item of items) {
    let placedOk = false;
    for (const bin of bins) {
      const r = place(bin.free, item.w, item.h);
      if (r) {
        const pw = r.rotated ? item.h : item.w;
        const ph = r.rotated ? item.w : item.h;
        bin.placed.push({ label: item.label, x: r.rect.x, y: r.rect.y, w: pw, h: ph, rotated: r.rotated });
        splitFree(bin.free, r.rect, pw, ph);
        placedOk = true;
        break;
      }
    }
    if (placedOk) continue;
    const stock = stocks.find((s) => (s.width >= item.w && s.length >= item.h || (item.canRotate && s.width >= item.h && s.length >= item.w)) && stockCounter[s.id] < s.quantity);
    if (stock) {
      stockCounter[stock.id]++;
      const bin: Bin = { stockId: stock.id, name: stock.name, W: stock.width, H: stock.length, idx: stockCounter[stock.id], placed: [], free: [{ x: 0, y: 0, w: stock.width, h: stock.length }] };
      const r = place(bin.free, item.w, item.h)!;
      const pw = r.rotated ? item.h : item.w;
      const ph = r.rotated ? item.w : item.h;
      bin.placed.push({ label: item.label, x: r.rect.x, y: r.rect.y, w: pw, h: ph, rotated: r.rotated });
      splitFree(bin.free, r.rect, pw, ph);
      bins.push(bin);
    } else {
      const key = `${item.label}-${item.w}x${item.h}`;
      if (!unfulfilled[key]) unfulfilled[key] = { label: item.label, width: item.w, length: item.h, quantity: 0 };
      unfulfilled[key].quantity++;
    }
  }

  const assignments: BoardAssignment[] = bins.map((b) => {
    const usedArea = b.placed.reduce((a, p) => a + p.w * p.h, 0);
    return { stockId: b.stockId, stockName: b.name, stockWidth: b.W, stockLength: b.H, index: b.idx, placed: b.placed, usedArea, wasteArea: b.W * b.H - usedArea };
  });
  const totalWaste = assignments.reduce((a, b) => a + b.wasteArea, 0);
  return { assignments, unfulfilled: Object.values(unfulfilled), totalWaste };
}
