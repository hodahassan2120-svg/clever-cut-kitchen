
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.custom_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_type text NOT NULL CHECK (ad_type IN ('banner','splash_video')),
  title text NOT NULL DEFAULT '',
  media_url text NOT NULL,
  link_url text,
  enabled boolean NOT NULL DEFAULT true,
  weight integer NOT NULL DEFAULT 1,
  skip_seconds integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.custom_ads TO anon, authenticated;
GRANT ALL ON public.custom_ads TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.custom_ads TO authenticated;

ALTER TABLE public.custom_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads ads" ON public.custom_ads FOR SELECT USING (true);
CREATE POLICY "admins insert ads" ON public.custom_ads FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update ads" ON public.custom_ads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete ads" ON public.custom_ads FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_custom_ads_updated_at BEFORE UPDATE ON public.custom_ads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS splash_ad_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS splash_ad_frequency text NOT NULL DEFAULT 'session' CHECK (splash_ad_frequency IN ('session','daily','always'));

INSERT INTO storage.buckets (id, name, public) VALUES ('ad-media','ad-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "ad-media public read" ON storage.objects FOR SELECT USING (bucket_id = 'ad-media');
CREATE POLICY "ad-media admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ad-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "ad-media admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'ad-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "ad-media admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ad-media' AND public.has_role(auth.uid(),'admin'));
