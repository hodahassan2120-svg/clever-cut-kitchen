import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cutRods, type RodStock, type RodPiece, type RodResult } from "@/lib/cutting";
import { Plus, Trash2, Scissors, FileDown } from "lucide-react";
import { toast } from "sonner";
import { exportRodsPDF } from "@/lib/pdf";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/app/rods")({ component: RodsPage });

function RodsPage() {
  const { user } = useAuth();
  const [useInventory, setUseInventory] = useState(false);
  const [invStocks, setInvStocks] = useState<RodStock[]>([]);
  const [manualStocks, setManualStocks] = useState<RodStock[]>([]);
  const [pieces, setPieces] = useState<RodPiece[]>([]);
  const [result, setResult] = useState<RodResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("rod_inventory").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) setInvStocks(data.map((d) => ({ id: d.id, name: d.name, length: Number(d.length_cm), quantity: d.quantity })));
    });
  }, [user]);

  const stocks = useInventory ? invStocks : manualStocks;

  const run = () => {
    const validStocks = stocks.filter((s) => s.length > 0 && s.quantity > 0);
    const validPieces = pieces.filter((p) => p.length > 0 && p.quantity > 0);
    if (validStocks.length === 0) return toast.error(useInventory ? "لا توجد أعواد صالحة في المخزون" : "أضف عوداً واحداً على الأقل");
    if (validPieces.length === 0) return toast.error("أضف قطعة واحدة على الأقل");
    setResult(cutRods(validStocks, validPieces));
    toast.success("تم حساب التقطيع");
  };

  const updStock = (i: number, patch: Partial<RodStock>) => setManualStocks(manualStocks.map((s, idx) => idx === i ? { ...s, ...patch } : s));

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">تقطيع الأعواد</h1>
      <p className="text-sm text-muted-foreground mb-4">حساب أمثل لتوزيع قطعك على الأعواد المتوفرة.</p>

      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-border/60 bg-card/40">
        <Switch checked={useInventory} onCheckedChange={setUseInventory} id="useInv" />
        <Label htmlFor="useInv" className="text-sm cursor-pointer">استخدام أعواد المخزون ({invStocks.length})</Label>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {!useInventory && (
            <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
              <h2 className="font-semibold mb-3">الأعواد المتوفرة (سم)</h2>
              <div className="space-y-2">
                {manualStocks.length === 0 && <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-center text-sm text-muted-foreground">أضف مقاس العود بدون بيانات تجريبية.</div>}
                {manualStocks.map((s, i) => (
                  <div key={s.id} className="grid grid-cols-2 md:grid-cols-12 gap-2 items-end rounded-xl border border-border/40 p-2">
                    <div className="col-span-2 md:col-span-4"><Label className="text-xs">الاسم</Label><Input className="h-11 text-base" value={s.name} onChange={(e) => updStock(i, { name: e.target.value })} /></div>
                    <div className="md:col-span-4"><Label className="text-xs">الطول</Label><Input className="h-11 text-base tabular-nums" inputMode="decimal" type="number" min="0" placeholder="0" value={s.length || ""} onChange={(e) => updStock(i, { length: +e.target.value })} /></div>
                    <div className="md:col-span-3"><Label className="text-xs">الكمية</Label><Input className="h-11 text-base tabular-nums" inputMode="numeric" type="number" min="1" placeholder="1" value={s.quantity || ""} onChange={(e) => updStock(i, { quantity: +e.target.value })} /></div>
                    <div className="md:col-span-1"><Button size="icon" variant="ghost" className="h-11 w-11" onClick={() => setManualStocks(manualStocks.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button></div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setManualStocks([...manualStocks, { id: crypto.randomUUID(), name: `عود ${manualStocks.length + 1}`, length: 0, quantity: 1 }])} variant="outline" size="sm" className="mt-3"><Plus className="size-3.5" /> إضافة عود</Button>
            </div>
          )}

          <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
            <h2 className="font-semibold mb-3">القطع المطلوبة (سم)</h2>
              <div className="space-y-2">
                {pieces.length === 0 && <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-center text-sm text-muted-foreground">أضف القطع المطلوبة للبدء.</div>}
              {pieces.map((p, i) => (
                  <div key={p.id} className="grid grid-cols-2 md:grid-cols-12 gap-2 items-end rounded-xl border border-border/40 p-2">
                    <div className="col-span-2 md:col-span-4"><Label className="text-xs">الاسم</Label><Input className="h-11 text-base" value={p.label} onChange={(e) => setPieces(pieces.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} /></div>
                    <div className="md:col-span-4"><Label className="text-xs">الطول</Label><Input className="h-11 text-base tabular-nums" inputMode="decimal" type="number" min="0" placeholder="0" value={p.length || ""} onChange={(e) => setPieces(pieces.map((x, j) => j === i ? { ...x, length: +e.target.value } : x))} /></div>
                    <div className="md:col-span-3"><Label className="text-xs">الكمية</Label><Input className="h-11 text-base tabular-nums" inputMode="numeric" type="number" min="1" placeholder="1" value={p.quantity || ""} onChange={(e) => setPieces(pieces.map((x, j) => j === i ? { ...x, quantity: +e.target.value } : x))} /></div>
                    <div className="md:col-span-1"><Button size="icon" variant="ghost" className="h-11 w-11" onClick={() => setPieces(pieces.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button></div>
                </div>
              ))}
            </div>
            <Button onClick={() => setPieces([...pieces, { id: crypto.randomUUID(), label: `قطعة ${pieces.length + 1}`, length: 0, quantity: 1 }])} variant="outline" size="sm" className="mt-3"><Plus className="size-3.5" /> إضافة قطعة</Button>
            <Button onClick={run} className="w-full mt-4 bg-gradient-primary shadow-glow"><Scissors className="size-4" /> حساب التقطيع</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
          <h2 className="font-semibold mb-3">النتيجة</h2>
          {!result ? <p className="text-sm text-muted-foreground">اضغط "حساب التقطيع" لعرض النتائج.</p> : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">الهدر: <span className="text-gold font-bold">{result.totalWaste.toFixed(1)} سم</span></div>
                <Button size="sm" variant="outline" onClick={() => exportRodsPDF(result)}><FileDown className="size-3.5" /> PDF</Button>
              </div>
              {result.unfulfilled.length > 0 && <div className="text-sm text-destructive">قطع لم تتسع: {result.unfulfilled.map(u => `${u.label}(×${u.quantity})`).join(", ")}</div>}
              {result.assignments.map((a, idx) => (
                <div key={idx} className="rounded-lg border border-border/40 p-3">
                  <div className="text-sm font-semibold mb-2">{a.stockName} #{a.index} — {a.stockLength} سم</div>
                  <div className="flex h-8 rounded overflow-hidden border border-border bg-background" dir="ltr">
                    {a.cuts.map((c, j) => (
                      <div key={j} style={{ width: `${(c.length / a.stockLength) * 100}%` }} className="bg-primary border-l border-black flex items-center justify-center text-[10px] text-primary-foreground font-semibold">
                        {c.length}
                      </div>
                    ))}
                    {a.waste > 0 && (
                      <div style={{ width: `${(a.waste / a.stockLength) * 100}%` }} className="bg-destructive/40 flex items-center justify-center text-[10px]">
                        {a.waste.toFixed(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">استخدام: {((a.used / a.stockLength) * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6"><AdSlot /></div>
    </div>
  );
}
