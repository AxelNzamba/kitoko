
-- Tighten RLS: restrict reads/writes to appropriate roles

-- clients: only proprietaire or caissier can read
DROP POLICY IF EXISTS "Auth users can view clients" ON public.clients;
CREATE POLICY "Proprio or caissier can view clients" ON public.clients FOR SELECT
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'caissier'::app_role));

-- suppliers: only proprietaire or magasinier can read
DROP POLICY IF EXISTS "sup read" ON public.suppliers;
CREATE POLICY "sup read" ON public.suppliers FOR SELECT
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));

-- inventory_sessions: role-scoped read + write
DROP POLICY IF EXISTS "inv read" ON public.inventory_sessions;
DROP POLICY IF EXISTS "inv insert" ON public.inventory_sessions;
DROP POLICY IF EXISTS "inv update" ON public.inventory_sessions;
CREATE POLICY "inv read" ON public.inventory_sessions FOR SELECT
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));
CREATE POLICY "inv insert" ON public.inventory_sessions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));
CREATE POLICY "inv update" ON public.inventory_sessions FOR UPDATE
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));

-- inventory_counts
DROP POLICY IF EXISTS "ic read" ON public.inventory_counts;
DROP POLICY IF EXISTS "ic insert" ON public.inventory_counts;
DROP POLICY IF EXISTS "ic update" ON public.inventory_counts;
CREATE POLICY "ic read" ON public.inventory_counts FOR SELECT
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));
CREATE POLICY "ic insert" ON public.inventory_counts FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));
CREATE POLICY "ic update" ON public.inventory_counts FOR UPDATE
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));

-- stock_movements: role-scoped read + insert
DROP POLICY IF EXISTS "mov read" ON public.stock_movements;
DROP POLICY IF EXISTS "mov insert" ON public.stock_movements;
CREATE POLICY "mov read" ON public.stock_movements FOR SELECT
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));
CREATE POLICY "mov insert" ON public.stock_movements FOR INSERT
  WITH CHECK ((has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role)) AND auth.uid() = created_by);

-- sales & sale_items: role-scoped reads
DROP POLICY IF EXISTS "sale read" ON public.sales;
CREATE POLICY "sale read" ON public.sales FOR SELECT
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'caissier'::app_role));

DROP POLICY IF EXISTS "si read" ON public.sale_items;
CREATE POLICY "si read" ON public.sale_items FOR SELECT
  USING (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'caissier'::app_role));

-- Storage: restrict writes on certificats and product-photos to proprietaire/magasinier
DROP POLICY IF EXISTS "certs insert" ON storage.objects;
DROP POLICY IF EXISTS "certs update" ON storage.objects;
DROP POLICY IF EXISTS "certs delete" ON storage.objects;
CREATE POLICY "certs insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificats' AND (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role)));
CREATE POLICY "certs update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'certificats' AND (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role)));
CREATE POLICY "certs delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'certificats' AND (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role)));

DROP POLICY IF EXISTS "photos insert" ON storage.objects;
DROP POLICY IF EXISTS "photos update" ON storage.objects;
DROP POLICY IF EXISTS "photos delete" ON storage.objects;
CREATE POLICY "photos insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-photos' AND (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role)));
CREATE POLICY "photos update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-photos' AND (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role)));
CREATE POLICY "photos delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-photos' AND (has_role(auth.uid(), 'proprietaire'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role)));

-- Convert has_role to SECURITY INVOKER and restrict EXECUTE
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$function$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
