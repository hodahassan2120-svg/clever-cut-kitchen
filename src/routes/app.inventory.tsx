import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inventory")({ component: Inventory });

interface BoardRow { id: string; name: string; width_cm: number; length_cm: number; thickness_mm: number | null; quantity: number; }
interface RodRow { id: string; name: string; length_cm: number; quantity: number; }

function Inventory() {
  const { user } = useAuth();
  const [boards, setBoards] = useState<BoardRow[]>([]);
  const [rods, setRods] = useState<RodRow[]>([]);
  const [nb, setNb] = useState({ name: "لوح MDF", width_cm: 122, length_cm: 244, thickness_mm: 18, quantity: 5 });
  const [nr, setNr] = useState({ name: "عود ألومنيوم", length_cm: 600, quantity: 10 });

  const load = async () => {
    if (!user) return;
    const [{ data: b }, { data: r }] = await Promise.all([
      supabase.from("board_inventory").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("rod_inventory").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setBoards((b ?? []) as any);
    setRods((r ?? []) as any);
  };
  useEffect(() => { load(); }, [user]);

  const addBoard = async () => {
    if (!user) return;
    const { error } = await supabase.from("board_inventory").insert({ ...nb, user_id: user.id });
    if (error) return toast.error("تعذر الإضافة");
    toast.success("تمت إضافة اللوح");
    load();
  };
  const addRod = async () => {
    if (!user) return;
    const { error } = await supabase.from("rod_inventory").insert({ ...nr, user_id: user.id });
    if (error) return toast.error("تعذر الإضافة");
    toast.success("تمت إضافة العود");
    load();
  };
  const delBoard = async (id: string) => { await supabase.from("board_inventory").delete().eq("id", id); load(); };
  const delRod = async (id: string) => { await supabase.from("rod_inventory").delete().eq("id", id); load(); };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">المخزون</h1>
      <p className="text-sm text-muted-foreground mb-6">إدارة مقاسات الألواح والأعواد المتوفرة لديك.</p>

      <Tabs defaultValue="boards">
        <TabsList>
          <TabsTrigger value="boards">الألواح</TabsTrigger>
          <TabsTrigger value="rods">الأعواد</TabsTrigger>
        </TabsList>

        <TabsContent value="boards" className="space-y-4 mt-4">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
            <h3 className="font-semibold mb-3">إضافة لوح جديد (سم)</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <div className="col-span-2"><Label className="text-xs">الاسم</Label><Input value={nb.name} onChange={(e) => setNb({ ...nb, name: e.target.value })} /></div>
              <div><Label className="text-xs">العرض</Label><Input type="number" value={nb.width_cm} onChange={(e) => setNb({ ...nb, width_cm: +e.target.value })} /></div>
              <div><Label className="text-xs">الطول</Label><Input type="number" value={nb.length_cm} onChange={(e) => setNb({ ...nb, length_cm: +e.target.value })} /></div>
              <div><Label className="text-xs">السُمك (مم)</Label><Input type="number" value={nb.thickness_mm} onChange={(e) => setNb({ ...nb, thickness_mm: +e.target.value })} /></div>
              <div className="flex gap-2"><div className="flex-1"><Label className="text-xs">الكمية</Label><Input type="number" value={nb.quantity} onChange={(e) => setNb({ ...nb, quantity: +e.target.value })} /></div><Button onClick={addBoard} className="bg-gradient-primary"><Plus className="size-4" /></Button></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
            {boards.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">لا توجد ألواح في المخزون</p> : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/40 text-muted-foreground text-xs"><th className="text-right p-2">الاسم</th><th className="text-right p-2">العرض</th><th className="text-right p-2">الطول</th><th className="text-right p-2">السُمك</th><th className="text-right p-2">الكمية</th><th></th></tr></thead>
                <tbody>{boards.map((b) => (
                  <tr key={b.id} className="border-b border-border/20 hover:bg-muted/30">
                    <td className="p-2 font-medium">{b.name}</td><td className="p-2">{b.width_cm}</td><td className="p-2">{b.length_cm}</td><td className="p-2">{b.thickness_mm ?? "-"}</td><td className="p-2">{b.quantity}</td>
                    <td className="p-2 text-left"><Button size="sm" variant="ghost" onClick={() => delBoard(b.id)}><Trash2 className="size-3.5 text-destructive" /></Button></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rods" className="space-y-4 mt-4">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
            <h3 className="font-semibold mb-3">إضافة عود جديد (سم)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="col-span-2"><Label className="text-xs">الاسم</Label><Input value={nr.name} onChange={(e) => setNr({ ...nr, name: e.target.value })} /></div>
              <div><Label className="text-xs">الطول</Label><Input type="number" value={nr.length_cm} onChange={(e) => setNr({ ...nr, length_cm: +e.target.value })} /></div>
              <div className="flex gap-2"><div className="flex-1"><Label className="text-xs">الكمية</Label><Input type="number" value={nr.quantity} onChange={(e) => setNr({ ...nr, quantity: +e.target.value })} /></div><Button onClick={addRod} className="bg-gradient-primary"><Plus className="size-4" /></Button></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
            {rods.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">لا توجد أعواد في المخزون</p> : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/40 text-muted-foreground text-xs"><th className="text-right p-2">الاسم</th><th className="text-right p-2">الطول</th><th className="text-right p-2">الكمية</th><th></th></tr></thead>
                <tbody>{rods.map((r) => (
                  <tr key={r.id} className="border-b border-border/20"><td className="p-2 font-medium">{r.name}</td><td className="p-2">{r.length_cm}</td><td className="p-2">{r.quantity}</td>
                    <td className="p-2 text-left"><Button size="sm" variant="ghost" onClick={() => delRod(r.id)}><Trash2 className="size-3.5 text-destructive" /></Button></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
