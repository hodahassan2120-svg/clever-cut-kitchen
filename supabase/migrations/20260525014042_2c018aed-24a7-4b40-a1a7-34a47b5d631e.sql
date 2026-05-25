DROP POLICY IF EXISTS "users own designs" ON public.designs;

CREATE POLICY "users own designs"
ON public.designs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);