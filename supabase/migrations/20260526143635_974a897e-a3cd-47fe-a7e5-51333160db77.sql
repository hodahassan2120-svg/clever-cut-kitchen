
CREATE TABLE public.design_renders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  style TEXT,
  view_angle TEXT,
  prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.design_renders TO authenticated;
GRANT ALL ON public.design_renders TO service_role;

ALTER TABLE public.design_renders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own renders" ON public.design_renders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own renders" ON public.design_renders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own renders" ON public.design_renders FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_design_renders_user ON public.design_renders(user_id, created_at DESC);
CREATE INDEX idx_design_renders_design ON public.design_renders(design_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('design-renders', 'design-renders', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read design renders" ON storage.objects FOR SELECT TO public USING (bucket_id = 'design-renders');
CREATE POLICY "users upload own renders" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'design-renders' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users delete own renders" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'design-renders' AND (storage.foldername(name))[1] = auth.uid()::text);
