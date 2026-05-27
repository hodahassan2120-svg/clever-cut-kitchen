// حوار اختيار قالب مطبخ جاهز
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KITCHEN_TEMPLATES, type KitchenTemplate } from "@/lib/templates";
import { Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (t: KitchenTemplate) => void;
  hasExisting: boolean;
}

export function TemplatesDialog({ open, onClose, onPick, hasExisting }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            مكتبة القوالب الجاهزة
          </DialogTitle>
          <DialogDescription className="text-xs">
            {hasExisting
              ? "⚠️ اختيار قالب سيستبدل التصميم الحالي بالكامل"
              : "اختر تخطيطاً يناسب مطبخك وعدّله كما تريد"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          {KITCHEN_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onPick(t)}
              className="group text-right p-4 rounded-xl border border-border/60 bg-card/50 hover:border-primary hover:bg-primary/5 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-primary/10 text-primary font-bold">
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm mb-1">{t.name}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-muted/60">{t.roomWidth}×{t.roomDepth} سم</span>
                    <span className="px-2 py-0.5 rounded-full bg-muted/60">{t.units.length} وحدة</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/40 text-[11px] text-muted-foreground border border-border/40">
          💡 <strong>نصيحة:</strong> بعد تحميل القالب يمكنك تعديل المقاسات، الألوان، إضافة/حذف وحدات، وتحريكها بحرية. استخدم زر <strong>"محاذاة"</strong> لترتيب الوحدات على الحوائط.
        </div>

        <div className="flex justify-end mt-3">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
