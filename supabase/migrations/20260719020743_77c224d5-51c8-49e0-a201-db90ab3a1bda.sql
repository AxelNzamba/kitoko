
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cats read" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "cats insert" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'magasinier'));
CREATE POLICY "cats update" ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'magasinier'));
CREATE POLICY "cats delete" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'proprietaire'));

CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sup read" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "sup insert" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'magasinier'));
CREATE POLICY "sup update" ON public.suppliers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'magasinier'));
CREATE POLICY "sup delete" ON public.suppliers FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'proprietaire'));

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text NOT NULL UNIQUE,
  barcode text UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  photo_url text,
  purchase_price numeric(12,2) NOT NULL DEFAULT 0,
  sale_price numeric(12,2) NOT NULL DEFAULT 0,
  tva numeric(5,2) NOT NULL DEFAULT 18,
  stock_min integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prod read" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "prod insert" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'magasinier'));
CREATE POLICY "prod update" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'magasinier'));
CREATE POLICY "prod delete" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'proprietaire'));

CREATE TABLE public.lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  lot_number text NOT NULL,
  reception_date date NOT NULL DEFAULT CURRENT_DATE,
  quantity numeric(12,3) NOT NULL DEFAULT 0,
  unit_purchase_price numeric(12,2) NOT NULL DEFAULT 0,
  certificate_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lots TO authenticated;
GRANT ALL ON public.lots TO service_role;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lot read" ON public.lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "lot insert" ON public.lots FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'magasinier'));
CREATE POLICY "lot update" ON public.lots FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'magasinier'));
CREATE POLICY "lot delete" ON public.lots FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'proprietaire'));

CREATE TYPE public.movement_type AS ENUM ('entree','sortie','inventaire');
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  lot_id uuid REFERENCES public.lots(id) ON DELETE SET NULL,
  type public.movement_type NOT NULL,
  quantity numeric(12,3) NOT NULL,
  unit_price numeric(12,2),
  reason text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mov read" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "mov insert" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  total_ht numeric(12,2) NOT NULL DEFAULT 0,
  total_tva numeric(12,2) NOT NULL DEFAULT 0,
  total_ttc numeric(12,2) NOT NULL DEFAULT 0,
  payment_mode text NOT NULL,
  client_name text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sale read" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "sale insert" ON public.sales FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  lot_id uuid REFERENCES public.lots(id),
  quantity numeric(12,3) NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  tva numeric(5,2) NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO authenticated;
GRANT ALL ON public.sale_items TO service_role;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "si read" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "si insert" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE public.inventory_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'ouverte',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_sessions TO authenticated;
GRANT ALL ON public.inventory_sessions TO service_role;
ALTER TABLE public.inventory_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv read" ON public.inventory_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "inv insert" ON public.inventory_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "inv update" ON public.inventory_sessions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TABLE public.inventory_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.inventory_sessions(id) ON DELETE CASCADE,
  lot_id uuid NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  counted_quantity numeric(12,3) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, lot_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_counts TO authenticated;
GRANT ALL ON public.inventory_counts TO service_role;
ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ic read" ON public.inventory_counts FOR SELECT TO authenticated USING (true);
CREATE POLICY "ic insert" ON public.inventory_counts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ic update" ON public.inventory_counts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TRIGGER trg_cat_upd BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sup_upd BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_prod_upd BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lot_upd BEFORE UPDATE ON public.lots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE VIEW public.lot_stock AS
SELECT
  l.id AS lot_id,
  l.product_id,
  l.lot_number,
  l.quantity AS initial_quantity,
  COALESCE(SUM(CASE m.type WHEN 'entree' THEN m.quantity WHEN 'sortie' THEN -m.quantity ELSE 0 END), 0) AS delta,
  l.quantity + COALESCE(SUM(CASE m.type WHEN 'entree' THEN m.quantity WHEN 'sortie' THEN -m.quantity ELSE 0 END), 0) AS current_quantity
FROM public.lots l
LEFT JOIN public.stock_movements m ON m.lot_id = l.id
GROUP BY l.id;
GRANT SELECT ON public.lot_stock TO authenticated;

-- Storage policies (buckets already created)
CREATE POLICY "photos read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-photos');
CREATE POLICY "photos insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-photos');
CREATE POLICY "photos update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-photos');
CREATE POLICY "photos delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-photos');

CREATE POLICY "certs read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'certificats');
CREATE POLICY "certs insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificats');
CREATE POLICY "certs update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificats');
CREATE POLICY "certs delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificats');
