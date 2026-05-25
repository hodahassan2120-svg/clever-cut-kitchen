import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AuthProvider, useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">حدث خطأ ما</h1>
        <p className="mt-2 text-sm text-muted-foreground">حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "كيتشن برو — تصميم مطابخ احترافي 2D و 3D" },
      { name: "description", content: "برنامج تصميم مطابخ احترافي ثنائي وثلاثي الأبعاد مع خدمات تقطيع الألواح والأعواد وإدارة المخزون." },
      { name: "author", content: "Kitchen Pro" },
      { property: "og:title", content: "كيتشن برو — تصميم مطابخ احترافي 2D و 3D" },
      { property: "og:description", content: "برنامج تصميم مطابخ احترافي ثنائي وثلاثي الأبعاد مع خدمات تقطيع الألواح والأعواد وإدارة المخزون." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "كيتشن برو — تصميم مطابخ احترافي 2D و 3D" },
      { name: "twitter:description", content: "برنامج تصميم مطابخ احترافي ثنائي وثلاثي الأبعاد مع خدمات تقطيع الألواح والأعواد وإدارة المخزون." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e8aa8267-e4d2-4cee-9e3f-e64c19659246/id-preview-286b08e7--d078364e-13c1-4832-9511-8fa748702a3d.lovable.app-1779667297103.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e8aa8267-e4d2-4cee-9e3f-e64c19659246/id-preview-286b08e7--d078364e-13c1-4832-9511-8fa748702a3d.lovable.app-1779667297103.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-adsense-account", content: "ca-pub-4960064688919124" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthInvalidator() {
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
    });
    return () => subscription.unsubscribe();
  }, [router]);
  return null;
}

function UnregisterOldSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((r) => r.unregister().catch(() => {}));
    }).catch(() => {});
  }, []);
  return null;
}

// Monetag auto-ads (popup/vignette) removed by user request.
// External ads now only trigger from the AI realistic render action via RewardedAdModal.


function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthInvalidator />
        <UnregisterOldSW />

        <Outlet />
        <Toaster richColors position="top-center" dir="rtl" theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export { useAuth };
