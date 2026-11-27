-- 1. Fonction helper : vérif rôle multi
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

REVOKE ALL ON FUNCTION public.has_any_role(uuid, app_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated, service_role;

-- 2. Table audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_owner_read" ON public.audit_log
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'proprietaire'));

-- 3. Trigger générique CRDT : maj updated_at + _field_versions
CREATE OR REPLACE FUNCTION public.bump_field_versions()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ts bigint := (EXTRACT(EPOCH FROM now()) * 1000)::bigint;
  old_row jsonb;
  new_row jsonb;
  versions jsonb;
  k text;
  v jsonb;
BEGIN
  NEW.updated_at := now();

  IF TG_OP = 'INSERT' THEN
    new_row := to_jsonb(NEW);
    versions := '{}'::jsonb;
    FOR k IN SELECT jsonb_object_keys(new_row) LOOP
      IF k NOT IN ('id','created_at','updated_at','_field_versions','_client_id','_deleted') THEN
        versions := versions || jsonb_build_object(k, ts);
      END IF;
    END LOOP;
    NEW._field_versions := versions;
  ELSIF TG_OP = 'UPDATE' THEN
    old_row := to_jsonb(OLD);
    new_row := to_jsonb(NEW);
    versions := COALESCE(OLD._field_versions, '{}'::jsonb);
    FOR k IN SELECT jsonb_object_keys(new_row) LOOP
      IF k NOT IN ('id','created_at','updated_at','_field_versions','_client_id','_deleted')
         AND (old_row->k) IS DISTINCT FROM (new_row->k) THEN
        versions := versions || jsonb_build_object(k, ts);
      END IF;
    END LOOP;
    NEW._field_versions := versions;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Ajouter colonnes CRDT + trigger sur chaque table métier
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'products','categories','suppliers','clients','lots',
    'stock_movements','sales','sale_items',
    'inventory_sessions','inventory_counts','expenses'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS _field_versions jsonb NOT NULL DEFAULT ''{}''::jsonb,
      ADD COLUMN IF NOT EXISTS _client_id uuid,
      ADD COLUMN IF NOT EXISTS _deleted boolean NOT NULL DEFAULT false', t);

    EXECUTE format('DROP TRIGGER IF EXISTS trg_bump_versions ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_bump_versions
      BEFORE INSERT OR UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.bump_field_versions()', t);

    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(updated_at)',
      t || '_updated_at_idx', t);
  END LOOP;
END $$;