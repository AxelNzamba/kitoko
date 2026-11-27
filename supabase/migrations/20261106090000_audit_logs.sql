-- Journal d'activité : trace les créations, modifications et suppressions
-- des référentiels et des opérations sensibles.
--
-- Lecture réservée au propriétaire. L'écriture se fait exclusivement via les
-- triggers SECURITY DEFINER : aucune politique d'INSERT n'est exposée aux clients.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
  ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_table_idx
  ON public.audit_logs (table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx
  ON public.audit_logs (actor_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit read owners" ON public.audit_logs;
CREATE POLICY "audit read owners"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_old JSONB;
  v_new JSONB;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
  ELSE
    v_new := to_jsonb(NEW);
  END IF;

  INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, changes)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(v_new ->> 'id', v_old ->> 'id'),
    TG_OP,
    v_actor,
    jsonb_strip_nulls(jsonb_build_object('old', v_old, 'new', v_new))
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers sur les tables métier suivies.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories', 'suppliers', 'products', 'lots', 'stock_movements',
    'sales', 'sale_items', 'clients', 'expenses', 'user_roles',
    'warehouses', 'credits'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I', t, t);
      EXECUTE format(
        'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.audit_row_change()',
        t, t
      );
    END IF;
  END LOOP;
END;
$$;

COMMENT ON TABLE public.audit_logs IS
  'Journal d''activité : qui a créé, modifié ou supprimé quoi (RLS lecture propriétaire).';
