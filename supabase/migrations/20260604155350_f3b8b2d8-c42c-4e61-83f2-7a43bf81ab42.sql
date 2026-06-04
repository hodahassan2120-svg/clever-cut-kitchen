
DROP POLICY IF EXISTS "users insert own renders" ON public.design_renders;
DROP POLICY IF EXISTS "users view own renders" ON public.design_renders;
DROP POLICY IF EXISTS "users delete own renders" ON public.design_renders;

CREATE POLICY "users insert own renders" ON public.design_renders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_subscription_active(auth.uid()));

CREATE POLICY "users view own renders" ON public.design_renders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.is_subscription_active(auth.uid()));

CREATE POLICY "users delete own renders" ON public.design_renders
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
