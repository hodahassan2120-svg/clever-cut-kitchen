import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

declare global {
  interface Window { adsbygoogle?: unknown[]; }
}

let scriptLoaded = false;

/** Google AdSense slot — hidden for admins. Reads client + enabled from app_settings. */
export function AdSlot({ slot, format = "auto", className = "" }: { slot?: string; format?: string; className?: string }) {
  const { isAdmin } = useAuth();
  const [cfg, setCfg] = useState<{ client: string; enabled: boolean } | null>(null);

  useEffect(() => {
    supabase.from("app_settings").select("adsense_client,adsense_enabled").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setCfg({ client: data.adsense_client ?? "", enabled: !!data.adsense_enabled });
    });
  }, []);

  useEffect(() => {
    if (!cfg?.enabled || !cfg.client || isAdmin) return;
    if (!scriptLoaded && typeof document !== "undefined") {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.client}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
      scriptLoaded = true;
    }
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* noop */ }
  }, [cfg, isAdmin]);

  if (isAdmin || !cfg?.enabled || !cfg.client) return null;
  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={cfg.client}
      data-ad-slot={slot ?? ""}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
