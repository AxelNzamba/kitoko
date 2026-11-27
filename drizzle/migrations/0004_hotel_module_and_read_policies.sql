-- Sécurité : lecture limitée par rôle
DROP POLICY IF EXISTS "prod read" ON public.products;
CREATE POLICY "prod read" ON public.products FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier','receptionniste']::public.app_role[]));
DROP POLICY IF EXISTS "sloc read" ON public.stock_locations;
CREATE POLICY "sloc read" ON public.stock_locations FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
DROP POLICY IF EXISTS "cred read" ON public.credits;
CREATE POLICY "cred read" ON public.credits FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','caissier']::public.app_role[]));

-- Helper accès hôtel
CREATE OR REPLACE FUNCTION public.is_hotel_staff(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_any_role(_uid, ARRAY['proprietaire','receptionniste']::public.app_role[])
$$;

CREATE TABLE public.hotel_room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  base_price numeric NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  capacity integer NOT NULL DEFAULT 2 CHECK (capacity > 0),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.hotel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  room_type_id uuid REFERENCES public.hotel_room_types(id) ON DELETE SET NULL,
  floor text,
  status text NOT NULL DEFAULT 'libre' CHECK (status IN ('libre','occupee','a_nettoyer','maintenance')),
  price_override numeric CHECK (price_override IS NULL OR price_override >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.hotel_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number text NOT NULL UNIQUE DEFAULT ('RES-' || to_char(now(),'YYMMDD') || '-' || upper(substr(md5(random()::text),1,4))),
  room_id uuid NOT NULL REFERENCES public.hotel_rooms(id),
  guest_name text NOT NULL,
  guest_phone text,
  guest_email text,
  guest_id_doc text,
  adults integer NOT NULL DEFAULT 1 CHECK (adults > 0),
  check_in date NOT NULL,
  check_out date NOT NULL,
  status text NOT NULL DEFAULT 'confirmee' CHECK (status IN ('confirmee','arrivee','partie','annulee')),
  nightly_rate numeric NOT NULL DEFAULT 0 CHECK (nightly_rate >= 0),
  deposit numeric NOT NULL DEFAULT 0 CHECK (deposit >= 0),
  payment_mode text,
  notes text,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);
CREATE INDEX hotel_res_room_dates ON public.hotel_reservations(room_id, check_in, check_out);
CREATE TABLE public.hotel_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.hotel_reservations(id) ON DELETE CASCADE,
  label text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  product_id uuid REFERENCES public.products(id),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hotel_charges_res ON public.hotel_charges(reservation_id);
CREATE TABLE public.hotel_housekeeping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.hotel_rooms(id) ON DELETE CASCADE,
  task text NOT NULL DEFAULT 'Nettoyage complet',
  status text NOT NULL DEFAULT 'a_faire' CHECK (status IN ('a_faire','en_cours','fait')),
  assigned_to text,
  due_date date NOT NULL DEFAULT current_date,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['hotel_room_types','hotel_rooms','hotel_reservations','hotel_charges','hotel_housekeeping'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "hotel read" ON public.%I FOR SELECT TO authenticated USING (public.is_hotel_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "hotel insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_hotel_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "hotel update" ON public.%I FOR UPDATE TO authenticated USING (public.is_hotel_staff(auth.uid())) WITH CHECK (public.is_hotel_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "hotel delete" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''proprietaire''))', t);
    EXECUTE format('CREATE TRIGGER audit_%s AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_audit(''hotel'')', t, t);
    IF t <> 'hotel_charges' THEN
      EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
    END IF;
  END LOOP;
END $$;

-- Pas de double réservation
CREATE OR REPLACE FUNCTION public.hotel_check_overlap() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('confirmee','arrivee') AND EXISTS (
    SELECT 1 FROM public.hotel_reservations r
    WHERE r.room_id = NEW.room_id AND r.id <> NEW.id
      AND r.status IN ('confirmee','arrivee')
      AND r.check_in < NEW.check_out AND NEW.check_in < r.check_out
  ) THEN
    RAISE EXCEPTION 'Cette chambre est déjà réservée sur ces dates';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_hotel_overlap BEFORE INSERT OR UPDATE ON public.hotel_reservations
  FOR EACH ROW EXECUTE FUNCTION public.hotel_check_overlap();

-- Arrivée / départ → état chambre + tâche de ménage
CREATE OR REPLACE FUNCTION public.hotel_on_status() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'arrivee' AND OLD.status IS DISTINCT FROM 'arrivee' THEN
    NEW.checked_in_at := now();
    UPDATE public.hotel_rooms SET status = 'occupee' WHERE id = NEW.room_id;
  ELSIF NEW.status = 'partie' AND OLD.status IS DISTINCT FROM 'partie' THEN
    NEW.checked_out_at := now();
    UPDATE public.hotel_rooms SET status = 'a_nettoyer' WHERE id = NEW.room_id;
    INSERT INTO public.hotel_housekeeping(room_id, task) VALUES (NEW.room_id, 'Nettoyage après départ');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_hotel_status BEFORE UPDATE ON public.hotel_reservations
  FOR EACH ROW EXECUTE FUNCTION public.hotel_on_status();

CREATE OR REPLACE FUNCTION public.hotel_on_housekeeping_done() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'fait' AND OLD.status IS DISTINCT FROM 'fait' THEN
    NEW.done_at := now();
    UPDATE public.hotel_rooms SET status = 'libre' WHERE id = NEW.room_id AND status = 'a_nettoyer';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_hotel_hk_done BEFORE UPDATE ON public.hotel_housekeeping
  FOR EACH ROW EXECUTE FUNCTION public.hotel_on_housekeeping_done();

-- Minibar : sortie de stock automatique
CREATE OR REPLACE FUNCTION public.hotel_charge_stock() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_lot uuid; v_wh uuid;
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT ls.lot_id, l.warehouse_id INTO v_lot, v_wh
    FROM public.lot_stock ls JOIN public.lots l ON l.id = ls.lot_id
    WHERE ls.product_id = NEW.product_id AND ls.current_quantity >= NEW.quantity AND NOT l._deleted
    ORDER BY l.reception_date LIMIT 1;
    IF v_lot IS NULL THEN
      RAISE EXCEPTION 'Stock insuffisant pour ce produit';
    END IF;
    INSERT INTO public.stock_movements(product_id, lot_id, type, quantity, unit_price, reason, created_by, warehouse_id)
    VALUES (NEW.product_id, v_lot, 'sortie', NEW.quantity, NEW.unit_price, 'Minibar hôtel', auth.uid(), v_wh);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_hotel_charge_stock AFTER INSERT ON public.hotel_charges
  FOR EACH ROW EXECUTE FUNCTION public.hotel_charge_stock();