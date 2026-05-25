import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, isSubscriptionActive } from "@/lib/auth";
import { Cuboid, Scissors, Ruler, Archive, Save, LogOut, Shield, Sparkles, Home, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { user, loading, subscription, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div>;
  }

  const active = isSubscriptionActive(subscription);
  const daysLeft = subscription ? Math.max(0, Math.ceil((new Date(subscription.activated_until ?? subscription.trial_ends_at).getTime() - Date.now()) / 86400000)) : 0;

  if (!active && !isAdmin) {
    return <TrialExpired onSignOut={signOut} userId={user.id} />;
  }

  const links = [
    { to: "/app", label: "الرئيسية", icon: Home, exact: true },
    { to: "/app/design", label: "محرر التصميم", icon: Cuboid },
    { to: "/app/designs", label: "تصميماتي", icon: Save },
    { to: "/app/boards", label: "تقطيع الألواح", icon: Scissors },
    { to: "/app/rods", label: "تقطيع الأعواد", icon: Ruler },
    { to: "/app/inventory", label: "المخزون", icon: Archive },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-l border-border/60 bg-sidebar p-4 flex-col">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="size-9 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center">
            <Cuboid className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display">كيتشن برو</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={l.exact ? { exact: true } : undefined}
              activeProps={{ className: "bg-sidebar-accent text-primary" }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-sidebar-accent/60 transition"
            >
              <l.icon className="size-4" /> {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/app/admin" activeProps={{ className: "bg-sidebar-accent text-gold" }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-sidebar-accent/60 transition border-t border-border/40 mt-4 pt-4">
              <Shield className="size-4" /> لوحة الأدمن
            </Link>
          )}
        </nav>
        <div className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-3 text-xs">
          <div className="flex items-center gap-1.5 text-gold font-semibold mb-1"><Sparkles className="size-3" /> {subscription?.activated_until ? "اشتراك مفعل" : "تجربة مجانية"}</div>
          <div className="text-muted-foreground">متبقي {daysLeft} يوم</div>
        </div>
        <ConfirmSignOutButton onConfirm={signOut} className="mt-3 justify-start text-muted-foreground" />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between border-b border-border/60 bg-sidebar/80 backdrop-blur px-3 h-12 sticky top-0 z-40">
        <Link to="/app" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-gradient-primary shadow-glow flex items-center justify-center">
            <Cuboid className="size-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold font-display">كيتشن برو</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gold">متبقي {daysLeft}ي</span>
          <ConfirmSignOutButton onConfirm={signOut} iconOnly className="size-8" />
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-sidebar/95 backdrop-blur grid grid-cols-6 h-14">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={l.exact ? { exact: true } : undefined}
            activeProps={{ className: "text-primary" }}
            className="flex flex-col items-center justify-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground transition"
          >
            <l.icon className="size-4" />
            <span className="leading-none">{l.label.replace("محرر التصميم", "تصميم").replace("تقطيع ", "")}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function ConfirmSignOutButton({ onConfirm, iconOnly = false, className }: { onConfirm: () => void | Promise<void>; iconOnly?: boolean; className?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size={iconOnly ? "icon" : "default"} className={className} aria-label="تسجيل خروج">
          <LogOut className="size-4" />
          {!iconOnly && "خروج"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl" className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
          <AlertDialogDescription>هل تريد تسجيل الخروج من الحساب الحالي؟</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>تسجيل خروج</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TrialExpired({ onSignOut, userId }: { onSignOut: () => void; userId: string }) {
  const [existing, setExisting] = useState<{ status: string; created_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [whatsapp, setWhatsapp] = useState<string>("");

  useEffect(() => {
    (async () => {
      const [{ data: req }, { data: profile }, { data: settings }] = await Promise.all([
        supabase.from("activation_requests").select("status,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("profiles").select("phone,full_name").eq("id", userId).maybeSingle(),
        supabase.from("app_settings").select("whatsapp_number").eq("id", 1).maybeSingle(),
      ]);
      setExisting(req ?? null);
      if (profile) { setName(profile.full_name ?? ""); setPhone(profile.phone ?? ""); }
      setWhatsapp(settings?.whatsapp_number ?? "");
      setLoading(false);
    })();
  }, [userId]);

  const submit = async () => {
    if (!name.trim() || !phone.trim()) return toast.error("الاسم والهاتف مطلوبان");
    setSubmitting(true);
    const { error } = await supabase.from("activation_requests").insert({ user_id: userId, phone: phone.trim(), full_name: name.trim(), note: note.trim() || null });
    setSubmitting(false);
    if (error) return toast.error("تعذر إرسال الطلب");
    toast.success("تم إرسال طلب التفعيل، سيتم مراجعته قريباً");
    setExisting({ status: "pending", created_at: new Date().toISOString() });
  };

  const whatsappLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=` + encodeURIComponent(`طلب تفعيل اشتراك\nالاسم: ${name}\nالهاتف: ${phone}`)
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-gold/30 bg-card/80 p-8 shadow-gold">
        <div className="size-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow mb-4">
          <Sparkles className="size-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">انتهت فترة التجربة</h1>
        <p className="text-muted-foreground mb-6 text-center text-sm">للاستمرار في استخدام البرنامج، أرسل طلب تفعيل للأدمن وسيتم التواصل معك.</p>

        {loading ? (
          <div className="text-center text-muted-foreground text-sm">جارٍ التحميل...</div>
        ) : existing ? (
          <div className="space-y-3">
            <div className={`rounded-xl border p-4 text-sm flex items-start gap-3 ${
              existing.status === "approved" ? "border-emerald-500/40 bg-emerald-500/5" :
              existing.status === "rejected" ? "border-destructive/40 bg-destructive/5" :
              "border-gold/40 bg-gold/5"
            }`}>
              {existing.status === "approved" ? <CheckCircle2 className="size-5 text-emerald-500 shrink-0" /> :
               existing.status === "rejected" ? <XCircle className="size-5 text-destructive shrink-0" /> :
               <Clock className="size-5 text-gold shrink-0" />}
              <div>
                <div className="font-semibold mb-1">
                  {existing.status === "approved" ? "تم قبول طلبك" :
                   existing.status === "rejected" ? "تم رفض الطلب" :
                   "طلبك قيد المراجعة"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {existing.status === "approved" ? "حدّث الصفحة لتفعيل اشتراكك." :
                   existing.status === "rejected" ? "يمكنك التواصل مع الأدمن أو إرسال طلب جديد." :
                   `تم الإرسال ${new Date(existing.created_at).toLocaleDateString("ar-EG")} — سنرد عليك قريباً.`}
                </div>
              </div>
            </div>
            {existing.status === "approved" && (
              <Button onClick={() => location.reload()} className="w-full bg-gradient-primary shadow-glow">تحديث الصفحة</Button>
            )}
            {existing.status === "rejected" && (
              <Button onClick={() => setExisting(null)} variant="outline" className="w-full">إرسال طلب جديد</Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">الاسم الكامل</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" />
            </div>
            <div>
              <Label className="text-xs">رقم الهاتف</Label>
              <Input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+201234567890" />
            </div>
            <div>
              <Label className="text-xs">ملاحظة (اختياري)</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="أي تفاصيل تود إضافتها..." rows={2} />
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full bg-gradient-primary shadow-glow">
              {submitting ? "جارٍ الإرسال..." : "إرسال طلب التفعيل"}
            </Button>
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="block text-center text-xs text-gold hover:underline">
                أو تواصل عبر واتساب
              </a>
            )}
          </div>
        )}

        <Button onClick={onSignOut} variant="ghost" className="mt-4 w-full text-xs">تسجيل خروج</Button>
      </div>
    </div>
  );
}
