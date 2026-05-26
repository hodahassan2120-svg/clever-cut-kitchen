import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { X } from "lucide-react";

type Banner = { id: string; media_url: string; link_url: string | null; title: string };

/** Custom self-served banner (image). Picks a random enabled banner. Hidden for admins. */
export function CustomBanner({ className = "" }: { className?: string }) {
  const { isAdmin } = useAuth();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (isAdmin) return;
    supabase.from("custom_ads")
      .select("id,media_url,link_url,title")
      .eq("ad_type", "banner").eq("enabled", true)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        setBanner(data[Math.floor(Math.random() * data.length)]);
      });
  }, [isAdmin]);

  if (isAdmin || !banner || closed) return null;

  const content = (
    <img src={banner.media_url} alt={banner.title || "إعلان"} className="w-full h-auto object-cover" loading="lazy" />
  );

  return (
    <div className={`relative rounded-lg overflow-hidden border border-border/40 bg-card/40 ${className}`}>
      <button
        onClick={() => setClosed(true)}
        aria-label="إغلاق الإعلان"
        className="absolute top-2 left-2 z-10 size-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
      >
        <X className="size-3.5" />
      </button>
      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">إعلان</div>
      {banner.link_url ? (
        <a href={banner.link_url} target="_blank" rel="noopener noreferrer sponsored" className="block">{content}</a>
      ) : content}
    </div>
  );
}
