CREATE TYPE public.activation_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.activation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  full_name TEXT,
  note TEXT,
  status public.activation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  handled_at TIMESTAMPTZ,
  handled_by UUID
);

CREATE INDEX activation_requests_status_idx ON public.activation_requests(status, created_at DESC);
CREATE INDEX activation_requests_user_idx ON public.activation_requests(user_id);

ALTER TABLE public.activation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert own request" ON public.activation_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users view own requests" ON public.activation_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "admins update requests" ON public.activation_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "admins delete requests" ON public.activation_requests
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));