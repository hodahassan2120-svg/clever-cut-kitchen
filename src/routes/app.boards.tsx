import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  const [manualStocks, setManualStocks] = useState<BoardStock[]>([
    { id: crypto.randomUUID(), name: "لوح", width: 122, length: 244, quantity: 2 },
  ]);
  const [pieces, setPieces] = useState<BoardPiece[]>([{ id: crypto.randomUUID(), label: "قطعة 1", width: 60, length: 80, quantity: 4 }]);
  const [result, setResult] = useState<BoardResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("board_inventory").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) setInvStocks(data.map((d) => ({ id: d.id, name: d.name, width: Number(d.width_cm), length: Number(d.length_cm), quantity: d.quantity })));
    });
  }, [user]);

  const stocks = useInventory ? invStocks : manualStocks;

  const addPiece = () => setPieces([...pieces, { id: crypto.randomUUID(), label: `قطعة ${pieces.length + 1}`, width: 50, length: 50, quantity: 1 }]);
  const updPiece = (i: number, patch: Partial<BoardPiece>) => setPieces(pieces.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  const rmPiece = (i: number) => setPieces(pieces.filter((_, idx) => idx !== i));

  const addStock = () => setManualStocks([...manualStocks, { id: crypto.randomUUID(), name: `لوح ${manualStocks.length + 1}`, width: 122, length: 244, quantity: 1 }]);
  const updStock = (i: number, patch: Partial<BoardStock>) => setManualStocks(manualStocks.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  const rmStock = (i: number) => setManualStocks(manualStocks.filter((_, idx) => idx !== i));

  const run = () => {
    if (stocks.length === 0) return toast.error(useInventory ? "لا توجد ألواح في المخزون" : "أضف لوحاً واحداً على الأقل");
    setResult(cutBoards(stocks, pieces));
    toast.success("تم حساب التقطيع");
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">تقطيع الألواح</h1>
      <p className="text-sm text-muted-foreground mb-4">احسب أفضل توزيع لقطعك بأقل هدر.</p>

      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-border/60 bg-card/40">
        <Switch checked={useInventory} onCheckedChange={setUseInventory} id="useInv" />
        <Label htmlFor="useInv" className="text-sm cursor-pointer">استخدام ألواح المخزون ({invStocks.length})</Label>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {!useInventory && (
            <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
              <h2 className="font-semibold mb-3">الألواح المتوفرة (سم)</h2>
              <div className="space-y-2">
                {manualStocks.map((s, i) => (
                  <div key={s.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3"><Label className="text-xs">الاسم</Label><Input value={s.name} onChange={(e) => updStock(i, { name: e.target.value })} /></div>
                    <div className="col-span-2"><Label className="text-xs">العرض</Label><Input type="number" value={s.width} onChange={(e) => updStock(i, { width: +e.target.value })} /></div>
                    <div className="col-span-2"><Label className="text-xs">الطول</Label><Input type="number" value={s.length} onChange={(e) => updStock(i, { length: +e.target.value })} /></div>
                    <div className="col-span-2"><Label className="text-xs">الكمية</Label><Input type="number" value={s.quantity} onChange={(e) => updStock(i, { quantity: +e.target.value })} /></div>
                    <div className="col-span-3"><Button size="sm" variant="ghost" onClick={() => rmStock(i)}><Trash2 className="size-3.5 text-destructive" /></Button></div>
                  </div>
                ))}
              </div>
              <Button onClick={addStock} variant="outline" size="sm" className="mt-3"><Plus className="size-3.5" /> إضافة لوح</Button>
            </div>
          )}

          <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
            <h2 className="font-semibold mb-3">القطع المطلوبة (سم)</h2>
            <div className="space-y-2">
              {pieces.map((p, i) => (
                <div key={p.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3"><Label className="text-xs">الاسم</Label><Input value={p.label} onChange={(e) => updPiece(i, { label: e.target.value })} /></div>
                  <div className="col-span-2"><Label className="text-xs">العرض</Label><Input type="number" value={p.width} onChange={(e) => updPiece(i, { width: +e.target.value })} /></div>
                  <div className="col-span-2"><Label className="text-xs">الطول</Label><Input type="number" value={p.length} onChange={(e) => updPiece(i, { length: +e.target.value })} /></div>
                  <div className="col-span-2"><Label className="text-xs">الكمية</Label><Input type="number" value={p.quantity} onChange={(e) => updPiece(i, { quantity: +e.target.value })} /></div>
                  <div className="col-span-3"><Button size="sm" variant="ghost" onClick={() => rmPiece(i)}><Trash2 className="size-3.5 text-destructive" /></Button></div>
                </div>
              ))}
            </div>
            <Button onClick={addPiece} variant="outline" size="sm" className="mt-3"><Plus className="size-3.5" /> إضافة قطعة</Button>
            <Button onClick={run} className="w-full mt-4 bg-gradient-primary shadow-glow"><Scissors className="size-4" /> حساب التقطيع</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <h2 className="font-semibold mb-3">النتيجة</h2>
          {!result ? <p className="text-sm text-muted-foreground">اضغط "حساب التقطيع" لعرض النتائج.</p> : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">الهدر: <span className="text-gold font-bold">{(result.totalWaste / 10000).toFixed(2)} م²</span></div>
                <Button size="sm" variant="outline" onClick={() => exportBoardsPDF(result)}><FileDown className="size-3.5" /> PDF</Button>
              </div>
              {result.unfulfilled.length > 0 && <div className="text-sm text-destructive">قطع لم تتسع: {result.unfulfilled.map(u => `${u.label}(×${u.quantity})`).join(", ")}</div>}
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
                          <text x={p.x * sx + (p.w * sx) / 2} y={p.y * sy + (p.h * sy) / 2} textAnchor="middle" fontSize="9" fill="#000">{p.label}</text>
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
