UPDATE public.app_settings
SET adsterra_rewarded_zone = 'https://omg10.com/4/11053952',
    rewarded_ads_enabled = true
WHERE id = 1;

INSERT INTO public.app_settings (id, adsterra_rewarded_zone, rewarded_ads_enabled)
SELECT 1, 'https://omg10.com/4/11053952', true
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE id = 1);