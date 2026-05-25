import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail, isValidPhone, normalizePhone } from "@/lib/phone";
import { AuthShell } from "./login";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return toast.error("رقم هاتف غير صحيح");
    if (password.length < 6) return toast.error("كلمة المرور 6 أحرف على الأقل");
    setLoading(true);
    const clean = normalizePhone(phone);
    const { error } = await supabase.auth.signUp({
      email: phoneToEmail(clean),
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { phone: clean, full_name: name },
      },
    });
    setLoading(false);
    if (error) {
      console.error("register error:", error);
      return toast.error(error.message.includes("already") ? "هذا الرقم مسجل بالفعل" : "تعذر التسجيل، يرجى المحاولة مرة أخرى");
    }
    await refresh();
    toast.success("تم إنشاء حسابك! تجربة مجانية 7 أيام");
    navigate({ to: "/app" });
  };

  return (
    <AuthShell title="حساب جديد" subtitle="تجربة مجانية لمدة 7 أيام — بدون رسوم">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">الاسم الكامل</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input id="phone" inputMode="tel" dir="ltr" placeholder="+201234567890" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
          {loading ? "جارٍ الإنشاء..." : "إنشاء حساب والبدء"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          لديك حساب؟{" "}
          <Link to="/login" className="text-primary hover:underline">دخول</Link>
        </p>
      </form>
    </AuthShell>
  );
}
