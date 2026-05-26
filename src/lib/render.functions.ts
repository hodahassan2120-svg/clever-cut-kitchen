import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STYLE_PROMPTS: Record<string, string> = {
  modern: "ستايل مودرن أنيق، خطوط نظيفة، إضاءة LED مخفية، أرضية بورسلين لامع، مظهر مينيمال راقي",
  classic: "ستايل كلاسيكي فاخر بتفاصيل خشبية محفورة، مقابض نحاسية، ثريا كريستال، ألوان دافئة كريمية وبنية",
  industrial: "ستايل صناعي، حوائط طوب مكشوف، أنابيب معدنية ظاهرة، إضاءة معلقة سوداء، خامات خشب خام ومعدن",
  luxury: "ستايل فاخر للغاية، رخام إيطالي، إضاءة ذهبية دافئة، تشطيبات عالية الجودة، مظهر فندقي بريستيج",
};

const VIEW_PROMPTS: Record<string, string> = {
  perspective: "زاوية منظور طبيعية ثلاثية الأبعاد بارتفاع عين الإنسان",
  front: "زاوية أمامية مستقيمة تظهر واجهة المطبخ بالكامل",
  top: "لقطة من الأعلى تظهر تخطيط المطبخ بالكامل (top-down view)",
};

const Input = z.object({
  imageDataUrl: z.string().min(20).max(8_000_000),
  style: z.enum(["modern", "classic", "industrial", "luxury"]).optional(),
  viewAngle: z.enum(["perspective", "front", "top"]).optional(),
  designId: z.string().uuid().optional(),
  contextNote: z.string().max(1000).optional(),
});

export const renderRealistic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: consumed, error: consumeErr } = await supabase.rpc("consume_ai_credit", { _user_id: userId });
    if (consumeErr) {
      console.error("[renderRealistic] consume_ai_credit error", consumeErr);
      throw new Error("CREDIT_ERROR");
    }
    const consumedObj = consumed as { ok: boolean; reason?: string; credits?: number } | null;
    if (!consumedObj?.ok) throw new Error("NO_AI_CREDITS");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const styleText = data.style ? STYLE_PROMPTS[data.style] : STYLE_PROMPTS.modern;
    const viewText = data.viewAngle ? VIEW_PROMPTS[data.viewAngle] : VIEW_PROMPTS.perspective;
    const ctx = data.contextNote ? `\nسياق التصميم: ${data.contextNote}` : "";

    const prompt = `حوّل لقطة المطبخ الـ 3D التخطيطية هذه إلى صورة فوتوغرافية واقعية احترافية بجودة استوديو.
${styleText}.
${viewText}.
حافظ بدقة شديدة على نفس التخطيط ومواقع الوحدات وأعدادها وألوان الخامات المختارة (الخشب/الرخام/البورسلين) كما في اللقطة الأصلية — لا تغيّر التصميم.
إضاءة طبيعية ناعمة + إضاءة داخلية دافئة، ظلال واقعية، خامات حقيقية، انعكاسات على الرخام، تفاصيل عالية الجودة 4K، مظهر مطبخ حقيقي مكتمل وجاهز للسكن.${ctx}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: data.imageDataUrl } }] }],
      }),
    });

    const refund = async () => {
      await supabase.from("subscriptions").update({ ai_credits: (consumedObj.credits ?? 0) + 1 }).eq("user_id", userId);
    };

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[renderRealistic] gateway error", res.status, text);
      await refund();
      if (res.status === 429) throw new Error("RATE_LIMIT");
      if (res.status === 402) throw new Error("NO_CREDITS");
      throw new Error("GATEWAY_ERROR");
    }
    const json = (await res.json()) as { choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[] };
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) { await refund(); throw new Error("NO_IMAGE_RETURNED"); }

    // Upload to private storage + save row (best-effort). Store path; return signed URL.
    let signedUrl: string | null = null;
    try {
      const b64 = url.split(",")[1] || url;
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const filename = `${userId}/${Date.now()}-${data.viewAngle ?? "perspective"}.png`;
      const { error: upErr } = await supabase.storage.from("design-renders").upload(filename, bytes, { contentType: "image/png", upsert: false });
      if (!upErr) {
        const { data: signed } = await supabase.storage.from("design-renders").createSignedUrl(filename, 60 * 60 * 24 * 7);
        signedUrl = signed?.signedUrl ?? null;
        await supabase.from("design_renders").insert({
          user_id: userId,
          design_id: data.designId ?? null,
          image_url: filename, // store storage path, not public URL
          style: data.style ?? "modern",
          view_angle: data.viewAngle ?? "perspective",
        });
      } else {
        console.error("[renderRealistic] storage upload failed", upErr);
      }
    } catch (e) {
      console.error("[renderRealistic] save error", e);
    }

    return { imageDataUrl: signedUrl ?? url, creditsRemaining: consumedObj.credits ?? 0 };
  });

