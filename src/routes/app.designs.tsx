import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/app/designs")({ component: Designs });

function Designs() {
  const { user } = useAuth();
  const [rows, setRows] = useState<{ id: string; name: string; updated_at: string }[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("designs").select("id,name,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">تصميماتي</h1>
          <p className="text-sm text-muted-foreground">جميع تصميمات المطابخ المحفوظة.</p>
        </div>
        <Button asChild className="bg-gradient-primary shadow-glow"><Link to="/app/design"><Plus className="size-4" /> تصميم جديد</Link></Button>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/50 p-12 text-center text-muted-foreground">
          لا توجد تصميمات بعد — ابدأ بإنشاء تصميمك الأول!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/60 bg-card/50 p-5 hover:border-primary/40 transition">
              <div className="aspect-video rounded-lg bg-gradient-primary/10 mb-3 flex items-center justify-center text-4xl">🏠</div>
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{new Date(r.updated_at).toLocaleDateString("ar-EG")}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="ghost" className="flex-1" asChild>
                  <Link to="/app/design" search={{ id: r.id }}>فتح</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={async () => { await supabase.from("designs").delete().eq("id", r.id); load(); }}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
