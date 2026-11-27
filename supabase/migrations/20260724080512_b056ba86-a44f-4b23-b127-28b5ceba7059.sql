
-- Fix search_path on numbering functions
CREATE OR REPLACE FUNCTION public.generate_credit_number()
RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT 'AV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SPLIT_PART(credit_number, '-', 3) AS INTEGER)), 0) + 1
     FROM public.credits
     WHERE credit_number LIKE 'AV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%')::TEXT,
    4, '0'
  );
$$;

CREATE OR REPLACE FUNCTION public.generate_return_number()
RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SPLIT_PART(return_number, '-', 3) AS INTEGER)), 0) + 1
     FROM public.supplier_returns
     WHERE return_number LIKE 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%')::TEXT,
    4, '0'
  );
$$;

-- Tighten write policies on credits
DROP POLICY IF EXISTS "cred insert" ON public.credits;
DROP POLICY IF EXISTS "cred update" ON public.credits;
DROP POLICY IF EXISTS "cred delete" ON public.credits;
CREATE POLICY "cred insert" ON public.credits FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'proprietaire') OR public.has_role(auth.uid(), 'caissier'));
CREATE POLICY "cred update" ON public.credits FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire') OR public.has_role(auth.uid(), 'caissier'));
CREATE POLICY "cred delete" ON public.credits FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

-- Tighten write policies on stock_locations
DROP POLICY IF EXISTS "sloc insert" ON public.stock_locations;
DROP POLICY IF EXISTS "sloc update" ON public.stock_locations;
DROP POLICY IF EXISTS "sloc delete" ON public.stock_locations;
CREATE POLICY "sloc insert" ON public.stock_locations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'proprietaire') OR public.has_role(auth.uid(), 'magasinier'));
CREATE POLICY "sloc update" ON public.stock_locations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire') OR public.has_role(auth.uid(), 'magasinier'));
CREATE POLICY "sloc delete" ON public.stock_locations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

-- Tighten write policies on supplier_returns
DROP POLICY IF EXISTS "sret insert" ON public.supplier_returns;
DROP POLICY IF EXISTS "sret update" ON public.supplier_returns;
DROP POLICY IF EXISTS "sret delete" ON public.supplier_returns;
CREATE POLICY "sret insert" ON public.supplier_returns FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'proprietaire') OR public.has_role(auth.uid(), 'magasinier'));
CREATE POLICY "sret update" ON public.supplier_returns FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire') OR public.has_role(auth.uid(), 'magasinier'));
CREATE POLICY "sret delete" ON public.supplier_returns FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
