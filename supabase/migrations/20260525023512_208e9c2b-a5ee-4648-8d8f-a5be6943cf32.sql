
DROP POLICY IF EXISTS "users own designs" ON public.designs;

CREATE POLICY "users own designs"
ON public.designs
FOR ALL
TO authenticated
USING ((auth.uid() = user_id) AND public.is_subscription_active(auth.uid()))
WITH CHECK ((auth.uid() = user_id) AND public.is_subscription_active(auth.uid()));
