import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

const SCRIPT_SRC =
  "https://pl29545042.effectivecpmnetwork.com/89/91/a2/8991a2fef8f44582caf0c6f5fbe8d462.js";
const SCRIPT_ID = "adsterra-social-bar";

/** Adsterra Social Bar — injects the script once. Hidden for admins. */
export function SocialBarAd() {
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (!user || isAdmin) return;
    if (typeof document === "undefined") return;
    if (document.getElementById(SCRIPT_ID)) return;

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, [isAdmin, user]);

  return null;
}
