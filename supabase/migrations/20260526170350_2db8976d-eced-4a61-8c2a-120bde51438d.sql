UPDATE storage.buckets SET public = false WHERE id = 'design-renders';

CREATE POLICY "users insert own ad views"
ON public.ad_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);