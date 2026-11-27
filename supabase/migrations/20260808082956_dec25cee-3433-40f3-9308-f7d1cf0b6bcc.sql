-- 1. Favoris par rôle et entrepôt
ALTER TABLE public.user_favorites
  ADD COLUMN IF NOT EXISTS role public.app_role,
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON public.user_favorites(user_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;

-- 2. Statut des transferts
DO $$ BEGIN
  CREATE TYPE public.transfer_status AS ENUM ('brouillon','en_transit','recu','annule');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Transferts entre entrepôts
CREATE TABLE IF NOT EXISTS public.stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number text NOT NULL UNIQUE,
  source_warehouse_id uuid REFERENCES public.warehouses(id),
  dest_warehouse_id uuid REFERENCES public.warehouses(id),
  status public.transfer_status NOT NULL DEFAULT 'brouillon',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  sent_by uuid REFERENCES auth.users(id),
  sent_at timestamptz,
  received_by uuid REFERENCES auth.users(id),
  received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_transfers TO authenticated;
GRANT ALL ON public.stock_transfers TO service_role;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transfers_select" ON public.stock_transfers FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "transfers_insert" ON public.stock_transfers FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]) AND created_by = auth.uid());
CREATE POLICY "transfers_update" ON public.stock_transfers FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "transfers_delete" ON public.stock_transfers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'::public.app_role));

CREATE TABLE IF NOT EXISTS public.stock_transfer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  lot_id uuid REFERENCES public.lots(id),
  quantity numeric NOT NULL DEFAULT 0,
  quantity_received numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_transfer_items TO authenticated;
GRANT ALL ON public.stock_transfer_items TO service_role;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transfer_items_select" ON public.stock_transfer_items FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "transfer_items_insert" ON public.stock_transfer_items FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "transfer_items_update" ON public.stock_transfer_items FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "transfer_items_delete" ON public.stock_transfer_items FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));

CREATE TRIGGER trg_transfers_upd BEFORE UPDATE ON public.stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_transfer_items_upd BEFORE UPDATE ON public.stock_transfer_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Numérotation automatique
CREATE OR REPLACE FUNCTION public.generate_transfer_number()
RETURNS text LANGUAGE sql STABLE SET search_path TO 'public' AS $$
  SELECT 'TRF-' || TO_CHAR(NOW(),'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SPLIT_PART(transfer_number,'-',3) AS INTEGER)),0)+1
     FROM public.stock_transfers
     WHERE transfer_number LIKE 'TRF-' || TO_CHAR(NOW(),'YYYYMMDD') || '-%')::TEXT, 4, '0');
$$;
