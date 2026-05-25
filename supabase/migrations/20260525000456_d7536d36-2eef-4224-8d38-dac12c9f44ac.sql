
-- Helper: is the user's subscription currently active (trial or paid)?
CREATE OR REPLACE FUNCTION public.is_subscription_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = _user_id
      AND s.is_active = true
      AND (
        (s.activated_until IS NOT NULL AND s.activated_until > now())
        OR (s.activated_until IS NULL AND s.trial_ends_at > now())
      )
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_subscription_active(uuid) FROM PUBLIC, anon, authenticated;

-- designs: gate by subscription (admins bypass via existing admin policy)
DROP POLICY IF EXISTS "users own designs" ON public.designs;
CREATE POLICY "users own designs"
ON public.designs
FOR ALL
TO authenticated
USING (auth.uid() = user_id AND public.is_subscription_active(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_subscription_active(auth.uid()));

-- board_inventory
DROP POLICY IF EXISTS "users own boards" ON public.board_inventory;
CREATE POLICY "users own boards"
ON public.board_inventory
FOR ALL
TO authenticated
USING (auth.uid() = user_id AND public.is_subscription_active(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_subscription_active(auth.uid()));

-- rod_inventory
DROP POLICY IF EXISTS "users own rods" ON public.rod_inventory;
CREATE POLICY "users own rods"
ON public.rod_inventory
FOR ALL
TO authenticated
USING (auth.uid() = user_id AND public.is_subscription_active(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_subscription_active(auth.uid()));
