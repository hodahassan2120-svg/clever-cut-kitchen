import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail, isValidPhone, normalizePhone } from "@/lib/phone";
import { Cuboid } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return toast.error("رقم هاتف غير صحيح");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(normalizePhone(phone)),
      password,
    });
    setLoading(false);
    if (error) return toast.error("بيانات الدخول غير صحيحة");
    await refresh();
    toast.success("تم الدخول بنجاح");
    navigate({ to: "/app/design" });
  };

  return (
    <AuthShell title="تسجيل الدخول" subtitle="ادخل ببياناتك للوصول إلى مطابخك">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input id="phone" inputMode="tel" dir="ltr" placeholder="+201234567890" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
          {loading ? "جارٍ الدخول..." : "دخول"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link to="/register" className="text-primary hover:underline">سجل مجاناً</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="size-10 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center">
            <Cuboid className="size-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-display">كيتشن برو</span>
        </Link>
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur p-8 shadow-card">
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
