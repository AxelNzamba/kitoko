-- 1. Enrichissement de la table d'audit
ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS module text,
  ADD COLUMN IF NOT EXISTS warehouse_id uuid,
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS severity text NOT NULL DEFAULT 'info';

COMMENT ON COLUMN public.audit_log.module IS 'Module metier concerne (ventes, stock, transferts, inventaire, sav, achats, synchronisation, connexion, ...)';
COMMENT ON COLUMN public.audit_log.warehouse_id IS 'Entrepot concerne par l action, si applicable';
COMMENT ON COLUMN public.audit_log.label IS 'Libelle lisible de l action pour la page Activite';
COMMENT ON COLUMN public.audit_log.severity IS 'info | warning | error';

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_module_idx ON public.audit_log (module);
CREATE INDEX IF NOT EXISTS audit_log_user_idx ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS audit_log_warehouse_idx ON public.audit_log (warehouse_id);
CREATE INDEX IF NOT EXISTS audit_log_table_record_idx ON public.audit_log (table_name, record_id);

-- 2. Les utilisateurs authentifies peuvent journaliser leurs propres actions metier
GRANT INSERT ON public.audit_log TO authenticated;

DROP POLICY IF EXISTS "audit_log_self_insert" ON public.audit_log;
CREATE POLICY "audit_log_self_insert" ON public.audit_log
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Trigger generique : journalise creation / modification / suppression
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new jsonb;
  v_old jsonb;
  v_ref jsonb;
  v_action text;
  v_wh uuid;
  v_wh_txt text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
    v_ref := v_old;
    v_action := 'suppression';
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_ref := v_new;
    v_action := 'modification';
  ELSE
    v_old := NULL;
    v_new := to_jsonb(NEW);
    v_ref := v_new;
    v_action := 'creation';
  END IF;

  v_wh_txt := COALESCE(
    v_ref->>'warehouse_id',
    v_ref->>'from_warehouse_id',
    v_ref->>'to_warehouse_id'
  );

  BEGIN
    v_wh := NULLIF(v_wh_txt, '')::uuid;
  EXCEPTION WHEN others THEN
    v_wh := NULL;
  END;

  INSERT INTO public.audit_log (user_id, action, module, table_name, record_id, warehouse_id, label, severity, details)
  VALUES (
    auth.uid(),
    v_action,
    TG_ARGV[0],
    TG_TABLE_NAME,
    COALESCE(v_ref->>'id', ''),
    v_wh,
    COALESCE(
      v_ref->>'name', v_ref->>'sale_number', v_ref->>'transfer_number',
      v_ref->>'ticket_number', v_ref->>'po_number', v_ref->>'return_number',
      v_ref->>'credit_number', v_ref->>'lot_number', v_ref->>'serial',
      v_ref->>'reference', v_ref->>'label', v_ref->>'title', v_ref->>'id'
    ),
    'info',
    jsonb_build_object('op', TG_OP, 'old', v_old, 'new', v_new)
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Branchement du trigger sur toutes les tables metier
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('products', 'produits'),
      ('categories', 'produits'),
      ('lots', 'lots'),
      ('serial_numbers', 'lots'),
      ('stock_movements', 'stock'),
      ('stock_locations', 'stock'),
      ('warehouses', 'stock'),
      ('stock_transfers', 'transferts'),
      ('stock_transfer_items', 'transferts'),
      ('inventory_sessions', 'inventaire'),
      ('inventory_counts', 'inventaire'),
      ('sales', 'ventes'),
      ('sale_items', 'ventes'),
      ('clients', 'ventes'),
      ('credits', 'avoirs'),
      ('sav_tickets', 'sav'),
      ('sav_interventions', 'sav'),
      ('sav_intervention_serials', 'sav'),
      ('purchase_orders', 'achats'),
      ('purchase_order_items', 'achats'),
      ('supplier_returns', 'achats'),
      ('suppliers', 'achats'),
      ('expenses', 'depenses'),
      ('user_roles', 'utilisateurs'),
      ('profiles', 'utilisateurs')
    ) AS t(tbl, module)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = r.tbl
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_%1$s ON public.%1$I', r.tbl);
      EXECUTE format(
        'CREATE TRIGGER audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.log_audit(%2$L)',
        r.tbl, r.module
      );
    END IF;
  END LOOP;
END;
$$;

-- 5. Vue d'usage par module (statistiques pour la page Activite)
CREATE OR REPLACE VIEW public.audit_module_usage
WITH (security_invoker = true)
AS
SELECT
  COALESCE(module, 'autre') AS module,
  date_trunc('day', created_at)::date AS day,
  count(*)::bigint AS actions,
  count(DISTINCT user_id)::bigint AS users
FROM public.audit_log
GROUP BY 1, 2;

GRANT SELECT ON public.audit_module_usage TO authenticated;