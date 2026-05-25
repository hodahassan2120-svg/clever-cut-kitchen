
-- 1. Subscriptions: only admins can insert (trigger uses SECURITY DEFINER, unaffected)
DROP POLICY IF EXISTS "admins insert subs" ON public.subscriptions;
CREATE POLICY "admins insert subs"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Profiles: prevent id hijack on update
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Revoke direct execute on has_role from app roles (RLS still uses it via policy evaluation)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
