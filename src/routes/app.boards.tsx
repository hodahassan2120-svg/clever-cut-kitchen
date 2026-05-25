import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cutBoards, type BoardStock, type BoardPiece, type BoardResult } from "@/lib/cutting";
import { Plus, Trash2, Scissors, FileDown } from "lucide-react";
import { toast } from "sonner";
import { exportBoardsPDF } from "@/lib/pdf";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/app/boards")({ component: BoardsPage });

function BoardsPage() {
  const { user } = useAuth();
  const [useInventory, setUseInventory] = useState(false);
  const [invStocks, setInvStocks] = useState<BoardStock[]>([]);
  const [manualStocks, setManualStocks] = useState<BoardStock[]>([]);
  const [pieces, setPieces] = useState<BoardPiece[]>([]);
  const [result, setResult] = useState<BoardResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("board_inventory").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) setInvStocks(data.map((d) => ({ id: d.id, name: d.name, width: Number(d.width_cm), length: Number(d.length_cm), quantity: d.quantity })));
    });
  }, [user]);

  const stocks = useInventory ? invStocks : manualStocks;

  const newPiece = (n: number): BoardPiece => ({ id: crypto.randomUUID(), label: `مقاس ${n}`, width: 0, length: 0, quantity: 0 });
  const newStock = (n: number): BoardStock => ({ id: crypto.randomUUID(), name: `لوح ${n}`, width: 0, length: 0, quantity: 0 });

  const addPiece = () => setPieces((prev) => [...prev, newPiece(prev.length + 1)]);
  const updPiece = (i: number, patch: Partial<BoardPiece>) => {
    setPieces((prev) => {
      const next = prev.map((p, idx) => idx === i ? { ...p, ...patch } : p);
      // إذا تم ملء العدد في آخر صف، أضف صف جديد تلقائياً
      const last = next[next.length - 1];
      if (i === next.length - 1 && last.quantity > 0 && last.length > 0 && last.width > 0) {
        next.push(newPiece(next.length + 1));
      }
      return next;
    });
  };
  const rmPiece = (i: number) => setPieces(pieces.filter((_, idx) => idx !== i));

  const addStock = () => setManualStocks((prev) => [...prev, newStock(prev.length + 1)]);
  const updStock = (i: number, patch: Partial<BoardStock>) => {
    setManualStocks((prev) => {
      const next = prev.map((s, idx) => idx === i ? { ...s, ...patch } : s);
      const last = next[next.length - 1];
      if (i === next.length - 1 && last.quantity > 0 && last.length > 0 && last.width > 0) {
        next.push(newStock(next.length + 1));
      }
      return next;
    });
  };
  const rmStock = (i: number) => setManualStocks(manualStocks.filter((_, idx) => idx !== i));
  const totalBoards = result?.assignments.length ?? 0;
  const totalPieces = pieces.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  const run = () => {
    const validStocks = stocks.filter((s) => s.width > 0 && s.length > 0 && s.quantity > 0);
    const validPieces = pieces.filter((p) => p.width > 0 && p.length > 0 && p.quantity > 0);
    if (validStocks.length === 0) return toast.error(useInventory ? "لا توجد ألواح صالحة في المخزون" : "أضف لوحاً واحداً على الأقل");
    if (validPieces.length === 0) return toast.error("أضف مقاساً واحداً على الأقل");
    setResult(cutBoards(validStocks, validPieces));
    toast.success("تم حساب التقطيع");
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">تقطيع الألواح</h1>
      <p className="text-sm text-muted-foreground mb-4">احسب أفضل توزيع لمقاساتك بأقل هدر.</p>

      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-border/60 bg-card/40">
        <Switch checked={useInventory} onCheckedChange={setUseInventory} id="useInv" />
        <Label htmlFor="useInv" className="text-sm cursor-pointer">استخدام ألواح المخزون ({invStocks.length})</Label>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {!useInventory && (
            <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
              <h2 className="font-semibold mb-3">الألواح المتوفرة (سم)</h2>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-right min-w-24">الطول</TableHead><TableHead className="text-right min-w-24">العرض</TableHead><TableHead className="text-right min-w-20">العدد</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
                  <TableBody>
                    {manualStocks.length === 0 && <TableRow><TableCell colSpan={4} className="h-20 text-center text-sm text-muted-foreground">اضغط "إضافة لوح" لبدء إدخال المقاسات.</TableCell></TableRow>}
                    {manualStocks.map((s, i) => (
                      <TableRow key={s.id}>
                        <TableCell><Input className="h-10 min-w-24 text-base tabular-nums" inputMode="decimal" type="number" min="0" placeholder="0" value={s.length || ""} onChange={(e) => updStock(i, { length: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-10 min-w-24 text-base tabular-nums" inputMode="decimal" type="number" min="0" placeholder="0" value={s.width || ""} onChange={(e) => updStock(i, { width: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-10 min-w-20 text-base tabular-nums" inputMode="numeric" type="number" min="0" placeholder="0" value={s.quantity || ""} onChange={(e) => updStock(i, { quantity: +e.target.value })} /></TableCell>
                        <TableCell><Button size="icon" variant="ghost" onClick={() => rmStock(i)} className="h-10 w-10"><Trash2 className="size-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={addStock} variant="outline" size="sm" className="mt-3"><Plus className="size-3.5" /> إضافة لوح</Button>
            </div>
          )}

          <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
            <h2 className="font-semibold mb-3">المقاسات المطلوبة (سم)</h2>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-right min-w-24">الطول</TableHead><TableHead className="text-right min-w-24">العرض</TableHead><TableHead className="text-right min-w-20">العدد</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
                  <TableBody>
                    {pieces.length === 0 && <TableRow><TableCell colSpan={4} className="h-20 text-center text-sm text-muted-foreground">اضغط "إضافة مقاس" للبدء.</TableCell></TableRow>}
                    {pieces.map((p, i) => (
                      <TableRow key={p.id}>
                        <TableCell><Input className="h-10 min-w-24 text-base tabular-nums" inputMode="decimal" type="number" min="0" placeholder="0" value={p.length || ""} onChange={(e) => updPiece(i, { length: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-10 min-w-24 text-base tabular-nums" inputMode="decimal" type="number" min="0" placeholder="0" value={p.width || ""} onChange={(e) => updPiece(i, { width: +e.target.value })} /></TableCell>
                        <TableCell><Input className="h-10 min-w-20 text-base tabular-nums" inputMode="numeric" type="number" min="0" placeholder="0" value={p.quantity || ""} onChange={(e) => updPiece(i, { quantity: +e.target.value })} /></TableCell>
                        <TableCell><Button size="icon" variant="ghost" onClick={() => rmPiece(i)} className="h-10 w-10"><Trash2 className="size-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            <Button onClick={addPiece} variant="outline" size="sm" className="mt-3"><Plus className="size-3.5" /> إضافة مقاس</Button>
            <Button onClick={run} className="w-full mt-4 bg-gradient-primary shadow-glow"><Scissors className="size-4" /> حساب التقطيع</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <h2 className="font-semibold mb-3">النتيجة</h2>
          {!result ? <p className="text-sm text-muted-foreground">اضغط "حساب التقطيع" لعرض النتائج.</p> : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-muted/30 p-2">عدد الألواح: <span className="text-gold font-bold">{totalBoards}</span></div>
                <div className="rounded-lg bg-muted/30 p-2">إجمالي المقاسات: <span className="font-bold">{totalPieces}</span></div>
                <div className="rounded-lg bg-muted/30 p-2">الهدر: <span className="text-gold font-bold">{(result.totalWaste / 10000).toFixed(2)} م²</span></div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => exportBoardsPDF(result)}><FileDown className="size-3.5" /> PDF</Button>
              </div>
              {result.unfulfilled.length > 0 && <div className="text-sm text-destructive">مقاسات لم تتسع: {result.unfulfilled.map(u => `${u.label}(×${u.quantity})`).join(", ")}</div>}
              {result.assignments.map((a, idx) => {
                const aspectRatio = a.stockWidth / a.stockLength;
                const W = 280; const H = W / aspectRatio;
                const sx = W / a.stockWidth; const sy = H / a.stockLength;
                return (
                  <div key={idx} className="rounded-lg border border-border/40 p-3">
                    <div className="text-sm font-semibold mb-2">{a.stockName} #{a.index} — {a.stockWidth}×{a.stockLength} سم</div>
                    <svg width={W} height={H} className="border border-border bg-background">
                      {a.placed.map((p, j) => (
                        <g key={j}>
                          <rect x={p.x * sx} y={p.y * sy} width={p.w * sx} height={p.h * sy} fill="#c2956b" stroke="#000" />
                          <text x={p.x * sx + (p.w * sx) / 2} y={p.y * sy + (p.h * sy) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#000">{p.w}×{p.h}</text>
                        </g>
                      ))}
                    </svg>
                    <div className="text-xs text-muted-foreground mt-1">استخدام: {((a.usedArea / (a.stockWidth * a.stockLength)) * 100).toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6"><AdSlot /></div>
    </div>
  );
}
