import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Image as ImageIcon, Film } from "lucide-react";

type Ad = {
  id: string;
  ad_type: "banner" | "splash_video";
  title: string;
  media_url: string;
  link_url: string | null;
  enabled: boolean;
  weight: number;
  skip_seconds: number;
};

export function AdsManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [adding, setAdding] = useState<"banner" | "splash_video" | null>(null);
  const [form, setForm] = useState({ title: "", link_url: "", skip_seconds: 5, file: null as File | null });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("custom_ads").select("*").order("created_at", { ascending: false });
    setAds((data ?? []) as Ad[]);
  };
  useEffect(() => { load(); }, []);

  const startAdd = (t: "banner" | "splash_video") => {
    setAdding(t);
    setForm({ title: "", link_url: "", skip_seconds: 5, file: null });
  };

  const submit = async () => {
    if (!adding) return;
    if (!form.file) return toast.error("اختر ملف الوسائط");
    setUploading(true);
    const ext = form.file.name.split(".").pop() || "bin";
    const path = `${adding}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("ad-media").upload(path, form.file, { cacheControl: "3600", upsert: false });
    if (upErr) { setUploading(false); return toast.error("فشل رفع الملف: " + upErr.message); }
    const { data: pub } = supabase.storage.from("ad-media").getPublicUrl(path);
    const { error } = await supabase.from("custom_ads").insert({
      ad_type: adding,
      title: form.title,
      media_url: pub.publicUrl,
      link_url: form.link_url || null,
      skip_seconds: form.skip_seconds,
      enabled: true,
    });
    setUploading(false);
    if (error) return toast.error("تعذر حفظ الإعلان");
    toast.success("تم إضافة الإعلان");
    setAdding(null);
    load();
  };

  const toggle = async (id: string, enabled: boolean) => {
    await supabase.from("custom_ads").update({ enabled }).eq("id", id);
    load();
  };

  const remove = async (ad: Ad) => {
    if (!confirm("حذف الإعلان نهائياً؟")) return;
    // try to delete media (best effort)
    try {
      const url = new URL(ad.media_url);
      const idx = url.pathname.indexOf("/ad-media/");
      if (idx >= 0) {
        const key = url.pathname.slice(idx + "/ad-media/".length);
        await supabase.storage.from("ad-media").remove([key]);
      }
    } catch { /* noop */ }
    await supabase.from("custom_ads").delete().eq("id", ad.id);
    load();
  };

  const banners = ads.filter((a) => a.ad_type === "banner");
  const splashes = ads.filter((a) => a.ad_type === "splash_video");

  return (
    <div className="space-y-6">
      <Section
        title="بانرات إعلانية (صور)"
        icon={<ImageIcon className="size-4" />}
        onAdd={() => startAdd("banner")}
        items={banners}
        onToggle={toggle}
        onDelete={remove}
      />
      <Section
        title="فيديوهات الترحيب (Splash)"
        icon={<Film className="size-4" />}
        onAdd={() => startAdd("splash_video")}
        items={splashes}
        onToggle={toggle}
        onDelete={remove}
      />

      {adding && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !uploading && setAdding(null)}>
          <div className="bg-card rounded-2xl border border-border max-w-md w-full p-6 space-y-3" onClick={(e) => e.stopPropagation()} dir="rtl">
            <h3 className="font-bold text-lg">
              {adding === "banner" ? "إضافة بانر إعلاني" : "إضافة فيديو ترحيبي"}
            </h3>
            <div>
              <Label>عنوان الإعلان (اختياري)</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عرض خاص — رخام إيطالي" />
            </div>
            <div>
              <Label>{adding === "banner" ? "ملف الصورة (JPG/PNG/WEBP)" : "ملف الفيديو (MP4/WEBM)"}</Label>
              <Input
                type="file"
                accept={adding === "banner" ? "image/*" : "video/*"}
                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
              />
            </div>
            <div>
              <Label>رابط المُعلن (اختياري)</Label>
              <Input dir="ltr" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
            </div>
            {adding === "splash_video" && (
              <div>
                <Label>عدد ثواني قبل التخطي</Label>
                <Input type="number" min={0} max={30} value={form.skip_seconds} onChange={(e) => setForm({ ...form, skip_seconds: +e.target.value || 0 })} />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={submit} disabled={uploading} className="flex-1 bg-gradient-primary shadow-glow gap-2">
                <Upload className="size-4" /> {uploading ? "جارٍ الرفع..." : "حفظ ونشر"}
              </Button>
              <Button variant="outline" onClick={() => setAdding(null)} disabled={uploading}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, onAdd, items, onToggle, onDelete }: {
  title: string; icon: React.ReactNode; onAdd: () => void; items: Ad[];
  onToggle: (id: string, enabled: boolean) => void; onDelete: (ad: Ad) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-semibold">{icon} {title} <Badge variant="outline" className="ms-1">{items.length}</Badge></div>
        <Button size="sm" onClick={onAdd} className="bg-gradient-primary shadow-glow gap-1"><Plus className="size-4" /> إضافة</Button>
      </div>
      {items.length === 0 ? (
        <div className="text-center text-muted-foreground py-6 text-sm">لا توجد عناصر بعد</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((ad) => (
            <div key={ad.id} className="rounded-xl border border-border/40 bg-background/40 p-3 space-y-2">
              <div className="aspect-video bg-black/30 rounded-lg overflow-hidden flex items-center justify-center">
                {ad.ad_type === "banner" ? (
                  <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                  <video src={ad.media_url} controls muted className="w-full h-full" />
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{ad.title || "بدون عنوان"}</div>
                  {ad.link_url && <a href={ad.link_url} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline truncate block" dir="ltr">{ad.link_url}</a>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={ad.enabled} onCheckedChange={(v) => onToggle(ad.id, v)} />
                  <Button size="icon" variant="ghost" onClick={() => onDelete(ad)} className="size-8 text-destructive hover:text-destructive"><Trash2 className="size-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
