ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS credit_limit numeric NOT NULL DEFAULT 0 CHECK (credit_limit >= 0);

CREATE TABLE public.client_debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  notes text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX client_debts_client_idx ON public.client_debts(client_id);
CREATE INDEX client_debts_due_idx ON public.client_debts(due_date);

CREATE TABLE public.debt_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id uuid NOT NULL REFERENCES public.client_debts(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  method text NOT NULL DEFAULT 'especes',
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
CREATE INDEX debt_payments_debt_idx ON public.debt_payments(debt_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_debts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debt_payments TO authenticated;
GRANT ALL ON public.client_debts TO service_role;
GRANT ALL ON public.debt_payments TO service_role;

ALTER TABLE public.client_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY debts_read ON public.client_debts FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','caissier']::public.app_role[]));
CREATE POLICY debts_insert ON public.client_debts FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','caissier']::public.app_role[]) AND created_by = auth.uid());
CREATE POLICY debts_update ON public.client_debts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
CREATE POLICY debts_delete ON public.client_debts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE POLICY payments_read ON public.debt_payments FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','caissier']::public.app_role[]));
CREATE POLICY payments_insert ON public.debt_payments FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','caissier']::public.app_role[]) AND created_by = auth.uid());
CREATE POLICY payments_delete ON public.debt_payments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE TRIGGER audit_client_debts AFTER INSERT OR UPDATE OR DELETE ON public.client_debts FOR EACH ROW EXECUTE FUNCTION public.log_audit('credits');
CREATE TRIGGER audit_debt_payments AFTER INSERT OR UPDATE OR DELETE ON public.debt_payments FOR EACH ROW EXECUTE FUNCTION public.log_audit('credits');