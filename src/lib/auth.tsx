import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthSubscription {
  trial_ends_at: string;
  is_active: boolean;
  activated_until: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  subscription: AuthSubscription | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscription, setSubscription] = useState<AuthSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserMeta = async (uid: string) => {
    const [{ data: roleData }, { data: subData }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase
        .from("subscriptions")
        .select("trial_ends_at,is_active,activated_until")
        .eq("user_id", uid)
        .maybeSingle(),
    ]);
    setIsAdmin(!!roleData?.some((r) => r.role === "admin"));
    setSubscription(subData ?? null);
  };

  const refresh = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await loadUserMeta(data.session.user.id);
      } else {
        setIsAdmin(false);
        setSubscription(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fallback = window.setTimeout(() => setLoading(false), 4000);
    const {
      data: { subscription: sub },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      window.clearTimeout(fallback);
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadUserMeta(s.user.id), 0);
      } else {
        setIsAdmin(false);
        setSubscription(null);
      }
      setLoading(false);
    });
    refresh();
    return () => {
      window.clearTimeout(fallback);
      sub.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, subscription, loading, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export function isSubscriptionActive(sub: AuthSubscription | null): boolean {
  if (!sub || !sub.is_active) return false;
  const now = Date.now();
  if (sub.activated_until && new Date(sub.activated_until).getTime() > now) return true;
  return new Date(sub.trial_ends_at).getTime() > now;
}
