import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Gift, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

let globalSmartLink: string | null = null;
let globalLoading = false;
const listeners = new Set<() => void>();

function notify() { listeners.forEach((fn) => fn()); }

function useSmartLinkConfig() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  if (!globalSmartLink && !globalLoading) {
    globalLoading = true;
    supabase.from("app_settings")
      .select("adsterra_smart_link")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        globalSmartLink = data?.adsterra_smart_link ?? null;
        globalLoading = false;
        notify();
      });
  }
  return globalSmartLink;
}

/**
 * SmartLinkGate — wraps a high-value action behind a smart-link ad open.
 * When user clicks, the smart link opens in a new tab.
 * After the user returns and clicks again, the action executes.
 */
export function SmartLinkGate({
  children,
  onUnlock,
  label = "شاهد إعلان",
  unlockedLabel = "استمر",
  icon = <Gift className="size-4" />,
  className = "",
}: {
  children?: React.ReactNode;
  onUnlock: () => void;
  label?: string;
  unlockedLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const link = useSmartLinkConfig();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const onVis = () => {
      if (!document.hidden) setOpened(true); // already true, but triggers re-check
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [opened]);

  const handleClick = useCallback(() => {
    if (!link) {
      toast.error("لم يتم تكوين السمارت لينك بعد");
      return;
    }
    if (!opened) {
      window.open(link, "_blank", "noopener,noreferrer");
      setOpened(true);
      toast.info("فتح الإعلان في تبويب جديد — ارجع واضغط استمر");
      return;
    }
    onUnlock();
    setOpened(false);
  }, [link, opened, onUnlock]);

  if (!link) return null;

  return (
    <Button
      onClick={handleClick}
      variant={opened ? "default" : "outline"}
      size="sm"
      className={`gap-1.5 ${className}`}
    >
      {opened ? icon : <ExternalLink className="size-4" />}
      {opened ? unlockedLabel : label}
      {children}
    </Button>
  );
}

/** Dedicated "Export PDF via Smart Link" button for boards/rods. */
export function SmartLinkPDFExport({
  onExport,
  label = "تصدير PDF مجاناً",
}: {
  onExport: () => void;
  label?: string;
}) {
  return (
    <SmartLinkGate
      onUnlock={onExport}
      label={label}
      unlockedLabel="تصدير الآن"
      icon={<FileDown className="size-4" />}
      className="text-xs"
    />
  );
}
