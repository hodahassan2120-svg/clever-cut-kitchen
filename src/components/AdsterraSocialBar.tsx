import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

/**
 * Adsterra Social Bar — sticky bottom ad shown only for free/trial users.
 * Hidden for admins, paid subscribers, and while AI image generation is running
 * (toggled via `document.body.dataset.aiRendering`).
 */
export function AdsterraSocialBar() {
  const { isAdmin, subscription } = useAuth();
  const [aiBusy, setAiBusy] = useState(false);

  const isPaid =
    !!subscription?.activated_until &&
    new Date(subscription.activated_until).getTime() > Date.now();

  const shouldShow = !isAdmin && !isPaid;

  // Watch body[data-ai-rendering] to hide during AI generation.
  useEffect(() => {
    if (!shouldShow || typeof document === "undefined") return;
    const update = () => setAiBusy(document.body.dataset.aiRendering === "true");
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-ai-rendering"] });
    return () => mo.disconnect();
  }, [shouldShow]);

  // Inject Social Bar script once.
  useEffect(() => {
    if (!shouldShow || typeof document === "undefined") return;
    const SRC = "https://pl29572313.effectivecpmnetwork.com/75/94/90/7594901b0d4e8691c5ae1450c5a36da2.js";
    if (document.querySelector(`script[data-ad="adsterra-social-bar"]`)) return;
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.dataset.ad = "adsterra-social-bar";
    document.body.appendChild(s);
    return () => {
      // Don't remove the script (Adsterra creates DOM that's hard to fully clean up);
      // we control visibility via CSS below instead.
    };
  }, [shouldShow]);

  // Hide Adsterra-injected elements when ads shouldn't show or AI is generating.
  // The script appends elements with id `social-bar-*` / known wrappers at body root.
  if (typeof document !== "undefined") {
    const hide = !shouldShow || aiBusy;
    document.body.classList.toggle("hide-adsterra-social", hide);
  }

  return null;
}
