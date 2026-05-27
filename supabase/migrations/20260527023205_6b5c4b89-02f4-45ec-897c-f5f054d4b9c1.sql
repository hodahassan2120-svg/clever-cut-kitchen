
-- Add pricing columns to app_settings
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS monthly_price integer NOT NULL DEFAULT 99,
  ADD COLUMN IF NOT EXISTS yearly_price integer NOT NULL DEFAULT 799,
  ADD COLUMN IF NOT EXISTS paymob_enabled boolean NOT NULL DEFAULT false;

-- Payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL CHECK (plan IN ('monthly','yearly')),
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EGP',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  paymob_order_id text,
  paymob_transaction_id text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "admins manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_order ON public.payments(paymob_order_id);

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Secure function the webhook calls (via service role) to activate subscription
CREATE OR REPLACE FUNCTION public.activate_paid_subscription(
  _user_id uuid,
  _plan text,
  _payment_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _days integer;
  _current timestamptz;
  _base timestamptz;
BEGIN
  IF _plan = 'monthly' THEN _days := 30;
  ELSIF _plan = 'yearly' THEN _days := 365;
  ELSE RAISE EXCEPTION 'invalid plan'; END IF;

  SELECT activated_until INTO _current FROM public.subscriptions WHERE user_id = _user_id;
  _base := GREATEST(COALESCE(_current, now()), now());

  UPDATE public.subscriptions
    SET activated_until = _base + (_days || ' days')::interval,
        is_active = true,
        activated_at = now()
    WHERE user_id = _user_id;

  UPDATE public.payments SET status = 'success' WHERE id = _payment_id;
END;
$$;
