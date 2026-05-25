import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ExternalLink, X } from "lucide-react";

const SKIP_AFTER_SECONDS = 5;
const STORAGE_KEY = "lastInterstitialDate";

/** Once-per-day interstitial ad shown to non-admins when entering /app. */
export function InterstitialAd() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [zone, setZone] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SKIP_AFTER_SECONDS);
  const [adOpened, setAdOpened] = useState(false);

  useEffect(() => {
    if (!user || isAdmin) return;
    const today = new Date().toISOString().slice(0, 10);
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === today) return;

    supabase
      .from("app_settings")
      .select("adsterra_interstitial_zone,interstitial_ads_enabled")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.interstitial_ads_enabled && data.adsterra_interstitial_zone) {
          setZone(data.adsterra_interstitial_zone);
          setOpen(true);
          localStorage.setItem(STORAGE_KEY, today);
          supabase.rpc("log_interstitial_view", { _user_id: user.id }).then(() => {});
        }
      });
  }, [user, isAdmin]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [open]);

  const watch = () => {
    if (!zone) return;
    window.open(`https://www.profitableratecpm.com/${zone}/`, "_blank", "noopener,noreferrer");
    setAdOpened(true);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir="rtl" className="max-w-md" hideClose>
        <div className="space-y-4 py-2">
          <h2 className="text-xl font-bold text-center">إعلان قصير 🎬</h2>
          <p className="text-sm text-muted-foreground text-center">
            مرحبًا بك في كيتشن برو. ادعمنا بمشاهدة إعلان سريع لاستمرار الخدمة المجانية.
          </p>
          {!adOpened && (
            <Button onClick={watch} className="w-full bg-gradient-primary shadow-glow gap-2">
              <ExternalLink className="size-4" /> مشاهدة الإعلان
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={secondsLeft > 0}
            className="w-full gap-2"
          >
            <X className="size-4" />
            {secondsLeft > 0 ? `تخطي بعد ${secondsLeft} ثانية` : "إغلاق والمتابعة"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
