import { createFileRoute, Link } from "@tanstack/react-router";
import { Cuboid, Scissors, Ruler, Archive, Save, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/")({ component: AppHome });

function AppHome() {
  const { isAdmin } = useAuth();
  const tiles = [
    { to: "/app/design", label: "محرر التصميم", desc: "ارسم مطبخك 2D و 3D", icon: Cuboid, color: "from-amber-500 to-orange-600" },
    { to: "/app/designs", label: "تصميماتي", desc: "تصفح التصاميم المحفوظة", icon: Save, color: "from-emerald-500 to-teal-600" },
    { to: "/app/boards", label: "تقطيع الألواح", desc: "خوارزمية تقطيع ذكية", icon: Scissors, color: "from-sky-500 to-indigo-600" },
    { to: "/app/rods", label: "تقطيع الأعواد", desc: "تخطيط مثالي للأعواد", icon: Ruler, color: "from-rose-500 to-pink-600" },
    { to: "/app/inventory", label: "المخزون", desc: "إدارة الألواح والأعواد", icon: Archive, color: "from-violet-500 to-purple-600" },
  ];
  if (isAdmin) {
    tiles.push({ to: "/app/admin", label: "لوحة الأدمن", desc: "إدارة المستخدمين", icon: Shield, color: "from-yellow-500 to-amber-700" });
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 md:mb-10 text-center md:text-right">
        <h1 className="text-2xl md:text-4xl font-bold font-display mb-2">أهلاً بك في كيتشن برو</h1>
        <p className="text-sm md:text-base text-muted-foreground">اختر الميزة التي تريد استخدامها</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group relative aspect-square md:aspect-[4/3] rounded-2xl border border-border/60 bg-card/60 p-4 md:p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:shadow-glow transition-all overflow-hidden"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${t.color} transition-opacity`} />
            <div className={`size-14 md:size-16 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
              <t.icon className="size-7 md:size-8 text-white" />
            </div>
            <div className="font-bold text-sm md:text-base mb-1">{t.label}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
