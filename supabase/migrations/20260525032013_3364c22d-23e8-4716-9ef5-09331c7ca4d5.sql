-- 1) Add ai_credits column to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS ai_credits integer NOT NULL DEFAULT 3;

-- 2) Add Adsterra fields to app_settings
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS adsterra_rewarded_zone text,
  ADD COLUMN IF NOT EXISTS adsterra_interstitial_zone text,
  ADD COLUMN IF NOT EXISTS rewarded_ads_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS interstitial_ads_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS credits_per_ad integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_daily_ad_credits integer NOT NULL DEFAULT 10;

-- 3) ad_views table (rate-limit + audit)
CREATE TABLE IF NOT EXISTS public.ad_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_type text NOT NULL CHECK (ad_type IN ('rewarded','interstitial')),
  credits_granted integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_views_user_day ON public.ad_views(user_id, created_at DESC);

ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own ad views"
  ON public.ad_views FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- No INSERT/UPDATE/DELETE policies for clients — only the SECURITY DEFINER fn below writes.

-- 4) Grant credit via rewarded ad (rate-limited)
CREATE OR REPLACE FUNCTION public.grant_rewarded_ad_credit(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enabled boolean;
  _per_ad integer;
  _max_daily integer;
  _granted_today integer;
  _new_balance integer;
BEGIN
  IF _user_id IS NULL OR _user_id <> auth.uid() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT rewarded_ads_enabled, credits_per_ad, max_daily_ad_credits
    INTO _enabled, _per_ad, _max_daily
    FROM public.app_settings WHERE id = 1;

  IF NOT COALESCE(_enabled, false) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'disabled');
  END IF;

  SELECT COALESCE(SUM(credits_granted), 0) INTO _granted_today
    FROM public.ad_views
    WHERE user_id = _user_id
      AND ad_type = 'rewarded'
      AND created_at > now() - interval '24 hours';

  IF _granted_today + _per_ad > _max_daily THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'daily_limit');
  END IF;

  INSERT INTO public.ad_views(user_id, ad_type, credits_granted)
    VALUES (_user_id, 'rewarded', _per_ad);

  UPDATE public.subscriptions
    SET ai_credits = ai_credits + _per_ad
    WHERE user_id = _user_id
    RETURNING ai_credits INTO _new_balance;

  RETURN jsonb_build_object('ok', true, 'credits', _new_balance, 'granted', _per_ad);
END;
$$;

-- 5) Consume one AI credit atomically
CREATE OR REPLACE FUNCTION public.consume_ai_credit(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _new_balance integer;
BEGIN
  IF _user_id IS NULL OR _user_id <> auth.uid() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT public.has_role(_user_id, 'admin'::app_role) INTO _is_admin;
  IF _is_admin THEN
    RETURN jsonb_build_object('ok', true, 'credits', 999999, 'admin', true);
  END IF;

  UPDATE public.subscriptions
    SET ai_credits = ai_credits - 1
    WHERE user_id = _user_id AND ai_credits > 0
    RETURNING ai_credits INTO _new_balance;

  IF _new_balance IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_credits');
  END IF;
  RETURN jsonb_build_object('ok', true, 'credits', _new_balance);
END;
$$;

-- 6) Log interstitial view (audit only, no credit)
CREATE OR REPLACE FUNCTION public.log_interstitial_view(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL OR _user_id <> auth.uid() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  INSERT INTO public.ad_views(user_id, ad_type, credits_granted)
    VALUES (_user_id, 'interstitial', 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_rewarded_ad_credit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_interstitial_view(uuid) TO authenticated;