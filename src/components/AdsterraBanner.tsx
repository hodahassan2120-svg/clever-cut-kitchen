import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/** Adsterra iframe banner — hidden for admins. Reads key + enabled from app_settings. */
export function AdsterraBanner({ className = "" }: { className?: string }) {
  const { isAdmin } = useAuth();
  const [cfg, setCfg] = useState<{ key: string; enabled: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    supabase.from("app_settings")
      .select("adsterra_banner_key,adsterra_banner_enabled")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCfg({ key: data.adsterra_banner_key ?? "", enabled: !!data.adsterra_banner_enabled });
      });
  }, []);

  useEffect(() => {
    if (isAdmin || !cfg?.enabled || !cfg.key || !containerRef.current || injectedRef.current) return;
    injectedRef.current = true;

    const container = containerRef.current;
    const iframe = document.createElement("iframe");
    iframe.style.width = "160px";
    iframe.style.height = "300px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.scrolling = "no";
    iframe.frameBorder = "0";
    iframe.allowTransparency = true;

    const scriptContent = `
      atOptions = {
        key: '${cfg.key}',
        format: 'iframe',
        height: 300,
        width: 160,
        params: {}
      };
    `;
    const scriptSrc = `https://www.highperformanceformat.com/${cfg.key}/invoke.js`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;overflow:hidden;background:transparent;">
          <script>${scriptContent}<\/script>
          <script src="${scriptSrc}"><\/script>
        </body>
      </html>
    `;

    iframe.srcdoc = html;
    container.appendChild(iframe);

    return () => {
      if (container.contains(iframe)) container.removeChild(iframe);
      injectedRef.current = false;
    };
  }, [cfg, isAdmin]);

  if (isAdmin || !cfg?.enabled || !cfg.key) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -top-2 -right-1 z-10 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px]">إعلان</div>
      <div ref={containerRef} className="mx-auto" style={{ width: 160, height: 300 }} />
    </div>
  );
}
