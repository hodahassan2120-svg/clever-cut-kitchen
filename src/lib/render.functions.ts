import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  imageDataUrl: z.string().min(20).max(8_000_000),
  prompt: z.string().min(1).max(2000).optional(),
});

export const renderRealistic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1) Consume one AI credit atomically (admins bypass via the RPC)
    const { data: consumed, error: consumeErr } = await supabase.rpc("consume_ai_credit", { _user_id: userId });
    if (consumeErr) {
      console.error("[renderRealistic] consume_ai_credit error", consumeErr);
      throw new Error("CREDIT_ERROR");
    }
    const consumedObj = consumed as { ok: boolean; reason?: string; credits?: number } | null;
    if (!consumedObj?.ok) {
      throw new Error("NO_AI_CREDITS");
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const prompt =
      data.prompt ||
      "حوّل لقطة المطبخ الـ 3D التخطيطية هذه إلى صورة فوتوغرافية واقعية احترافية، إضاءة طبيعية ناعمة، خامات حقيقية للخشب والرخام، ظلال واقعية، جودة عالية، مظهر مطبخ حقيقي مكتمل. حافظ على نفس التخطيط والأبعاد ومواقع الوحدات بدقة.";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[renderRealistic] gateway error", res.status, text);
      // Refund the credit on gateway failures (best-effort, ignore admins)
      await supabase
        .from("subscriptions")
        .update({ ai_credits: (consumedObj.credits ?? 0) + 1 })
        .eq("user_id", userId);
      if (res.status === 429) throw new Error("RATE_LIMIT");
      if (res.status === 402) throw new Error("NO_CREDITS");
      throw new Error("GATEWAY_ERROR");
    }
    const json = (await res.json()) as {
      choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
    };
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) {
      await supabase
        .from("subscriptions")
        .update({ ai_credits: (consumedObj.credits ?? 0) + 1 })
        .eq("user_id", userId);
      throw new Error("NO_IMAGE_RETURNED");
    }
    return { imageDataUrl: url, creditsRemaining: consumedObj.credits ?? 0 };
  });
