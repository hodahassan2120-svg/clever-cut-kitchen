import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Ruler, Layers, Sparkles, Cuboid, Scissors, CheckCircle2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/AdSlot";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

      {/* كيف يعمل البرنامج */}
      <section className="container mx-auto px-4 py-16 border-t border-border/40">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">كيف يعمل كيتشن برو؟</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">من فكرة العميل لحد لوح الخشب الجاهز للقطع — كل خطوة في مكان واحد، بدون أوراق ولا حسابات يدوية.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "1", t: "ارسم المطبخ", d: "اسحب وحدات جاهزة (قواعد، علويات، أعمدة، أجهزة) وحدد مقاسات الحوائط والارتفاع. تقدر تشوف النتيجة 2D و 3D فوراً." },
            { n: "2", t: "احسب التقطيع", d: "البرنامج يولّد قائمة قطع الخشب من تصميمك، ويوزعها على الألواح المتوفرة في مخزونك بأقل هدر ممكن باستخدام خوارزمية تقطيع ذكية." },
            { n: "3", t: "اطبع وابدأ التنفيذ", d: "صدّر تقرير PDF كامل بالقطع والأبعاد ومخطط التقطيع لكل لوح — جاهز للورشة أو ماكينة CNC." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <div className="size-10 rounded-full bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center mb-4 shadow-glow">{s.n}</div>
              <h3 className="text-lg font-bold mb-2">{s.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* لمين البرنامج */}
      <section className="container mx-auto px-4 py-16 border-t border-border/40">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مين يستخدم كيتشن برو؟</h2>
            <p className="text-muted-foreground mb-6">صُمم خصيصاً لورش النجارة وموزعي المطابخ الجاهزة في الوطن العربي. واجهة عربية كاملة، حسابات بالملليمتر، ودعم لكل أنواع ألواح MDF و HDF و Particle Board.</p>
            <ul className="space-y-3">
              {[
                "ورش نجارة المطابخ والدريسنج روم",
                "موزعو ومصممو المطابخ الجاهزة",
                "مهندسو الديكور الداخلي",
                "مصانع الأثاث الصغيرة والمتوسطة",
                "هواة التصميم اللي بيعملوا مطابخهم بنفسهم",
              ].map((x) => (
                <li key={x} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="size-5 text-primary shrink-0" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-8">
            <Quote className="size-8 text-gold mb-3" />
            <p className="text-lg leading-relaxed mb-4">"وفّرت ساعات يومياً كنت بقضيها في رسم المطابخ يدوي وحساب التقطيع. الـ 3D ساعدني أقنع عملائي بالتصميم قبل ما أبدأ التصنيع، وقللت هدر الخشب بنسبة 18% تقريباً."</p>
            <div className="text-sm">
              <div className="font-bold">م. أحمد سعيد</div>
              <div className="text-muted-foreground">صاحب ورشة مطابخ — القاهرة</div>
            </div>
          </div>
        </div>
      </section>

      {/* إعلان AdSense وسط محتوى حقيقي */}
      <section className="container mx-auto px-4 py-8">
        <AdSlot className="min-h-[100px] w-full rounded-lg overflow-hidden" format="auto" />
      </section>

      {/* الأسئلة الشائعة */}
      <section className="container mx-auto px-4 py-16 border-t border-border/40 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">أسئلة شائعة</h2>
        <p className="text-muted-foreground text-center mb-10">كل اللي محتاج تعرفه قبل ما تبدأ.</p>
        <Accordion type="single" collapsible className="space-y-2">
          {[
            { q: "هل البرنامج فعلاً مجاني؟", a: "تقدر تجرب كل المميزات مجاناً لمدة 7 أيام بدون بطاقة ائتمان. بعد كده تختار خطة الاشتراك المناسبة لحجم شغلك." },
            { q: "محتاج إنترنت عشان أشتغل؟", a: "آه، البرنامج يشتغل من المتصفح مباشرة، يعني تقدر تفتحه من اللاب أو الموبايل أو التابلت — وتصميماتك محفوظة على السحابة مش هتضيع." },
            { q: "هل يدعم ماكينات الـ CNC؟", a: "تقدر تصدّر قائمة القطع والمخططات PDF جاهزة للطباعة، وفي طريقنا دعم تصدير DXF مباشرة لماكينات الـ CNC قريباً." },
            { q: "ممكن أضيف وحدات بمقاسات مخصصة؟", a: "أكيد، فيه أداة بناء وحدة مخصصة (Custom Unit Builder) تقدر منها تحدد الطول والعمق والارتفاع وعدد الأرفف وعدد الأبواب وكل تفصيلة." },
            { q: "هل التقطيع بياخد في اعتباره عرض المنشار؟", a: "آه، تقدر تحدد سُمك المنشار (Kerf) في إعدادات التقطيع عشان الحسابات تطلع مظبوطة 100% للقطع الحقيقي." },
            { q: "هل بياناتي آمنة؟", a: "كل تصميماتك محمية في حسابك الشخصي ومش متاحة لأي حد تاني. بنستخدم تشفير من الدرجة الأولى لحماية بياناتك." },
          ].map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} className="border border-border/60 rounded-xl px-4 bg-card/30">
              <AccordionTrigger className="text-right hover:no-underline font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA نهائي */}
      <section className="container mx-auto px-4 py-20 text-center border-t border-border/40">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">جاهز تبدأ مطبخك التالي؟</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">انضم لمئات النجارين والمصممين اللي بيستخدموا كيتشن برو يومياً. 7 أيام مجانية تكفي تكتشف الفرق.</p>
        <Button asChild size="lg" className="bg-gradient-primary shadow-glow text-base px-10 h-12">
          <Link to="/register">ابدأ الآن مجاناً</Link>
        </Button>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} كيتشن برو — برنامج تصميم وتقطيع المطابخ — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
