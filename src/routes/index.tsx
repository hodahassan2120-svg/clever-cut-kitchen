import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Ruler, Layers, Sparkles, Cuboid, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "كيتشن برو — تصميم مطابخ احترافي" },
      { name: "description", content: "برنامج تصميم مطابخ شامل ثنائي وثلاثي الأبعاد مع تقطيع الألواح والأعواد وإدارة المخزون. تجربة مجانية لمدة 7 أيام." },
    ],
  }),
});

function Landing() {
  const features = [
    { icon: Cuboid, title: "تصميم 2D و 3D", desc: "محرر متكامل لرسم المطبخ ومعاينته بالأبعاد الثلاثية" },
    { icon: Layers, title: "بلوكات جاهزة", desc: "مكتبة وحدات مطبخ كاملة بأبعاد قابلة للتعديل" },
    { icon: Scissors, title: "تقطيع الألواح", desc: "خوارزمية ذكية لأفضل استغلال للألواح وأقل هدر" },
    { icon: Ruler, title: "تقطيع الأعواد", desc: "تخطيط مثالي لقطع الأعواد من المخزون المتوفر" },
    { icon: Box, title: "إدارة المخزون", desc: "أضف مقاسات الألواح والأعواد وتتبع كمياتك" },
    { icon: Sparkles, title: "تجربة 7 أيام مجاناً", desc: "ابدأ مباشرة بدون أي رسوم لاكتشاف كل المميزات" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center">
              <Cuboid className="size-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">كيتشن برو</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/login">دخول</Link></Button>
            <Button asChild className="bg-gradient-primary shadow-glow"><Link to="/register">ابدأ مجاناً</Link></Button>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-sm text-gold mb-6">
          <Sparkles className="size-4" /> تجربة مجانية 7 أيام — بدون بطاقة ائتمان
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          صمم مطبخك<br />
          <span className="text-gradient">باحترافية حقيقية</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          برنامج متكامل لتصميم المطابخ ثنائي وثلاثي الأبعاد، مع حساب تقطيع الألواح والأعواد بدقة عالية وإدارة كاملة لمخزونك.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" className="bg-gradient-primary shadow-glow text-base px-8 h-12">
            <Link to="/register">ابدأ التجربة المجانية</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 border-gold/40">
            <Link to="/login">لدي حساب</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border/60 bg-card/50 p-6 shadow-card hover:border-primary/40 hover:shadow-glow transition-all">
              <div className="size-12 rounded-xl bg-gradient-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} كيتشن برو — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
