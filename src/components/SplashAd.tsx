import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Volume2, VolumeX } from "lucide-react";

type SplashAd = { id: string; media_url: string; link_url: string | null; title: string; skip_seconds: number };

/** Full-screen video splash ad shown on /app entry. Hidden for admins. */
export function SplashAd() {
  const { user, isAdmin } = useAuth();
  const [ad, setAd] = useState<SplashAd | null>(null);
  const [skipIn, setSkipIn] = useState(5);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!user || isAdmin) return;
    (async () => {
      const { data: settings } = await supabase
        .from("app_settings").select("splash_ad_enabled,splash_ad_frequency").eq("id", 1).maybeSingle();
      if (!settings?.splash_ad_enabled) return;

      const freq = settings.splash_ad_frequency ?? "session";
      const storage = freq === "daily" ? localStorage : sessionStorage;
      const key = "splashAdShown";
      const today = new Date().toISOString().slice(0, 10);
      if (freq !== "always" && storage.getItem(key) === (freq === "daily" ? today : "1")) return;

      const { data: ads } = await supabase
        .from("custom_ads").select("id,media_url,link_url,title,skip_seconds")
        .eq("ad_type", "splash_video").eq("enabled", true);
      if (!ads || ads.length === 0) return;

      // Weighted random pick (simple uniform here since list is small)
      const pick = ads[Math.floor(Math.random() * ads.length)];
      setAd(pick);
      setSkipIn(pick.skip_seconds || 5);
      storage.setItem(key, freq === "daily" ? today : "1");
    })();
  }, [user, isAdmin]);

  useEffect(() => {
    if (!ad) return;
    const id = setInterval(() => setSkipIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [ad]);

  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" dir="rtl">
      <video
        ref={videoRef}
        src={ad.media_url}
        autoPlay
        playsInline
        muted={muted}
        onEnded={() => setSkipIn(0)}
        className="max-h-full max-w-full"
      />

      <div className="absolute top-4 left-4 flex gap-2">
        <Button size="icon" variant="secondary" className="size-10 rounded-full bg-black/60 hover:bg-black/80" onClick={() => setMuted((m) => !m)}>
          {muted ? <VolumeX className="size-4 text-white" /> : <Volume2 className="size-4 text-white" />}
        </Button>
      </div>

      <div className="absolute top-4 right-4">
        {skipIn > 0 ? (
          <div className="px-4 py-2 rounded-full bg-black/60 text-white text-sm">
            تخطي بعد {skipIn} ث
          </div>
        ) : (
          <Button size="sm" onClick={() => setAd(null)} className="bg-white/90 text-black hover:bg-white gap-2">
            <X className="size-4" /> تخطي الإعلان
          </Button>
        )}
      </div>

      {ad.title && (
        <div className="absolute bottom-24 inset-x-0 text-center text-white text-lg font-bold drop-shadow-lg px-4">
          {ad.title}
        </div>
      )}

      {ad.link_url && (
        <div className="absolute bottom-8 inset-x-0 flex justify-center">
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gradient-primary shadow-glow gap-2">
              <ExternalLink className="size-4" /> زيارة المُعلن
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
