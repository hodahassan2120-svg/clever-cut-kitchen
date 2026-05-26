ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS adsterra_banner_key TEXT,
ADD COLUMN IF NOT EXISTS adsterra_banner_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS adsterra_smart_link TEXT;