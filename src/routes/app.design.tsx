import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Line, Text as KText, Group } from "react-konva";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, ContactShadows } from "@react-three/drei";
import { KITCHEN_BLOCKS, DEFAULT_DESIGN, type DesignDoc, type PlacedBlock } from "@/lib/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";
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
  const trRef = useRef<Konva.Transformer>(null);
  const shapeRefs = useRef<Record<string, Konva.Group>>({});

  useEffect(() => {
    if (!id || !user) return;
    supabase.from("designs").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) {
        setDoc(data.data as unknown as DesignDoc);
        setName(data.name);
        setDesignId(data.id);
      }
    });
  }, [id, user]);

  // Canvas scale: pixels per cm
  const scale = 1.5;
  const stageWidth = doc.roomWidth * scale + 80;
  const stageHeight = doc.roomDepth * scale + 80;

  const addBlock = (type: string) => {
    const tpl = KITCHEN_BLOCKS.find((b) => b.type === type)!;
    const block: PlacedBlock = {
      id: crypto.randomUUID(),
      type, name: tpl.name, color: tpl.color,
      x: 20, y: 20,
      width: tpl.defaultWidth, depth: tpl.defaultDepth, height: tpl.defaultHeight,
      rotation: 0,
    };
    setDoc({ ...doc, blocks: [...doc.blocks, block] });
    setSelectedId(block.id);
  };

  const updateBlock = (id: string, patch: Partial<PlacedBlock>) => {
    setDoc({ ...doc, blocks: doc.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  };
  const removeBlock = (id: string) => {
    setDoc({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) });
    setSelectedId(null);
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

  return (
    <div className="flex h-screen">
      {/* Blocks Library */}
      <aside className="w-56 border-l border-border/60 bg-card/50 p-3 overflow-auto">
        <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3">الوحدات الجاهزة</h3>
        <div className="space-y-1.5">
          {KITCHEN_BLOCKS.map((b) => (
            <button key={b.type} onClick={() => addBlock(b.type)} className="w-full flex items-center gap-2 p-2 rounded-lg border border-border/60 hover:border-primary/60 hover:bg-primary/5 text-sm transition text-right">
              <span className="text-xl">{b.icon}</span>
              <div className="flex-1 text-right">
                <div className="font-medium">{b.name}</div>
                <div className="text-[10px] text-muted-foreground">{b.defaultWidth}×{b.defaultDepth}</div>
              </div>
              <Plus className="size-3.5 text-primary" />
            </button>
          ))}
        </div>
      </aside>

      {/* Main canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border/60 p-3 flex items-center gap-3 bg-card/40">
          <Input className="max-w-xs" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">الوحدة:</span>
            <Button size="sm" variant={unit === "cm" ? "default" : "outline"} onClick={() => setUnit("cm")}>سم</Button>
            <Button size="sm" variant={unit === "m" ? "default" : "outline"} onClick={() => setUnit("m")}>متر</Button>
          </div>
          <div className="mr-auto">
            <Button onClick={save} className="bg-gradient-primary shadow-glow"><Save className="size-4" /> حفظ</Button>
          </div>
        </div>

        <Tabs defaultValue="2d" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-3 mt-3 self-start">
            <TabsTrigger value="2d">ثنائي الأبعاد 2D</TabsTrigger>
            <TabsTrigger value="3d">ثلاثي الأبعاد 3D</TabsTrigger>
          </TabsList>
          <TabsContent value="2d" className="flex-1 overflow-auto bg-muted/20 p-4 m-0">
            <Stage width={stageWidth} height={stageHeight} onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}>
              <Layer>
                {/* Room boundary */}
                <Rect x={40} y={40} width={doc.roomWidth * scale} height={doc.roomDepth * scale} fill="#1a1a1a" stroke="#c2956b" strokeWidth={3} />
                {/* Grid */}
                {Array.from({ length: Math.floor(doc.roomWidth / 50) }).map((_, i) => (
                  <Line key={`v${i}`} points={[40 + (i + 1) * 50 * scale, 40, 40 + (i + 1) * 50 * scale, 40 + doc.roomDepth * scale]} stroke="#333" strokeWidth={0.5} />
                ))}
                {Array.from({ length: Math.floor(doc.roomDepth / 50) }).map((_, i) => (
                  <Line key={`h${i}`} points={[40, 40 + (i + 1) * 50 * scale, 40 + doc.roomWidth * scale, 40 + (i + 1) * 50 * scale]} stroke="#333" strokeWidth={0.5} />
                ))}
                {/* Blocks */}
                {doc.blocks.map((b) => (
                  <Group
                    key={b.id}
                    ref={(node) => { if (node) shapeRefs.current[b.id] = node; }}
                    x={40 + b.x * scale}
                    y={40 + b.y * scale}
                    rotation={b.rotation}
                    draggable
                    onClick={() => setSelectedId(b.id)}
                    onTap={() => setSelectedId(b.id)}
                    onDragEnd={(e) => updateBlock(b.id, { x: (e.target.x() - 40) / scale, y: (e.target.y() - 40) / scale })}
                  >
                    <Rect width={b.width * scale} height={b.depth * scale} fill={b.color} stroke={selectedId === b.id ? "#f59e0b" : "#000"} strokeWidth={selectedId === b.id ? 3 : 1} cornerRadius={3} />
                    <KText text={b.name} fontSize={11} fill="#000" padding={4} width={b.width * scale} align="center" y={b.depth * scale / 2 - 8} />
                  </Group>
                ))}
              </Layer>
            </Stage>
          </TabsContent>
          <TabsContent value="3d" className="flex-1 m-0 bg-gradient-to-b from-zinc-900 to-black">
            <Canvas shadows camera={{ position: [doc.roomWidth, doc.roomDepth * 1.2, doc.roomDepth * 1.4], fov: 45 }}>
              <ambientLight intensity={0.35} />
              <hemisphereLight args={["#fff5e1", "#1a1208", 0.4]} />
              <directionalLight position={[doc.roomWidth, 600, doc.roomDepth]} intensity={1.1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}>
                <orthographicCamera attach="shadow-camera" args={[-600, 600, 600, -600, 0.1, 2000]} />
              </directionalLight>
              <pointLight position={[doc.roomWidth / 2, 220, doc.roomDepth / 2]} intensity={0.6} color="#ffd28a" />
              <Environment preset="apartment" />
              <Grid args={[2000, 2000]} cellColor="#333" sectionColor="#555" infiniteGrid fadeDistance={1500} />
              {/* Floor */}
              <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[doc.roomWidth / 2, 0, doc.roomDepth / 2]}>
                <planeGeometry args={[doc.roomWidth, doc.roomDepth]} />
                <meshStandardMaterial color="#3a2a1c" roughness={0.6} metalness={0.05} />
              </mesh>
              {/* Walls */}
              <mesh receiveShadow position={[doc.roomWidth / 2, 130, -2.5]}>
                <boxGeometry args={[doc.roomWidth, 260, 5]} />
                <meshStandardMaterial color="#e8dcc8" roughness={0.9} />
              </mesh>
              <mesh receiveShadow position={[-2.5, 130, doc.roomDepth / 2]}>
                <boxGeometry args={[5, 260, doc.roomDepth]} />
                <meshStandardMaterial color="#e8dcc8" roughness={0.9} />
              </mesh>
              <ContactShadows position={[doc.roomWidth / 2, 0.1, doc.roomDepth / 2]} opacity={0.5} scale={Math.max(doc.roomWidth, doc.roomDepth) * 1.5} blur={2} far={50} />
              {/* Blocks */}
              {doc.blocks.map((b) => (
                <mesh key={b.id} castShadow receiveShadow position={[b.x + b.width / 2, b.height / 2, b.y + b.depth / 2]} rotation={[0, (-b.rotation * Math.PI) / 180, 0]}>
                  <boxGeometry args={[b.width, b.height, b.depth]} />
                  <meshStandardMaterial color={b.color} roughness={0.45} metalness={0.1} />
                </mesh>
              ))}
              <OrbitControls target={[doc.roomWidth / 2, 80, doc.roomDepth / 2]} maxPolarAngle={Math.PI / 2.05} />
            </Canvas>
          </TabsContent>
        </Tabs>
      </div>

      {/* Properties */}
      <aside className="w-72 border-r border-border/60 bg-card/50 p-4 overflow-auto">
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
        </div>
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{selected.name}</h4>
              <Button size="sm" variant="ghost" onClick={() => removeBlock(selected.id)}><Trash2 className="size-3.5 text-destructive" /></Button>
            </div>
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
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">اختر وحدة من اللوحة لتعديل خصائصها أو أضف وحدة جديدة من القائمة.</p>
        )}
      </aside>
    </div>
  );
}
