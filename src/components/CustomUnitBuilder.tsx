// منشئ الوحدة المخصصة — حوار يختار فيه المستخدم نوع التركيب والمواصفات والمقاسات
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus } from "lucide-react";
import type { PlacedBlock } from "@/lib/blocks";
import { toast } from "sonner";

type Placement = "base" | "wall" | "tall";

interface Props {
  open: boolean;
  onClose: () => void;
  unit: "cm" | "m";
  defaultColor: string;
  onAdd: (block: PlacedBlock) => void;
}

const PLACEMENT_DEFAULTS: Record<Placement, { w: number; d: number; h: number; label: string }> = {
  base: { w: 60, d: 60, h: 85, label: "سفلية" },
  wall: { w: 60, d: 35, h: 70, label: "علوية" },
  tall: { w: 60, d: 60, h: 220, label: "طولية (دولاب)" },
};

export function CustomUnitBuilder({ open, onClose, unit, defaultColor, onAdd }: Props) {
  const [placement, setPlacement] = useState<Placement>("base");
  const [doors, setDoors] = useState(2);
  const [drawers, setDrawers] = useState(0);
  const [glass, setGlass] = useState(false);
  const [corner, setCorner] = useState(false);
  const [cabinet, setCabinet] = useState(false);
  const [color, setColor] = useState(defaultColor);
  const [customColor, setCustomColor] = useState(false);
  const mul = unit === "m" ? 100 : 1;
  const def = PLACEMENT_DEFAULTS[placement];
  const [width, setWidth] = useState((def.w / (unit === "m" ? 100 : 1)).toString());
  const [depth, setDepth] = useState((def.d / (unit === "m" ? 100 : 1)).toString());
  const [height, setHeight] = useState((def.h / (unit === "m" ? 100 : 1)).toString());
  const [notes, setNotes] = useState("");

  const pickPlacement = (p: Placement) => {
    setPlacement(p);
    const d = PLACEMENT_DEFAULTS[p];
    setWidth((d.w / mul).toString());
    setDepth((d.d / mul).toString());
    setHeight((d.h / mul).toString());
    if (p === "tall") setCabinet(true);
  };

  const reset = () => {
    setPlacement("base"); setDoors(2); setDrawers(0); setGlass(false);
    setCorner(false); setCabinet(false); setNotes(""); setCustomColor(false);
  };

  const handleAdd = () => {
    const w = parseFloat(width), d = parseFloat(depth), h = parseFloat(height);
    if (!w || !d || !h) return toast.error("أدخل جميع المقاسات");
    if (doors + drawers === 0 && !glass) return toast.error("اختر على الأقل ضلفة أو درج");

    const parts: string[] = [];
    if (cabinet) parts.push("دولاب");
    else parts.push(PLACEMENT_DEFAULTS[placement].label);
    if (corner) parts.push("ركنية");
    if (doors > 0) parts.push(`${doors} ${glass ? "زجاج" : "ضلف"}`);
    if (drawers > 0) parts.push(`${drawers} أدراج`);

    const block: PlacedBlock = {
      id: crypto.randomUUID(),
      type: `custom_${placement}`,
      name: parts.join(" + "),
      color,
      x: 20, y: 20,
      width: w * mul, depth: d * mul, height: h * mul,
      rotation: 0,
      placement, doors, drawers, glass, corner, cabinet,
      customColor,
      notes: notes || undefined,
    };
    onAdd(block);
    toast.success("تم إضافة الوحدة");
    reset();
    onClose();
  };

  const Counter = ({ value, set, max = 4, label }: { value: number; set: (n: number) => void; max?: number; label: string }) => (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/30">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1.5">
        <Button type="button" size="icon" variant="outline" className="size-7" onClick={() => set(Math.max(0, value - 1))}><Minus className="size-3.5" /></Button>
        <span className="w-6 text-center text-sm font-bold tabular-nums">{value}</span>
        <Button type="button" size="icon" variant="outline" className="size-7" onClick={() => set(Math.min(max, value + 1))}><Plus className="size-3.5" /></Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء وحدة مخصصة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* نوع التركيب */}
          <div>
            <Label className="text-xs mb-2 block">نوع التركيب</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["base", "wall", "tall"] as Placement[]).map((p) => (
                <button
                  key={p}
                  onClick={() => pickPlacement(p)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition ${placement === p ? "border-primary bg-primary/10 text-primary" : "border-border/60 hover:border-primary/40"}`}
                >
                  {PLACEMENT_DEFAULTS[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* الضلف والأدراج */}
          <div className="space-y-2">
            <Counter value={doors} set={setDoors} label="عدد الضلف (حد أقصى 4)" />
            <Counter value={drawers} set={setDrawers} label="عدد الأدراج (حد أقصى 4)" />
          </div>

          {/* خيارات إضافية */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60">
              <Label htmlFor="glass" className="text-sm cursor-pointer">ضلفة زجاج</Label>
              <Switch id="glass" checked={glass} onCheckedChange={setGlass} disabled={doors === 0} />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60">
              <Label htmlFor="corner" className="text-sm cursor-pointer">وحدة ركنية</Label>
              <Switch id="corner" checked={corner} onCheckedChange={setCorner} />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60">
              <Label htmlFor="cabinet" className="text-sm cursor-pointer">دولاب (ارتفاع كامل)</Label>
              <Switch id="cabinet" checked={cabinet} onCheckedChange={(v) => { setCabinet(v); if (v) pickPlacement("tall"); }} />
            </div>
          </div>

          {/* المقاسات */}
          <div>
            <Label className="text-xs mb-2 block">المقاسات ({unit})</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">العرض</Label>
                <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">العمق</Label>
                <Input type="number" value={depth} onChange={(e) => setDepth(e.target.value)} />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">الارتفاع</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
            </div>
          </div>

          {/* اللون */}
          <div>
            <Label className="text-xs mb-2 block">اللون</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setCustomColor(true); }} className="h-10 w-16 rounded cursor-pointer bg-transparent border border-border/60" />
              <Input value={color} onChange={(e) => { setColor(e.target.value); setCustomColor(true); }} className="flex-1 font-mono text-xs" />
            </div>
            <label className="flex items-center gap-2 mt-2 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={customColor} onChange={(e) => setCustomColor(e.target.checked)} />
              لون مخصص (لا يتأثر باللون العام)
            </label>
          </div>

          {/* ملاحظات */}
          <div>
            <Label className="text-xs">تفاصيل إضافية (اختياري)</Label>
            <Textarea placeholder="مثال: مكان للأنابيب / فتحة سلك" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>إلغاء</Button>
          <Button onClick={handleAdd} className="bg-gradient-primary"><Plus className="size-4" /> إضافة</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
