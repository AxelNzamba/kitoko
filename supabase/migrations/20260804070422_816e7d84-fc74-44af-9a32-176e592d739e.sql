-- ============ NUMEROS DE SERIE ============
CREATE TYPE public.serial_status AS ENUM ('en_stock','vendu','retourne','sav','rebut');

CREATE TABLE public.serial_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial text NOT NULL,
  status public.serial_status NOT NULL DEFAULT 'en_stock',
  sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, serial)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.serial_numbers TO authenticated;
GRANT ALL ON public.serial_numbers TO service_role;
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "serials_select" ON public.serial_numbers FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE POLICY "serials_insert" ON public.serial_numbers FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "serials_update" ON public.serial_numbers FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE POLICY "serials_delete" ON public.serial_numbers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
CREATE TRIGGER trg_serials_upd BEFORE UPDATE ON public.serial_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_serials_lot ON public.serial_numbers(lot_id);
CREATE INDEX idx_serials_serial ON public.serial_numbers(serial);

-- ============ COMMANDES FOURNISSEURS ============
CREATE TYPE public.po_status AS ENUM ('brouillon','envoyee','partielle','receptionnee','annulee');

CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text NOT NULL UNIQUE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_date date,
  status public.po_status NOT NULL DEFAULT 'brouillon',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "po_select" ON public.purchase_orders FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "po_insert" ON public.purchase_orders FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "po_update" ON public.purchase_orders FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "po_delete" ON public.purchase_orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
CREATE TRIGGER trg_po_upd BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_ordered numeric NOT NULL DEFAULT 0,
  quantity_received numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_items TO authenticated;
GRANT ALL ON public.purchase_order_items TO service_role;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poi_select" ON public.purchase_order_items FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "poi_insert" ON public.purchase_order_items FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "poi_update" ON public.purchase_order_items FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));
CREATE POLICY "poi_delete" ON public.purchase_order_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
CREATE TRIGGER trg_poi_upd BEFORE UPDATE ON public.purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_poi_po ON public.purchase_order_items(purchase_order_id);

CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT 'CF-' || TO_CHAR(NOW(),'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SPLIT_PART(po_number,'-',3) AS INTEGER)),0)+1
     FROM public.purchase_orders
     WHERE po_number LIKE 'CF-' || TO_CHAR(NOW(),'YYYYMMDD') || '-%')::TEXT, 4, '0');
$$;

-- ============ SAV ============
CREATE TYPE public.sav_type AS ENUM ('garantie','retour','intervention');
CREATE TYPE public.sav_status AS ENUM ('ouvert','en_cours','resolu','refuse');

CREATE TABLE public.sav_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  serial_id uuid REFERENCES public.serial_numbers(id) ON DELETE SET NULL,
  type public.sav_type NOT NULL DEFAULT 'garantie',
  status public.sav_status NOT NULL DEFAULT 'ouvert',
  warranty_end date,
  description text NOT NULL,
  resolution text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sav_tickets TO authenticated;
GRANT ALL ON public.sav_tickets TO service_role;
ALTER TABLE public.sav_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sav_select" ON public.sav_tickets FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE POLICY "sav_insert" ON public.sav_tickets FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE POLICY "sav_update" ON public.sav_tickets FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE POLICY "sav_delete" ON public.sav_tickets FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
CREATE TRIGGER trg_sav_upd BEFORE UPDATE ON public.sav_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.sav_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.sav_tickets(id) ON DELETE CASCADE,
  intervention_date date NOT NULL DEFAULT CURRENT_DATE,
  technician text,
  description text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sav_interventions TO authenticated;
GRANT ALL ON public.sav_interventions TO service_role;
ALTER TABLE public.sav_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "savi_select" ON public.sav_interventions FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE POLICY "savi_insert" ON public.sav_interventions FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE POLICY "savi_update" ON public.sav_interventions FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE POLICY "savi_delete" ON public.sav_interventions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));
CREATE TRIGGER trg_savi_upd BEFORE UPDATE ON public.sav_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_savi_ticket ON public.sav_interventions(ticket_id);

CREATE OR REPLACE FUNCTION public.generate_sav_number()
RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT 'SAV-' || TO_CHAR(NOW(),'YYYYMMDD') || '-' || LPAD(
    (SELECT COALESCE(MAX(CAST(SPLIT_PART(ticket_number,'-',3) AS INTEGER)),0)+1
     FROM public.sav_tickets
     WHERE ticket_number LIKE 'SAV-' || TO_CHAR(NOW(),'YYYYMMDD') || '-%')::TEXT, 4, '0');
$$;