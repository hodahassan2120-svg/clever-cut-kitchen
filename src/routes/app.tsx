import { createFileRoute, Outlet, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, isSubscriptionActive } from "@/lib/auth";
import { Cuboid, Box, Scissors, Ruler, Archive, Save, LogOut, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    return <TrialExpired onSignOut={signOut} />;
  }

  const links = [
    { to: "/app/design", label: "محرر التصميم", icon: Cuboid },
    { to: "/app/designs", label: "تصميماتي", icon: Save },
    { to: "/app/boards", label: "تقطيع الألواح", icon: Scissors },
    { to: "/app/rods", label: "تقطيع الأعواد", icon: Ruler },
    { to: "/app/inventory", label: "المخزون", icon: Archive },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-l border-border/60 bg-sidebar p-4 flex flex-col">
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
        <Button onClick={signOut} variant="ghost" className="mt-3 justify-start text-muted-foreground">
          <LogOut className="size-4" /> خروج
        </Button>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function TrialExpired({ onSignOut }: { onSignOut: () => void }) {
  // Read whatsapp number from settings — fetched lazily
  const whatsappLink = "https://wa.me/?text=" + encodeURIComponent("أرغب في تفعيل اشتراك كيتشن برو");
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-gold/30 bg-card/80 p-8 text-center shadow-gold">
        <div className="size-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow mb-4">
          <Sparkles className="size-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">انتهت فترة التجربة</h1>
        <p className="text-muted-foreground mb-6">للاستمرار في استخدام البرنامج، يرجى التواصل معنا لتفعيل اشتراكك.</p>
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex w-full justify-center items-center gap-2 rounded-md bg-gradient-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-glow">
          تواصل عبر واتساب للتفعيل
        </a>
        <Button onClick={onSignOut} variant="ghost" className="mt-3 w-full">تسجيل خروج</Button>
      </div>
    </div>
  );
}
