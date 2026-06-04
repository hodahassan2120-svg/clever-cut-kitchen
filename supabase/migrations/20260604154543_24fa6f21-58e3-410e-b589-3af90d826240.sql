
-- 1. ad_views: remove direct INSERT policy (forces use of grant_rewarded_ad_credit RPC)
DROP POLICY IF EXISTS "users insert own ad views" ON public.ad_views;

-- 2. payments: split admin policy — no INSERT for admins (server-only via service role)
DROP POLICY IF EXISTS "admins manage payments" ON public.payments;
CREATE POLICY "admins select payments" ON public.payments FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins update payments" ON public.payments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins delete payments" ON public.payments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. storage: drop public listing policy for ad-media (public bucket still serves files via public URL)
DROP POLICY IF EXISTS "ad-media public read" ON storage.objects;
