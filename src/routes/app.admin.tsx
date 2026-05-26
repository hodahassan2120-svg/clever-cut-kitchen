import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Settings as SettingsIcon, Shield, Inbox, Check, X, Clock, Megaphone } from "lucide-react";
import { AdsManager } from "@/components/admin/AdsManager";

export const Route = createFileRoute("/app/admin")({ component: Admin });

interface UserRow { id: string; phone: string; full_name: string | null; trial_ends_at: string; is_active: boolean; activated_until: string | null; }
interface RequestRow { id: string; user_id: string; phone: string; full_name: string | null; note: string | null; status: "pending" | "approved" | "rejected"; created_at: string; handled_at: string | null; }

function Admin() {
  const { isAdmin, loading, user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [stats, setStats] = useState({ users: 0, active: 0, designs: 0, pending: 0 });
  const [settings, setSettings] = useState({
    adsense_client: "", adsense_enabled: false, whatsapp_number: "",
    adsterra_rewarded_zone: "", adsterra_interstitial_zone: "",
    rewarded_ads_enabled: false, interstitial_ads_enabled: false,
    credits_per_ad: 1, max_daily_ad_credits: 10,
    splash_ad_enabled: false, splash_ad_frequency: "session" as "session" | "daily" | "always",
  });

  const load = async () => {
    const [{ data: profiles }, { data: subs }, designs, { data: s }, { data: reqs }] = await Promise.all([
      supabase.from("profiles").select("id,phone,full_name"),
      supabase.from("subscriptions").select("user_id,trial_ends_at,is_active,activated_until"),
      supabase.from("designs").select("id", { count: "exact", head: true }),
      supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("activation_requests").select("*").order("created_at", { ascending: false }),
    ]);
    const subMap = new Map((subs ?? []).map((x) => [x.user_id, x]));
    const merged: UserRow[] = (profiles ?? []).map((p: any) => {
      const sub = subMap.get(p.id);
      return { id: p.id, phone: p.phone, full_name: p.full_name, trial_ends_at: sub?.trial_ends_at ?? "", is_active: sub?.is_active ?? false, activated_until: sub?.activated_until ?? null };
    });
    setUsers(merged);
    const list = (reqs ?? []) as RequestRow[];
    setRequests(list);
    const activeCount = merged.filter((u) => u.is_active && (u.activated_until ? new Date(u.activated_until) > new Date() : new Date(u.trial_ends_at) > new Date())).length;
    const pendingCount = list.filter((r) => r.status === "pending").length;
    setStats({ users: merged.length, active: activeCount, designs: (designs as any).count ?? 0, pending: pendingCount });
    if (s) setSettings({
      adsense_client: s.adsense_client ?? "", adsense_enabled: !!s.adsense_enabled, whatsapp_number: s.whatsapp_number ?? "",
      adsterra_rewarded_zone: s.adsterra_rewarded_zone ?? "", adsterra_interstitial_zone: s.adsterra_interstitial_zone ?? "",
      rewarded_ads_enabled: !!s.rewarded_ads_enabled, interstitial_ads_enabled: !!s.interstitial_ads_enabled,
      credits_per_ad: s.credits_per_ad ?? 1, max_daily_ad_credits: s.max_daily_ad_credits ?? 10,
      splash_ad_enabled: !!(s as any).splash_ad_enabled, splash_ad_frequency: ((s as any).splash_ad_frequency ?? "session") as "session" | "daily" | "always",
    });
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return <div className="p-6">جارٍ التحميل...</div>;
  if (!isAdmin) return <div className="p-6 text-center text-destructive">لا تملك صلاحية الوصول لهذه الصفحة</div>;

  const extend = async (userId: string, days: number) => {
    const until = new Date(Date.now() + days * 86400000).toISOString();
    await supabase.from("subscriptions").update({ activated_until: until, is_active: true, activated_at: new Date().toISOString() }).eq("user_id", userId);
    toast.success(`تم التفعيل ${days} يوم`);
    load();
  };

  const approveRequest = async (req: RequestRow, days: number) => {
    const until = new Date(Date.now() + days * 86400000).toISOString();
    const { error: subErr } = await supabase.from("subscriptions").update({ activated_until: until, is_active: true, activated_at: new Date().toISOString() }).eq("user_id", req.user_id);
    if (subErr) return toast.error("تعذر تفعيل الاشتراك");
    await supabase.from("activation_requests").update({ status: "approved", handled_at: new Date().toISOString(), handled_by: user?.id }).eq("id", req.id);
    toast.success(`تم القبول وتفعيل ${days} يوم`);
    load();
  };

  const rejectRequest = async (req: RequestRow) => {
    const { error } = await supabase.from("activation_requests").update({ status: "rejected", handled_at: new Date().toISOString(), handled_by: user?.id }).eq("id", req.id);
    if (error) return toast.error("تعذر تحديث الطلب");
    toast.success("تم رفض الطلب");
    load();
  };

  const deleteRequest = async (id: string) => {
    await supabase.from("activation_requests").delete().eq("id", id);
    load();
  };

  const toggle = async (userId: string, active: boolean) => {
    await supabase.from("subscriptions").update({ is_active: active }).eq("user_id", userId);
    load();
  };

  const saveSettings = async () => {
    const { error } = await supabase.from("app_settings").update(settings).eq("id", 1);
    if (error) return toast.error("تعذر الحفظ");
    toast.success("تم حفظ الإعدادات");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="size-6 text-gold" />
        <h1 className="text-2xl font-bold">لوحة الأدمن</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="إجمالي المستخدمين" value={stats.users} />
        <StatCard label="اشتراكات نشطة" value={stats.active} />
        <StatCard label="إجمالي التصميمات" value={stats.designs} />
        <StatCard label="طلبات تفعيل معلقة" value={stats.pending} highlight={stats.pending > 0} />
      </div>

      <Tabs defaultValue={stats.pending > 0 ? "requests" : "users"}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="requests" className="relative">
            <Inbox className="size-4" /> طلبات التفعيل
            {stats.pending > 0 && <Badge className="ms-2 bg-gold text-background h-5 px-1.5">{stats.pending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="users"><Users className="size-4" /> المستخدمون</TabsTrigger>
          <TabsTrigger value="ads"><Megaphone className="size-4" /> الإعلانات المخصصة</TabsTrigger>
          <TabsTrigger value="settings"><SettingsIcon className="size-4" /> الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4 space-y-3">
            {requests.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm">لا توجد طلبات تفعيل حتى الآن</div>
            )}
            {requests.map((r) => {
              const userSub = users.find((u) => u.id === r.user_id);
              return (
                <div key={r.id} className="rounded-xl border border-border/40 bg-background/40 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold">{r.full_name || "—"}</span>
                        <span className="text-sm text-muted-foreground" dir="ltr">{r.phone}</span>
                        {r.status === "pending" && <Badge variant="outline" className="border-gold/40 text-gold"><Clock className="size-3 me-1" />قيد المراجعة</Badge>}
                        {r.status === "approved" && <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30"><Check className="size-3 me-1" />مقبول</Badge>}
                        {r.status === "rejected" && <Badge variant="destructive"><X className="size-3 me-1" />مرفوض</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>تاريخ الطلب: {new Date(r.created_at).toLocaleString("ar-EG")}</div>
                        {userSub && (
                          <div>انتهاء التجربة: {userSub.trial_ends_at ? new Date(userSub.trial_ends_at).toLocaleDateString("ar-EG") : "—"} • مفعل حتى: {userSub.activated_until ? new Date(userSub.activated_until).toLocaleDateString("ar-EG") : "—"}</div>
                        )}
                        {r.handled_at && <div>تمت المعالجة: {new Date(r.handled_at).toLocaleString("ar-EG")}</div>}
                      </div>
                      {r.note && (
                        <div className="mt-2 text-sm bg-muted/30 rounded-lg p-2 border border-border/30">
                          <span className="text-xs text-muted-foreground">ملاحظة العميل: </span>{r.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {r.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-gradient-primary shadow-glow" onClick={() => approveRequest(r, 30)}><Check className="size-3.5 me-1" />قبول + 30 يوم</Button>
                        <Button size="sm" className="bg-gradient-primary shadow-glow" onClick={() => approveRequest(r, 365)}><Check className="size-3.5 me-1" />قبول + سنة</Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectRequest(r)}><X className="size-3.5 me-1" />رفض</Button>
                      </>
                    )}
                    <a
                      href={`https://wa.me/${r.phone.replace(/\D/g, "")}?text=${encodeURIComponent("بخصوص طلب تفعيل اشتراك كيتشن برو")}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center text-xs text-gold hover:underline px-2 py-1"
                    >تواصل واتساب</a>
                    <Button size="sm" variant="ghost" onClick={() => deleteRequest(r.id)} className="text-xs text-muted-foreground hover:text-destructive ms-auto">حذف</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4 overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/40 text-muted-foreground text-xs"><th className="text-right p-2">الاسم</th><th className="text-right p-2">الهاتف</th><th className="text-right p-2">انتهاء التجربة</th><th className="text-right p-2">مفعل حتى</th><th className="text-right p-2">الحالة</th><th>إجراءات</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/20">
                    <td className="p-2">{u.full_name || "-"}</td>
                    <td className="p-2" dir="ltr">{u.phone}</td>
                    <td className="p-2 text-xs">{u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString("ar-EG") : "-"}</td>
                    <td className="p-2 text-xs">{u.activated_until ? new Date(u.activated_until).toLocaleDateString("ar-EG") : "—"}</td>
                    <td className="p-2"><Switch checked={u.is_active} onCheckedChange={(v) => toggle(u.id, v)} /></td>
                    <td className="p-2 flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => extend(u.id, 30)}>+30 يوم</Button>
                      <Button size="sm" variant="outline" onClick={() => extend(u.id, 365)}>+سنة</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="ads" className="mt-4">
          <AdsManager />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-6 space-y-4 max-w-xl">
            <div>
              <Label>رقم واتساب الأدمن (لطلبات التفعيل)</Label>
              <Input dir="ltr" placeholder="+201234567890" value={settings.whatsapp_number} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>تفعيل إعلانات AdSense</Label>
              <Switch checked={settings.adsense_enabled} onCheckedChange={(v) => setSettings({ ...settings, adsense_enabled: v })} />
            </div>
            <div>
              <Label>كود AdSense Client (ca-pub-xxxxx)</Label>
              <Input dir="ltr" placeholder="ca-pub-1234567890" value={settings.adsense_client} onChange={(e) => setSettings({ ...settings, adsense_client: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">سيتم عرض الإعلانات داخل التطبيق للمستخدمين العاديين فقط.</p>
            </div>

            <div className="border-t border-border/40 pt-4 mt-4">
              <h3 className="font-semibold text-gold mb-3">إعلانات Adsterra (Rewarded + Interstitial)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>تفعيل إعلانات المكافأة (Rewarded)</Label>
                  <Switch checked={settings.rewarded_ads_enabled} onCheckedChange={(v) => setSettings({ ...settings, rewarded_ads_enabled: v })} />
                </div>
                <div>
                  <Label>Adsterra Rewarded Zone ID</Label>
                  <Input dir="ltr" placeholder="xxxxxxxxxxxxxxxxxxxx" value={settings.adsterra_rewarded_zone} onChange={(e) => setSettings({ ...settings, adsterra_rewarded_zone: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">كريديت لكل إعلان</Label>
                    <Input type="number" min="1" value={settings.credits_per_ad} onChange={(e) => setSettings({ ...settings, credits_per_ad: +e.target.value || 1 })} />
                  </div>
                  <div>
                    <Label className="text-xs">الحد اليومي للكريديت</Label>
                    <Input type="number" min="1" value={settings.max_daily_ad_credits} onChange={(e) => setSettings({ ...settings, max_daily_ad_credits: +e.target.value || 10 })} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label>تفعيل إعلان البداية (Interstitial)</Label>
                  <Switch checked={settings.interstitial_ads_enabled} onCheckedChange={(v) => setSettings({ ...settings, interstitial_ads_enabled: v })} />
                </div>
                <div>
                  <Label>Adsterra Interstitial Zone ID</Label>
                  <Input dir="ltr" placeholder="xxxxxxxxxxxxxxxxxxxx" value={settings.adsterra_interstitial_zone} onChange={(e) => setSettings({ ...settings, adsterra_interstitial_zone: e.target.value })} />
                  <p className="text-xs text-muted-foreground mt-1">يظهر مرة واحدة يومياً لكل مستخدم عادي (ليس الأدمن).</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 mt-4">
              <h3 className="font-semibold text-gold mb-3">فيديو ترحيبي عند الدخول (Splash Ad)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>تفعيل الفيديو الترحيبي</Label>
                  <Switch checked={settings.splash_ad_enabled} onCheckedChange={(v) => setSettings({ ...settings, splash_ad_enabled: v })} />
                </div>
                <div>
                  <Label>تكرار الظهور</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={settings.splash_ad_frequency}
                    onChange={(e) => setSettings({ ...settings, splash_ad_frequency: e.target.value as "session" | "daily" | "always" })}
                  >
                    <option value="session">مرة واحدة لكل جلسة</option>
                    <option value="daily">مرة واحدة يومياً</option>
                    <option value="always">في كل دخول</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">أضف فيديوهات من تبويب "الإعلانات المخصصة" — يتم اختيار واحد عشوائياً.</p>
                </div>
              </div>
            </div>

            <Button onClick={saveSettings} className="bg-gradient-primary shadow-glow">حفظ الإعدادات</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "border-gold/60 bg-gold/5 shadow-gold" : "border-border/60 bg-card/50"}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-3xl font-bold ${highlight ? "text-gold" : "text-gradient"}`}>{value}</div>
    </div>
  );
}
