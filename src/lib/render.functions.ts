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

    const prompt = `أنت مُحوِّل photorealistic rendering. مهمتك الوحيدة: تحويل لقطة المطبخ الـ3D التخطيطية الموجودة في الصورة المرفقة إلى صورة فوتوغرافية واقعية، مع الالتزام الحرفي بالتصميم الأصلي.

== قواعد صارمة (مطلقة، لا يجوز كسرها) ==
1. لا تُضِف أي وحدة، خزانة، جهاز، رف، طاولة، كرسي، نبات، إكسسوار، إضاءة، أو أي عنصر غير موجود فعلياً في الصورة الأصلية.
2. لا تحذف أي وحدة موجودة في الصورة الأصلية.
3. حافظ بدقة 100% على: عدد الوحدات، مواقعها، أبعادها النسبية، ترتيبها، اتجاهها، نوع كل وحدة (سفلية/علوية/طولية/جهاز)، ومواقع الأبواب والأدراج.
4. حافظ على نفس ألوان الخشب والرخام والأرضية والحوائط كما هي في اللقطة — فقط أضف الواقعية على المستوى البصري (إضاءة، خامات، انعكاسات، ظلال).
5. لا تُغيِّر شكل الغرفة أو حجمها أو زاوية الكاميرا.
6. لا تَفترض وجود نافذة أو باب أو جزيرة أو شفاط إذا لم يكن موجوداً صراحةً في الصورة الأصلية.

== التحسينات المسموح بها فقط ==
- ${styleText} (تطبق على الخامات والإضاءة فقط، لا على بنية التصميم).
- ${viewText}.
- إضاءة طبيعية ناعمة + إضاءة LED داخلية دافئة.
- خامات PBR واقعية (تعرّق الخشب، انعكاسات الرخام، لمعان الستانلس)، ظلال ناعمة، Ambient Occlusion، تفاصيل 4K.

السلبيات (Negative): no extra cabinets, no extra appliances, no decorative items not in source, no plants, no fruits, no books, no people, no added windows or doors, no layout changes, no new units, no removed units.${ctx}`;

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

