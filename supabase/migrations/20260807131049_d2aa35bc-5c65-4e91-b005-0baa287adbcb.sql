-- 1. Table warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.warehouses TO authenticated;
GRANT ALL ON public.warehouses TO service_role;

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "warehouses_read_roles"
  ON public.warehouses
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'proprietaire'::public.app_role) OR has_role(auth.uid(), 'magasinier'::public.app_role));

CREATE POLICY "warehouses_write_proprio"
  ON public.warehouses
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'proprietaire'::public.app_role))
  WITH CHECK (has_role(auth.uid(), 'proprietaire'::public.app_role));

-- 2. Mise à jour de stock_locations (hiérarchie + lien entrepôt)
ALTER TABLE public.stock_locations
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS zone text,
  ADD COLUMN IF NOT EXISTS aisle text,
  ADD COLUMN IF NOT EXISTS rack text,
  ADD COLUMN IF NOT EXISTS bay text,
  ADD COLUMN IF NOT EXISTS level text;

-- Trigger updated_at sur stock_locations s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_stock_locations_updated_at'
  ) THEN
    CREATE TRIGGER trg_stock_locations_updated_at
      BEFORE UPDATE ON public.stock_locations
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3. Entrepôt par défaut pour les données existantes
INSERT INTO public.warehouses (name, code, address, is_active)
VALUES ('Entrepôt principal', 'PRINCIPAL', 'Entrepôt par défaut', true)
ON CONFLICT (code) DO NOTHING;

UPDATE public.stock_locations
SET warehouse_id = (SELECT id FROM public.warehouses WHERE code = 'PRINCIPAL')
WHERE warehouse_id IS NULL;

-- 4. Ajout des colonnes warehouse_id / location_id sur les tables métier
ALTER TABLE public.lots
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.stock_locations(id) ON DELETE SET NULL;

ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_sessions
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_counts
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.stock_locations(id) ON DELETE SET NULL;

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL;

ALTER TABLE public.serial_numbers
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.stock_locations(id) ON DELETE SET NULL;

-- 5. Remplissage des warehouse_id existants avec l'entrepôt principal
DO $$
DECLARE
  default_warehouse_id uuid;
BEGIN
  SELECT id INTO default_warehouse_id FROM public.warehouses WHERE code = 'PRINCIPAL';

  UPDATE public.lots SET warehouse_id = default_warehouse_id WHERE warehouse_id IS NULL;
  UPDATE public.stock_movements SET warehouse_id = default_warehouse_id WHERE warehouse_id IS NULL;
  UPDATE public.inventory_sessions SET warehouse_id = default_warehouse_id WHERE warehouse_id IS NULL;
  UPDATE public.inventory_counts SET warehouse_id = default_warehouse_id WHERE warehouse_id IS NULL;
  UPDATE public.purchase_orders SET warehouse_id = default_warehouse_id WHERE warehouse_id IS NULL;
  UPDATE public.serial_numbers SET warehouse_id = default_warehouse_id WHERE warehouse_id IS NULL;
END $$;

-- 6. Vue de stock par entrepôt
CREATE OR REPLACE VIEW public.lot_stock_by_warehouse AS
SELECT
  l.id AS lot_id,
  l.product_id,
  l.warehouse_id,
  COALESCE(SUM(CASE WHEN m.type = 'entree' THEN m.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN m.type = 'sortie' THEN m.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN m.type = 'inventaire' THEN m.quantity ELSE 0 END), 0)
    AS current_quantity
FROM public.lots l
LEFT JOIN public.stock_movements m ON m.lot_id = l.id AND m.warehouse_id = l.warehouse_id
GROUP BY l.id, l.product_id, l.warehouse_id;

-- 7. Table user_favorites
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('page', 'product', 'lot', 'client', 'supplier')),
  target text NOT NULL,
  label text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_favorites_own"
  ON public.user_favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Index sur les nouvelles colonnes fréquemment filtrées
CREATE INDEX IF NOT EXISTS idx_lots_warehouse_id ON public.lots(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_id ON public.stock_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sessions_warehouse_id ON public.inventory_sessions(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_warehouse_id ON public.inventory_counts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_warehouse_id ON public.purchase_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_warehouse_id ON public.serial_numbers(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_locations_warehouse_id ON public.stock_locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
