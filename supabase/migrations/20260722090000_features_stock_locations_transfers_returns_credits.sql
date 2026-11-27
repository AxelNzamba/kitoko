-- ============================================================
-- Migration: Features — Stock locations, transfers, returns, credits
-- Date: 2026-07-22
-- Description:
--   - stock_locations table for multi-location stock management
--   - location_id added to stock_movements
--   - supplier_returns table for supplier returns
--   - credits table for credit notes (avoir)
-- ============================================================

-- ============================================================
-- 1. stock_locations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stock_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sloc read" ON public.stock_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "sloc insert" ON public.stock_locations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sloc update" ON public.stock_locations FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "sloc delete" ON public.stock_locations FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_locations TO authenticated;
GRANT ALL ON public.stock_locations TO service_role;

-- Insert default locations
INSERT INTO public.stock_locations (name, description) VALUES
  ('Entrepôt principal', 'Emplacement de stockage principal'),
  ('Entrepôt secondaire', 'Stock secondaire / réserve'),
  ('Zone de transit', 'Marchandises en transit ou en attente')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Add location_id to stock_movements
-- ============================================================
ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.stock_locations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_stock_movements_location
  ON public.stock_movements(location_id);

-- ============================================================
-- 3. supplier_returns
-- ============================================================
CREATE TABLE IF NOT EXISTS public.supplier_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number TEXT NOT NULL UNIQUE,
  lot_id UUID REFERENCES public.lots(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT NOT NULL DEFAULT '',
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.supplier_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sret read" ON public.supplier_returns FOR SELECT TO authenticated USING (true);
CREATE POLICY "sret insert" ON public.supplier_returns FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sret update" ON public.supplier_returns FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "sret delete" ON public.supplier_returns FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_returns TO authenticated;
GRANT ALL ON public.supplier_returns TO service_role;

CREATE INDEX IF NOT EXISTS idx_supplier_returns_lot ON public.supplier_returns(lot_id);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_supplier ON public.supplier_returns(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_date ON public.supplier_returns(return_date DESC);

-- ============================================================
-- 4. credits (avoir)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_number TEXT NOT NULL UNIQUE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  client_name TEXT DEFAULT '',
  total_ht NUMERIC DEFAULT 0 NOT NULL,
  total_tva NUMERIC DEFAULT 0 NOT NULL,
  total_ttc NUMERIC DEFAULT 0 NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cred read" ON public.credits FOR SELECT TO authenticated USING (true);
CREATE POLICY "cred insert" ON public.credits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cred update" ON public.credits FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "cred delete" ON public.credits FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.credits TO authenticated;
GRANT ALL ON public.credits TO service_role;

CREATE INDEX IF NOT EXISTS idx_credits_sale ON public.credits(sale_id);
CREATE INDEX IF NOT EXISTS idx_credits_created ON public.credits(created_at DESC);

-- ============================================================
-- 5. Generate return number function
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_return_number()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SPLIT_PART(return_number, '-', 3) AS INTEGER)), 0) + 1
     FROM public.supplier_returns
     WHERE return_number LIKE 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%')::TEXT,
    4, '0'
  );
$$;

-- ============================================================
-- 6. Generate credit number function
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_credit_number()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT 'AV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SPLIT_PART(credit_number, '-', 3) AS INTEGER)), 0) + 1
     FROM public.credits
     WHERE credit_number LIKE 'AV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%')::TEXT,
    4, '0'
  );
$$;
