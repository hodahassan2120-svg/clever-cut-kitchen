import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cutBoards, type BoardStock, type BoardPiece, type BoardResult } from "@/lib/cutting";
import { Plus, Trash2, Scissors } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/boards")({ component: BoardsPage });

function BoardsPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<BoardStock[]>([]);
  const [pieces, setPieces] = useState<BoardPiece[]>([{ id: crypto.randomUUID(), label: "قطعة 1", width: 60, length: 80, quantity: 4 }]);
  const [result, setResult] = useState<BoardResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("board_inventory").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) setStocks(data.map((d) => ({ id: d.id, name: d.name, width: Number(d.width_cm), length: Number(d.length_cm), quantity: d.quantity })));
    });
  }, [user]);

  const addPiece = () => setPieces([...pieces, { id: crypto.randomUUID(), label: `قطعة ${pieces.length + 1}`, width: 50, length: 50, quantity: 1 }]);
  const updPiece = (i: number, patch: Partial<BoardPiece>) => setPieces(pieces.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  const rmPiece = (i: number) => setPieces(pieces.filter((_, idx) => idx !== i));

  const run = () => {
    if (stocks.length === 0) return toast.error("أضف ألواحاً في المخزون أولاً");
    setResult(cutBoards(stocks, pieces));
    toast.success("تم حساب التقطيع");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">تقطيع الألواح</h1>
      <p className="text-sm text-muted-foreground mb-6">احسب أفضل توزيع لقطعك على الألواح المتوفرة في مخزونك بأقل هدر.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <h2 className="font-semibold mb-3">القطع المطلوبة (سم)</h2>
          <div className="space-y-2">
            {pieces.map((p, i) => (
              <div key={p.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3"><Label className="text-xs">الاسم</Label><Input value={p.label} onChange={(e) => updPiece(i, { label: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">العرض</Label><Input type="number" value={p.width} onChange={(e) => updPiece(i, { width: +e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">الطول</Label><Input type="number" value={p.length} onChange={(e) => updPiece(i, { length: +e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">الكمية</Label><Input type="number" value={p.quantity} onChange={(e) => updPiece(i, { quantity: +e.target.value })} /></div>
                <div className="col-span-3 flex gap-1"><Button size="sm" variant="ghost" onClick={() => rmPiece(i)}><Trash2 className="size-3.5 text-destructive" /></Button></div>
              </div>
            ))}
          </div>
          <Button onClick={addPiece} variant="outline" size="sm" className="mt-3"><Plus className="size-3.5" /> إضافة قطعة</Button>
          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="text-sm text-muted-foreground mb-2">ألواح المخزون المتوفرة: <span className="text-foreground font-semibold">{stocks.length}</span></div>
            <Button onClick={run} className="w-full bg-gradient-primary shadow-glow"><Scissors className="size-4" /> حساب التقطيع</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <h2 className="font-semibold mb-3">النتيجة</h2>
          {!result ? <p className="text-sm text-muted-foreground">اضغط "حساب التقطيع" لعرض النتائج.</p> : (
            <div className="space-y-4">
              <div className="text-sm">الهدر الإجمالي: <span className="text-gold font-bold">{(result.totalWaste / 10000).toFixed(2)} م²</span></div>
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
    </div>
  );
}
