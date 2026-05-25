import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Line, Text as KText, Group } from "react-konva";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { KITCHEN_BLOCKS, CATEGORY_LABELS, DEFAULT_DESIGN, type DesignDoc, type KitchenBlock, type PlacedBlock } from "@/lib/blocks";
import { BlockIcon } from "@/components/BlockIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CustomUnitBuilder } from "@/components/CustomUnitBuilder";
import { Cabinet3D } from "@/components/Cabinet3D";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Save, Plus, Trash2, LayoutGrid, Settings2, Wand2, Palette, FolderOpen, Ruler, PenLine, RotateCw, Pencil, X } from "lucide-react";
import type Konva from "konva";

export const Route = createFileRoute("/app/design")({
  component: DesignEditor,
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
});

function DesignEditor() {
  const { user } = useAuth();
  const { id } = Route.useSearch();
  const [doc, setDoc] = useState<DesignDoc>(DEFAULT_DESIGN);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("تصميم جديد");
  const [designId, setDesignId] = useState<string | null>(null);
  const [unit, setUnit] = useState<"cm" | "m">("cm");
  const [pendingBlock, setPendingBlock] = useState<KitchenBlock | null>(null);
  const [pendingDims, setPendingDims] = useState({ width: "", depth: "", height: "", notes: "" });
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editorStarted, setEditorStarted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDims, setEditDims] = useState({ width: "", depth: "", height: "", notes: "" });
  const [setupRoom, setSetupRoom] = useState({ name: "تصميم جديد", width: "400", depth: "300", shape: "rectangle" as "rectangle" | "l_shape", cutoutWidth: "100", cutoutDepth: "100" });
  const [savedRows, setSavedRows] = useState<{ id: string; name: string; updated_at: string }[]>([]);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 360, h: 400 });

  useEffect(() => {
    if (!id || !user) return;
    supabase.from("designs").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) {
        setDoc({ ...DEFAULT_DESIGN, ...(data.data as unknown as DesignDoc) });
        setName(data.name);
        setDesignId(data.id);
        setEditorStarted(true);
      }
    });
  }, [id, user]);

  useEffect(() => {
    if (!user || id) return;
    supabase.from("designs").select("id,name,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).then(({ data }) => {
      setSavedRows(data ?? []);
    });
  }, [id, user]);

  const startNewDesign = () => {
    const roomWidth = unit === "m" ? parseFloat(setupRoom.width) * 100 : parseFloat(setupRoom.width);
    const roomDepth = unit === "m" ? parseFloat(setupRoom.depth) * 100 : parseFloat(setupRoom.depth);
    const cutoutWidth = unit === "m" ? parseFloat(setupRoom.cutoutWidth) * 100 : parseFloat(setupRoom.cutoutWidth);
    const cutoutDepth = unit === "m" ? parseFloat(setupRoom.cutoutDepth) * 100 : parseFloat(setupRoom.cutoutDepth);
    if (!roomWidth || !roomDepth) return toast.error("أدخل مقاسات الغرفة");
    setName(setupRoom.name || "تصميم جديد");
    setDesignId(null);
    setSelectedId(null);
    setDoc({
      ...DEFAULT_DESIGN,
      roomWidth,
      roomDepth,
      roomShape: setupRoom.shape,
      cutoutWidth: setupRoom.shape === "l_shape" ? Math.min(cutoutWidth || 0, roomWidth - 50) : 0,
      cutoutDepth: setupRoom.shape === "l_shape" ? Math.min(cutoutDepth || 0, roomDepth - 50) : 0,
      blocks: [],
    });
    setEditorStarted(true);
  };

  // Responsive stage size — measure container
  useLayoutEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setStageSize({ w: Math.max(280, r.width - 8), h: Math.max(280, r.height - 8) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [editorStarted]);

  // Auto-fit scale: room fits inside stageSize with padding
  const PAD = 40;
  const scaleX = (stageSize.w - PAD * 2) / doc.roomWidth;
  const scaleY = (stageSize.h - PAD * 2) / doc.roomDepth;
  const scale = Math.max(0.3, Math.min(scaleX, scaleY));

  const openAddDialog = (tpl: KitchenBlock) => {
    setPendingBlock(tpl);
    setPendingDims({
      width: unit === "m" ? (tpl.defaultWidth / 100).toString() : tpl.defaultWidth.toString(),
      depth: unit === "m" ? (tpl.defaultDepth / 100).toString() : tpl.defaultDepth.toString(),
      height: unit === "m" ? (tpl.defaultHeight / 100).toString() : tpl.defaultHeight.toString(),
      notes: "",
    });
  };

  const confirmAddBlock = () => {
    if (!pendingBlock) return;
    const w = parseFloat(pendingDims.width);
    const d = parseFloat(pendingDims.depth);
    const h = parseFloat(pendingDims.height);
    if (!w || !d || !h) return toast.error("أدخل جميع المقاسات");
    const mul = unit === "m" ? 100 : 1;
    const block: PlacedBlock = {
      id: crypto.randomUUID(),
      type: pendingBlock.type,
      name: pendingBlock.name,
      color: pendingBlock.color,
      x: 0, y: 0,
      width: w * mul, depth: d * mul, height: h * mul,
      rotation: 0,
      notes: pendingDims.notes || undefined,
    };
    const placed = autoPlaceBlock(block);
    setDoc({ ...doc, blocks: [...doc.blocks, placed] });
    setSelectedId(placed.id);
    setPendingBlock(null);
    toast.success(`تم إضافة ${pendingBlock.name}`);
  };

  const updateBlock = (id: string, patch: Partial<PlacedBlock>) => {
    setDoc({ ...doc, blocks: doc.blocks.map((b) => (b.id === id ? clampBlock({ ...b, ...patch }) : b)) });
  };
  const removeBlock = (id: string) => {
    setDoc({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) });
    setSelectedId(null);
  };
  const rotateBlock = (id: string, delta: number) => {
    const b = doc.blocks.find((x) => x.id === id);
    if (!b) return;
    updateBlock(id, { rotation: ((b.rotation || 0) + delta + 360) % 360 });
  };
  const openEditDialog = (b: PlacedBlock) => {
    setEditingId(b.id);
    setEditDims({
      width: toUnit(b.width),
      depth: toUnit(b.depth),
      height: toUnit(b.height),
      notes: b.notes || "",
    });
  };
  const confirmEdit = () => {
    if (!editingId) return;
    const w = fromUnit(editDims.width), d = fromUnit(editDims.depth), h = fromUnit(editDims.height);
    if (!w || !d || !h) return toast.error("أدخل جميع المقاسات");
    updateBlock(editingId, { width: w, depth: d, height: h, notes: editDims.notes || undefined });
    setEditingId(null);
    toast.success("تم تعديل الوحدة");
  };

  const selected = doc.blocks.find((b) => b.id === selectedId);

  const save = async () => {
    if (!user) return;
    if (designId) {
      const { error } = await supabase.from("designs").update({ name, data: doc as any, updated_at: new Date().toISOString() }).eq("id", designId);
      if (error) return toast.error("تعذر الحفظ");
      toast.success("تم تحديث التصميم");
    } else {
      const { data, error } = await supabase.from("designs").insert({ user_id: user.id, name, data: doc as any }).select("id").single();
      if (error) return toast.error("تعذر الحفظ");
      setDesignId(data.id);
      toast.success("تم حفظ التصميم");
    }
  };

  const toUnit = (cm: number) => (unit === "m" ? (cm / 100).toFixed(2) : cm.toString());
  const fromUnit = (v: string) => (unit === "m" ? parseFloat(v) * 100 : parseFloat(v));
  const isPaintableBlock = (b: PlacedBlock) => !!b.placement || b.type.startsWith("base_") || b.type.startsWith("wall_") || b.type.startsWith("tall_") || b.type === "special_island";
  const blockColor = (b: PlacedBlock) => b.customColor || !isPaintableBlock(b) ? b.color : (doc.globalColor || b.color);

  const roomPolygon = () => {
    const cw = doc.roomShape === "l_shape" ? Math.max(0, doc.cutoutWidth || 0) : 0;
    const cd = doc.roomShape === "l_shape" ? Math.max(0, doc.cutoutDepth || 0) : 0;
    return doc.roomShape === "l_shape" && cw > 0 && cd > 0
      ? [0, 0, doc.roomWidth - cw, 0, doc.roomWidth - cw, cd, doc.roomWidth, cd, doc.roomWidth, doc.roomDepth, 0, doc.roomDepth]
      : [0, 0, doc.roomWidth, 0, doc.roomWidth, doc.roomDepth, 0, doc.roomDepth];
  };

  const clampBlock = (b: PlacedBlock) => ({
    ...b,
    x: Math.max(0, Math.min(b.x, doc.roomWidth - b.width)),
    y: Math.max(0, Math.min(b.y, doc.roomDepth - b.depth)),
  });

  const snapBlockToWall = (block: PlacedBlock, blocks = doc.blocks) => {
    const b = clampBlock(block);
    const distances = [
      { wall: "back" as const, value: b.y },
      { wall: "left" as const, value: b.x },
      { wall: "front" as const, value: doc.roomDepth - (b.y + b.depth) },
      { wall: "right" as const, value: doc.roomWidth - (b.x + b.width) },
    ].sort((a, z) => a.value - z.value);
    const wall = distances[0].wall;
    if (wall === "back") b.y = 0;
    if (wall === "front") b.y = doc.roomDepth - b.depth;
    if (wall === "left") b.x = 0;
    if (wall === "right") b.x = doc.roomWidth - b.width;

    const sameWall = blocks.filter((o) => o.id !== b.id && (
      wall === "back" ? Math.abs(o.y) < 2 :
      wall === "front" ? Math.abs(o.y + o.depth - doc.roomDepth) < 2 :
      wall === "left" ? Math.abs(o.x) < 2 :
      Math.abs(o.x + o.width - doc.roomWidth) < 2
    ));
    const SNAP = 18;
    for (const o of sameWall) {
      if (wall === "back" || wall === "front") {
        if (Math.abs(b.x - (o.x + o.width)) <= SNAP) b.x = o.x + o.width;
        if (Math.abs((b.x + b.width) - o.x) <= SNAP) b.x = o.x - b.width;
      } else {
        if (Math.abs(b.y - (o.y + o.depth)) <= SNAP) b.y = o.y + o.depth;
        if (Math.abs((b.y + b.depth) - o.y) <= SNAP) b.y = o.y - b.depth;
      }
    }
    return clampBlock(b);
  };

  const autoPlaceBlock = (block: PlacedBlock) => {
    const row = doc.blocks.filter((b) => Math.abs(b.y) < 2).sort((a, z) => a.x - z.x);
    const last = row[row.length - 1];
    const nextX = last ? last.x + last.width : 0;
    return snapBlockToWall({ ...block, x: nextX + block.width <= doc.roomWidth ? nextX : 0, y: 0, rotation: 0 }, doc.blocks);
  };

  const groupedBlocks = (["base", "wall", "tall", "appliance", "special"] as const).map((cat) => ({
    cat,
    label: CATEGORY_LABELS[cat],
    items: KITCHEN_BLOCKS.filter((b) => b.category === cat),
  }));

  const BlocksPanel = (
    <div className="space-y-4">
      <button
        onClick={() => setBuilderOpen(true)}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm shadow-glow hover:opacity-90 transition"
      >
        <Wand2 className="size-4" />
        إنشاء وحدة مخصصة
      </button>
      <div className="text-[10px] text-muted-foreground text-center -mt-2">اختر الضلف، الأدراج، الزجاج، الركنية…</div>

      <div className="text-[11px] font-bold text-muted-foreground px-1 pt-2 border-t border-border/40">أو اختر من القوالب الجاهزة:</div>
      {groupedBlocks.map((g) => (
        <div key={g.cat}>
          <h3 className="text-[11px] font-bold text-muted-foreground mb-2 px-1 sticky top-0 bg-card/80 backdrop-blur py-1">{g.label}</h3>
          <div className="space-y-1">
            {g.items.map((b) => (
              <button
                key={b.type}
                onClick={() => openAddDialog(b)}
                className="w-full flex items-center gap-2 p-2 rounded-lg border border-border/60 hover:border-primary/60 hover:bg-primary/5 text-xs transition text-right"
              >
                <BlockIcon type={b.type} className="size-8 text-primary shrink-0" />
                <div className="flex-1 text-right min-w-0">
                  <div className="font-medium truncate">{b.name}</div>
                  {b.description && <div className="text-[10px] text-muted-foreground truncate">{b.description}</div>}
                </div>
                <Plus className="size-3.5 text-primary shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const PropsPanel = (
    <>
      <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3">الخصائص</h3>
      <div className="space-y-3 mb-6 pb-4 border-b border-border/40">
        <h4 className="text-sm font-semibold">أبعاد الغرفة</h4>
        <div>
          <Label className="text-xs">العرض ({unit})</Label>
          <Input type="number" value={toUnit(doc.roomWidth)} onChange={(e) => setDoc({ ...doc, roomWidth: fromUnit(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-xs">العمق ({unit})</Label>
          <Input type="number" value={toUnit(doc.roomDepth)} onChange={(e) => setDoc({ ...doc, roomDepth: fromUnit(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-xs mb-1 block">شكل الغرفة</Label>
          <div className="grid grid-cols-2 gap-1.5">
            <Button size="sm" variant={(doc.roomShape || "rectangle") === "rectangle" ? "default" : "outline"} onClick={() => setDoc({ ...doc, roomShape: "rectangle" })}>مستطيلة</Button>
            <Button size="sm" variant={doc.roomShape === "l_shape" ? "default" : "outline"} onClick={() => setDoc({ ...doc, roomShape: "l_shape", cutoutWidth: doc.cutoutWidth || 100, cutoutDepth: doc.cutoutDepth || 100 })}>شكل L</Button>
          </div>
        </div>
        {doc.roomShape === "l_shape" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">عرض الجزء الناقص</Label>
              <Input type="number" value={toUnit(doc.cutoutWidth || 0)} onChange={(e) => setDoc({ ...doc, cutoutWidth: fromUnit(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="text-xs">عمق الجزء الناقص</Label>
              <Input type="number" value={toUnit(doc.cutoutDepth || 0)} onChange={(e) => setDoc({ ...doc, cutoutDepth: fromUnit(e.target.value) || 0 })} />
            </div>
          </div>
        )}
      </div>

      {/* اللون العام لكل الوحدات */}
      <div className="space-y-2 mb-6 pb-4 border-b border-border/40">
        <h4 className="text-sm font-semibold flex items-center gap-1.5"><Palette className="size-3.5 text-primary" /> اللون العام</h4>
        <div className="flex items-center gap-2">
          <input type="color" value={doc.globalColor || "#b88858"} onChange={(e) => setDoc({ ...doc, globalColor: e.target.value })} className="h-9 w-14 rounded cursor-pointer bg-transparent border border-border/60" />
          <Input value={doc.globalColor || "#b88858"} onChange={(e) => setDoc({ ...doc, globalColor: e.target.value })} className="flex-1 font-mono text-xs h-9" />
        </div>
        <p className="text-[10px] text-muted-foreground">يطبَّق على كل الوحدات التي ليس لها لون مخصص.</p>
      </div>

      {selected ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{selected.name}</h4>
            <Button size="sm" variant="ghost" onClick={() => removeBlock(selected.id)}><Trash2 className="size-3.5 text-destructive" /></Button>
          </div>
          {/* ملخص مكونات الوحدة المخصصة */}
          {selected.placement && (
            <div className="text-[11px] bg-muted/30 border border-border/40 rounded-lg p-2 space-y-0.5">
              {selected.cabinet && <div>• دولاب طولي</div>}
              {!selected.cabinet && <div>• {selected.placement === "base" ? "سفلية" : selected.placement === "wall" ? "علوية" : "طولية"}</div>}
              {selected.corner && <div>• ركنية</div>}
              {(selected.doors || 0) > 0 && <div>• {selected.doors} {selected.glass ? "ضلفة زجاج" : "ضلف"}</div>}
              {(selected.drawers || 0) > 0 && <div>• {selected.drawers} أدراج</div>}
            </div>
          )}
          <div>
            <Label className="text-xs">العرض ({unit})</Label>
            <Input type="number" value={toUnit(selected.width)} onChange={(e) => updateBlock(selected.id, { width: fromUnit(e.target.value) || 0 })} />
          </div>
          <div>
            <Label className="text-xs">العمق ({unit})</Label>
            <Input type="number" value={toUnit(selected.depth)} onChange={(e) => updateBlock(selected.id, { depth: fromUnit(e.target.value) || 0 })} />
          </div>
          <div>
            <Label className="text-xs">الارتفاع ({unit})</Label>
            <Input type="number" value={toUnit(selected.height)} onChange={(e) => updateBlock(selected.id, { height: fromUnit(e.target.value) || 0 })} />
          </div>
          <div>
            <Label className="text-xs">الدوران (درجة)</Label>
            <Input type="number" value={selected.rotation} onChange={(e) => updateBlock(selected.id, { rotation: parseFloat(e.target.value) || 0 })} />
          </div>
          {/* لون خاص للوحدة */}
          <div className="p-2 rounded-lg border border-border/40 bg-muted/20 space-y-2">
            <Label className="text-xs flex items-center gap-1.5"><Palette className="size-3" /> لون هذه الوحدة</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={selected.color} onChange={(e) => updateBlock(selected.id, { color: e.target.value, customColor: true })} className="h-9 w-14 rounded cursor-pointer bg-transparent border border-border/60" />
              <Input value={selected.color} onChange={(e) => updateBlock(selected.id, { color: e.target.value, customColor: true })} className="flex-1 font-mono text-xs h-9" />
            </div>
            <label className="flex items-center gap-2 text-[11px] cursor-pointer">
              <input type="checkbox" checked={!!selected.customColor} onChange={(e) => updateBlock(selected.id, { customColor: e.target.checked })} />
              لون مخصص (لا يتأثر باللون العام)
            </label>
          </div>
          <div>
            <Label className="text-xs">تفاصيل إضافية</Label>
            <Textarea
              placeholder="مثال: يحتوي على شباك صغير / فتحة لأنابيب"
              value={selected.notes || ""}
              onChange={(e) => updateBlock(selected.id, { notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">اختر وحدة من اللوحة لتعديل خصائصها أو أضف وحدة جديدة من القائمة.</p>
      )}
    </>
  );

  if (id && !editorStarted) {
    return <div className="p-6 text-center text-sm text-muted-foreground">جاري فتح التصميم...</div>;
  }

  if (!editorStarted) {
    return (
      <div className="min-h-[calc(100dvh-6rem)] p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-5 items-start">
          <section className="border border-border/60 bg-card/60 rounded-2xl p-5 md:p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center"><Ruler className="size-5" /></div>
              <div>
                <h1 className="text-2xl font-bold">تصميم جديد</h1>
                <p className="text-sm text-muted-foreground">اكتب مقاسات الغرفة وحدد شكلها قبل فتح مساحة التصميم.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">اسم التصميم</Label>
                <Input value={setupRoom.name} onChange={(e) => setSetupRoom({ ...setupRoom, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">عرض الغرفة ({unit})</Label>
                  <Input type="number" value={setupRoom.width} onChange={(e) => setSetupRoom({ ...setupRoom, width: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">عمق الغرفة ({unit})</Label>
                  <Input type="number" value={setupRoom.depth} onChange={(e) => setSetupRoom({ ...setupRoom, depth: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant={unit === "cm" ? "default" : "outline"} onClick={() => setUnit("cm")}>سم</Button>
                <Button size="sm" variant={unit === "m" ? "default" : "outline"} onClick={() => setUnit("m")}>م</Button>
              </div>
              <div>
                <Label className="text-xs mb-2 block">شكل الغرفة</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setSetupRoom({ ...setupRoom, shape: "rectangle" })} className={`p-3 rounded-xl border text-sm font-semibold ${setupRoom.shape === "rectangle" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-muted/20"}`}>مستطيلة</button>
                  <button onClick={() => setSetupRoom({ ...setupRoom, shape: "l_shape" })} className={`p-3 rounded-xl border text-sm font-semibold ${setupRoom.shape === "l_shape" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-muted/20"}`}>غير منتظمة L</button>
                </div>
              </div>
              {setupRoom.shape === "l_shape" && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border/50 bg-muted/20">
                  <div>
                    <Label className="text-xs">عرض الجزء الناقص ({unit})</Label>
                    <Input type="number" value={setupRoom.cutoutWidth} onChange={(e) => setSetupRoom({ ...setupRoom, cutoutWidth: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">عمق الجزء الناقص ({unit})</Label>
                    <Input type="number" value={setupRoom.cutoutDepth} onChange={(e) => setSetupRoom({ ...setupRoom, cutoutDepth: e.target.value })} />
                  </div>
                </div>
              )}
              <Button onClick={startNewDesign} className="w-full bg-gradient-primary shadow-glow"><PenLine className="size-4" /> ابدأ التصميم</Button>
            </div>
          </section>

          <section className="border border-border/60 bg-card/60 rounded-2xl p-5 md:p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center"><FolderOpen className="size-5" /></div>
              <div>
                <h2 className="text-xl font-bold">تعديل تصميم محفوظ</h2>
                <p className="text-sm text-muted-foreground">افتح تصميم سابق واستكمل عليه.</p>
              </div>
            </div>
            {savedRows.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">لا توجد تصميمات محفوظة بعد.</div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {savedRows.map((r) => (
                  <Link key={r.id} to="/app/design" search={{ id: r.id }} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 hover:border-primary/60 transition">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString("ar-EG")}</div>
                    </div>
                    <FolderOpen className="size-4 text-primary shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-6.5rem)] md:h-screen">
      {/* Desktop: blocks library */}
      <aside className="hidden md:block w-60 border-l border-border/60 bg-card/50 p-3 overflow-auto">
        {BlocksPanel}
      </aside>

      {/* Main canvas */}
      <div className="flex-1 flex flex-col overflow-hidden order-2 md:order-none min-h-0">
        {/* Toolbar */}
        <div className="border-b border-border/60 p-2 flex items-center gap-1.5 bg-card/40 flex-wrap shrink-0">
          {/* Mobile sheets */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="default" className="md:hidden h-9 gap-1 bg-gradient-primary shadow-glow">
                <LayoutGrid className="size-4" /> الوحدات
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-auto">
              <SheetHeader><SheetTitle>الوحدات</SheetTitle></SheetHeader>
              <div className="mt-4">{BlocksPanel}</div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="md:hidden size-9">
                <Settings2 className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-auto">
              <SheetHeader><SheetTitle>الخصائص</SheetTitle></SheetHeader>
              <div className="mt-4">{PropsPanel}</div>
            </SheetContent>
          </Sheet>

          <Input className="max-w-[120px] md:max-w-xs h-9 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex items-center gap-1">
            <Button size="sm" variant={unit === "cm" ? "default" : "outline"} onClick={() => setUnit("cm")}>سم</Button>
            <Button size="sm" variant={unit === "m" ? "default" : "outline"} onClick={() => setUnit("m")}>م</Button>
          </div>
          <Button onClick={save} size="sm" className="mr-auto bg-gradient-primary shadow-glow"><Save className="size-4" /> حفظ</Button>
        </div>

        {/* Quick-add strip for mobile */}
        <div className="md:hidden flex gap-1.5 overflow-x-auto p-2 border-b border-border/60 bg-card/30 shrink-0">
          <button
            onClick={() => setBuilderOpen(true)}
            className="shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground text-[10px] min-w-[72px] shadow-glow font-bold"
          >
            <Wand2 className="size-5" />
            <span>وحدة مخصصة</span>
          </button>
          {KITCHEN_BLOCKS.slice(0, 8).map((b) => (
            <button
              key={b.type}
              onClick={() => openAddDialog(b)}
              className="shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border border-border/60 bg-card hover:border-primary text-[10px] min-w-[64px]"
            >
              <BlockIcon type={b.type} className="size-7 text-primary" />
              <span className="truncate max-w-[60px]">{b.name}</span>
            </button>
          ))}
        </div>


        <Tabs defaultValue="2d" className="flex-1 flex flex-col overflow-hidden min-h-0">
          <TabsList className="mx-2 mt-2 self-start shrink-0">
            <TabsTrigger value="2d">2D</TabsTrigger>
            <TabsTrigger value="3d">3D</TabsTrigger>
          </TabsList>
          <TabsContent value="2d" className="flex-1 overflow-hidden bg-muted/20 m-0 min-h-0">
            <div ref={stageWrapRef} className="w-full h-full">
              <Stage width={stageSize.w} height={stageSize.h} onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}>
                <Layer>
                  <Line points={roomPolygon().map((p, i) => (i % 2 === 0 ? PAD + p * scale : PAD + p * scale))} fill="#1a1a1a" stroke="#c2956b" strokeWidth={2} closed />
                  {Array.from({ length: Math.floor(doc.roomWidth / 50) }).map((_, i) => (
                    <Line key={`v${i}`} points={[PAD + (i + 1) * 50 * scale, PAD, PAD + (i + 1) * 50 * scale, PAD + doc.roomDepth * scale]} stroke="#333" strokeWidth={0.5} />
                  ))}
                  {Array.from({ length: Math.floor(doc.roomDepth / 50) }).map((_, i) => (
                    <Line key={`h${i}`} points={[PAD, PAD + (i + 1) * 50 * scale, PAD + doc.roomWidth * scale, PAD + (i + 1) * 50 * scale]} stroke="#333" strokeWidth={0.5} />
                  ))}
                  {doc.blocks.map((b) => {
                    const fill = blockColor(b);
                    const W = b.width * scale;
                    const H = b.depth * scale;
                    const doors = Math.max(0, Math.min(4, b.doors || 0));
                    const drawers = Math.max(0, Math.min(4, b.drawers || 0));
                    return (
                      <Group
                        key={b.id}
                        x={PAD + b.x * scale}
                        y={PAD + b.y * scale}
                        rotation={b.rotation}
                        draggable
                        onClick={() => setSelectedId(b.id)}
                        onTap={() => setSelectedId(b.id)}
                         onDragEnd={(e) => {
                           const moved = snapBlockToWall({ ...b, x: (e.target.x() - PAD) / scale, y: (e.target.y() - PAD) / scale });
                           setDoc({ ...doc, blocks: doc.blocks.map((item) => (item.id === b.id ? moved : item)) });
                         }}
                      >
                        <Rect width={W} height={H} fill={fill} stroke={selectedId === b.id ? "#f59e0b" : "#000"} strokeWidth={selectedId === b.id ? 3 : 1} cornerRadius={3} />
                        {/* خطوط تقسيم الضلف عمودياً */}
                        {doors > 1 && Array.from({ length: doors - 1 }).map((_, i) => (
                          <Line key={`vd${i}`} points={[((i + 1) * W) / doors, drawers > 0 ? H * 0.3 : 0, ((i + 1) * W) / doors, H]} stroke="#000" strokeWidth={0.8} opacity={0.6} />
                        ))}
                        {/* خط فاصل بين الأدراج والضلف */}
                        {drawers > 0 && doors > 0 && <Line points={[0, H * 0.3, W, H * 0.3]} stroke="#000" strokeWidth={1} opacity={0.7} />}
                        {/* خطوط تقسيم الأدراج أفقياً */}
                        {drawers > 1 && Array.from({ length: drawers - 1 }).map((_, i) => {
                          const drawerArea = doors > 0 ? H * 0.3 : H;
                          return <Line key={`hd${i}`} points={[0, ((i + 1) * drawerArea) / drawers, W, ((i + 1) * drawerArea) / drawers]} stroke="#000" strokeWidth={0.6} opacity={0.5} />;
                        })}
                        {/* مؤشر الزجاج */}
                        {b.glass && doors > 0 && (
                          <Rect x={W * 0.15} y={drawers > 0 ? H * 0.45 : H * 0.2} width={W * 0.7} height={drawers > 0 ? H * 0.4 : H * 0.6} fill="#a8c5d8" opacity={0.4} cornerRadius={2} />
                        )}
                        {/* علامة الركنية */}
                        {b.corner && <Line points={[0, 0, W * 0.3, 0, 0, H * 0.3]} stroke="#f59e0b" strokeWidth={2} closed fill="#f59e0b" opacity={0.3} />}
                        <KText text={b.name} fontSize={9} fontStyle="bold" fill="#000" padding={2} width={W} align="center" y={Math.max(2, H / 2 - 6)} />
                        <KText text={`${Math.round(b.width)}×${Math.round(b.depth)}`} fontSize={8} fill="#1a1a1a" padding={2} width={W} align="center" y={H - 11} />
                      </Group>
                    );
                  })}
                </Layer>
              </Stage>
            </div>
          </TabsContent>
          <TabsContent value="3d" className="flex-1 m-0 bg-gradient-to-b from-zinc-900 to-black min-h-0">
            <Canvas
              camera={{ position: [doc.roomWidth, doc.roomDepth * 1.2, doc.roomDepth * 1.4], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: false, powerPreference: "default", preserveDrawingBuffer: false, alpha: false }}
              frameloop="demand"
            >
              <color attach="background" args={["#1a1208"]} />
              <ambientLight intensity={0.8} />
              <directionalLight position={[doc.roomWidth, 600, doc.roomDepth]} intensity={0.9} />
              <Grid args={[2000, 2000]} cellColor="#333" sectionColor="#555" infiniteGrid fadeDistance={1500} />
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[doc.roomWidth / 2, 0, doc.roomDepth / 2]}>
                <planeGeometry args={[doc.roomWidth, doc.roomDepth]} />
                <meshStandardMaterial color="#3a2a1c" roughness={0.9} />
              </mesh>
              <mesh position={[doc.roomWidth / 2, 130, -2.5]}>
                <boxGeometry args={[doc.roomWidth, 260, 5]} />
                <meshStandardMaterial color="#e8dcc8" roughness={0.95} />
              </mesh>
              <mesh position={[-2.5, 130, doc.roomDepth / 2]}>
                <boxGeometry args={[5, 260, doc.roomDepth]} />
                <meshStandardMaterial color="#e8dcc8" roughness={0.95} />
              </mesh>
              {doc.blocks.map((b) => (
                <Cabinet3D key={b.id} block={b} defaultColor={isPaintableBlock(b) ? (doc.globalColor || b.color) : b.color} />
              ))}
              <OrbitControls target={[doc.roomWidth / 2, 80, doc.roomDepth / 2]} maxPolarAngle={Math.PI / 2.05} makeDefault />
            </Canvas>
          </TabsContent>


        </Tabs>
      </div>

      {/* Desktop: properties */}
      <aside className="hidden md:block w-72 border-r border-border/60 bg-card/50 p-4 overflow-auto">
        {PropsPanel}
      </aside>

      {/* Add block dialog: ask for size first */}
      <Dialog open={!!pendingBlock} onOpenChange={(o) => !o && setPendingBlock(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingBlock && <BlockIcon type={pendingBlock.type} className="size-8 text-primary" />}
              {pendingBlock?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{pendingBlock?.description}</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">العرض ({unit})</Label>
                <Input type="number" value={pendingDims.width} onChange={(e) => setPendingDims({ ...pendingDims, width: e.target.value })} autoFocus />
              </div>
              <div>
                <Label className="text-xs">العمق ({unit})</Label>
                <Input type="number" value={pendingDims.depth} onChange={(e) => setPendingDims({ ...pendingDims, depth: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">الارتفاع ({unit})</Label>
                <Input type="number" value={pendingDims.height} onChange={(e) => setPendingDims({ ...pendingDims, height: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">تفاصيل إضافية (اختياري)</Label>
              <Textarea
                placeholder="مثال: يحتوي على شباك / مكان للأنابيب / فتحة للسلك"
                value={pendingDims.notes}
                onChange={(e) => setPendingDims({ ...pendingDims, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setPendingBlock(null)}>إلغاء</Button>
            <Button onClick={confirmAddBlock} className="bg-gradient-primary"><Plus className="size-4" /> إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* منشئ الوحدة المخصصة */}
      <CustomUnitBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        unit={unit}
        defaultColor={doc.globalColor || "#b88858"}
        onAdd={(block) => {
          const placed = autoPlaceBlock(block);
          setDoc({ ...doc, blocks: [...doc.blocks, placed] });
          setSelectedId(placed.id);
        }}
      />
    </div>
  );
}
