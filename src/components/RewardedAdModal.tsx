import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Sparkles, Loader2, Gift, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const WATCH_SECONDS = 25;

/** Rewarded ad modal: user opens Adsterra ad (popup), waits timer, then we grant credit via RPC. */
export function RewardedAdModal({
  open,
  onOpenChange,
  onCreditGranted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreditGranted?: (newBalance: number) => void;
}) {
  const { user } = useAuth();
  const [zone, setZone] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [opened, setOpened] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [claiming, setClaiming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("app_settings")
      .select("adsterra_rewarded_zone,rewarded_ads_enabled")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setZone(data?.adsterra_rewarded_zone ?? null);
        setEnabled(!!data?.rewarded_ads_enabled);
      });
    setOpened(false);
    setSecondsLeft(WATCH_SECONDS);
  }, [open]);

  useEffect(() => {
    if (!opened) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [opened]);

  const openAd = () => {
    if (!zone) return;
    const url = `https://www.profitableratecpm.com/${zone}/`;
    window.open(url, "_blank", "noopener,noreferrer,width=900,height=700");
    setOpened(true);
  };

  const claim = async () => {
    if (!user) return;
    setClaiming(true);
    const { data, error } = await supabase.rpc("grant_rewarded_ad_credit", { _user_id: user.id });
    setClaiming(false);
    if (error) {
      console.error("[ads] grant error", error);
      return toast.error("تعذر منح الكريديت، حاول مرة أخرى");
    }
    const res = data as { ok: boolean; reason?: string; credits?: number; granted?: number } | null;
    if (!res?.ok) {
      if (res?.reason === "daily_limit") toast.error("وصلت الحد اليومي للإعلانات، حاول غدًا");
      else if (res?.reason === "disabled") toast.error("نظام الإعلانات معطل حاليًا");
      else toast.error("تعذر منح الكريديت");
      return;
    }
    toast.success(`تم إضافة ${res.granted} كريديت! رصيدك: ${res.credits}`);
    onCreditGranted?.(res.credits ?? 0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="size-5 text-gold" /> احصل على كريديت AI مجاني
          </DialogTitle>
        </DialogHeader>

        {!enabled || !zone ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            نظام الإعلانات بمكافأة غير متاح حاليًا. يرجى التواصل مع الأدمن.
          </div>
        ) : !opened ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-gradient-to-br from-gold/10 to-primary/10 border border-gold/30 p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Sparkles className="size-4 text-gold" /> كيف يعمل النظام؟
              </div>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal me-4">
                <li>اضغط "مشاهدة الإعلان" — سيُفتح في تبويب جديد</li>
                <li>انتظر {WATCH_SECONDS} ثانية على الأقل</li>
                <li>ارجع لهنا واضغط "استلام الكريديت"</li>
              </ol>
            </div>
            <Button onClick={openAd} className="w-full bg-gradient-primary shadow-glow gap-2">
              <ExternalLink className="size-4" /> مشاهدة الإعلان
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-center">
            <div className="text-4xl font-bold tabular-nums text-gold">{secondsLeft}</div>
            <p className="text-sm text-muted-foreground">
              {secondsLeft > 0
                ? "انتظر انتهاء العداد ثم استلم الكريديت"
                : "تم! اضغط للحصول على الكريديت"}
            </p>
            <Button
              onClick={claim}
              disabled={secondsLeft > 0 || claiming}
              className="w-full bg-gradient-primary shadow-glow gap-2"
            >
              {claiming ? <Loader2 className="size-4 animate-spin" /> : <Gift className="size-4" />}
              استلام الكريديت
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
