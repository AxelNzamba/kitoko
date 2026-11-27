CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Journal des erreurs du site
CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid DEFAULT auth.uid(),
  message text NOT NULL,
  stack text,
  url text,
  source text,
  user_agent text,
  resolved boolean NOT NULL DEFAULT false
);
CREATE INDEX error_logs_created_idx ON public.error_logs (created_at DESC);
GRANT INSERT ON public.error_logs TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY error_logs_insert ON public.error_logs FOR INSERT TO anon, authenticated
  WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND length(message) <= 2000 AND (stack IS NULL OR length(stack) <= 8000));
CREATE POLICY error_logs_owner_select ON public.error_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
CREATE POLICY error_logs_owner_update ON public.error_logs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
CREATE POLICY error_logs_owner_delete ON public.error_logs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

-- Sauvegardes quotidiennes
CREATE TABLE public.data_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL DEFAULT 'auto',
  row_count integer NOT NULL DEFAULT 0,
  size_bytes bigint NOT NULL DEFAULT 0,
  data jsonb NOT NULL
);
CREATE INDEX data_backups_created_idx ON public.data_backups (created_at DESC);
GRANT SELECT ON public.data_backups TO authenticated;
GRANT ALL ON public.data_backups TO service_role;
ALTER TABLE public.data_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY data_backups_owner_select ON public.data_backups FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE OR REPLACE FUNCTION public.run_data_backup(_kind text DEFAULT 'auto')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t text;
  tables text[] := ARRAY['warehouses','stock_locations','categories','suppliers','products','lots','serial_numbers',
    'stock_movements','stock_transfers','stock_transfer_items','inventory_sessions','inventory_counts',
    'clients','sales','sale_items','credits','expenses','purchase_orders','purchase_order_items',
    'supplier_returns','sav_tickets','sav_interventions','sav_intervention_serials','profiles','user_roles'];
  payload jsonb := '{}'::jsonb;
  part jsonb;
  total int := 0;
  new_id uuid;
BEGIN
  IF _kind <> 'auto' AND NOT public.has_role(auth.uid(), 'proprietaire') THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('SELECT COALESCE(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) FROM public.%I x', t) INTO part;
      payload := payload || jsonb_build_object(t, part);
      total := total + jsonb_array_length(part);
    END IF;
  END LOOP;
  INSERT INTO public.data_backups (kind, row_count, size_bytes, data)
  VALUES (_kind, total, octet_length(payload::text), payload) RETURNING id INTO new_id;
  DELETE FROM public.data_backups WHERE created_at < now() - interval '30 days';
  RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.run_data_backup(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.run_data_backup(text) TO authenticated;

SELECT cron.schedule('sauvegarde-quotidienne', '0 1 * * *', $$SELECT public.run_data_backup('auto')$$);
DELETE FROM public.error_logs WHERE false;
SELECT cron.schedule('purge-erreurs', '30 1 * * *', $$DELETE FROM public.error_logs WHERE created_at < now() - interval '90 days'$$);