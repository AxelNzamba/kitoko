CREATE OR REPLACE FUNCTION public.set_staff_role(_user_id uuid, _role public.app_role) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.has_role(auth.uid(),'proprietaire') THEN RAISE EXCEPTION 'Accès réservé au Propriétaire'; END IF;
 IF _role NOT IN ('magasinier','caissier','receptionniste') OR _role IS NULL THEN RAISE EXCEPTION 'Rôle non autorisé'; END IF;
 IF _user_id = auth.uid() OR public.has_role(_user_id,'proprietaire') THEN RAISE EXCEPTION 'Le rôle Propriétaire ne peut pas être modifié ici'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=_user_id) THEN RAISE EXCEPTION 'Compte introuvable'; END IF;
 DELETE FROM public.user_roles WHERE user_id=_user_id;
 INSERT INTO public.user_roles(user_id,role) VALUES(_user_id,_role);
 INSERT INTO public.audit_log(user_id,action,module,label,table_name,record_id,details) VALUES(auth.uid(),'modification','utilisateurs','Rôle du personnel','user_roles',_user_id::text,jsonb_build_object('role',_role));
 END $$;
REVOKE ALL ON FUNCTION public.set_staff_role(uuid,public.app_role) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_staff_role(uuid,public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.hotel_check_overlap() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE room_state text; cap integer;
BEGIN
 SELECT r.status, t.capacity INTO room_state,cap FROM public.hotel_rooms r LEFT JOIN public.hotel_room_types t ON t.id=r.room_type_id WHERE r.id=NEW.room_id FOR UPDATE OF r;
 IF TG_OP='INSERT' AND NEW.status <> 'confirmee' THEN RAISE EXCEPTION 'Une réservation commence à l’état Confirmée'; END IF;
 IF TG_OP='UPDATE' THEN
  IF OLD.status IN ('partie','annulee') AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'Ce séjour est clôturé'; END IF;
  IF OLD.status='arrivee' AND (NEW.room_id<>OLD.room_id OR NEW.check_in<>OLD.check_in OR NEW.check_out<>OLD.check_out OR NEW.nightly_rate<>OLD.nightly_rate) THEN RAISE EXCEPTION 'Les dates, la chambre et le tarif sont figés après arrivée'; END IF;
  IF NEW.status<>OLD.status AND NOT ((OLD.status='confirmee' AND NEW.status IN ('arrivee','annulee')) OR (OLD.status='arrivee' AND NEW.status='partie')) THEN RAISE EXCEPTION 'Changement de séjour non autorisé'; END IF;
 END IF;
 IF NEW.status IN ('confirmee','arrivee') THEN
  IF room_state='maintenance' THEN RAISE EXCEPTION 'Cette chambre est en maintenance'; END IF;
  IF cap IS NOT NULL AND NEW.adults>cap THEN RAISE EXCEPTION 'La capacité de cette chambre est dépassée'; END IF;
  IF EXISTS(SELECT 1 FROM public.hotel_reservations r WHERE r.room_id=NEW.room_id AND r.id<>NEW.id AND r.status IN ('confirmee','arrivee') AND r.check_in<NEW.check_out AND NEW.check_in<r.check_out) THEN RAISE EXCEPTION 'Cette chambre est déjà réservée sur ces dates'; END IF;
 END IF;
 IF TG_OP='UPDATE' AND NEW.status='arrivee' AND OLD.status<>'arrivee' AND room_state<>'libre' THEN RAISE EXCEPTION 'La chambre doit être libre et nettoyée avant l’arrivée'; END IF;
 RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.hotel_guard_charge() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE state text;
BEGIN
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'Les consommations enregistrées ne peuvent pas être modifiées ou supprimées'; END IF;
 SELECT status INTO state FROM public.hotel_reservations WHERE id=NEW.reservation_id FOR UPDATE;
 IF state IS DISTINCT FROM 'arrivee' THEN RAISE EXCEPTION 'Les consommations sont réservées aux séjours en cours'; END IF;
 NEW.created_by:=auth.uid(); RETURN NEW;
END $$;
CREATE TRIGGER hotel_guard_charge BEFORE INSERT OR UPDATE OR DELETE ON public.hotel_charges FOR EACH ROW EXECUTE FUNCTION public.hotel_guard_charge();

CREATE OR REPLACE FUNCTION public.hotel_charge_stock() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_lot uuid; v_wh uuid;
BEGIN
 IF NOT public.is_hotel_staff(auth.uid()) THEN RAISE EXCEPTION 'Accès hôtel non autorisé'; END IF;
 IF NEW.product_id IS NOT NULL THEN
  PERFORM 1 FROM public.products WHERE id=NEW.product_id AND NOT _deleted FOR UPDATE;
  SELECT ls.lot_id,l.warehouse_id INTO v_lot,v_wh FROM public.lot_stock ls JOIN public.lots l ON l.id=ls.lot_id WHERE ls.product_id=NEW.product_id AND ls.current_quantity>=NEW.quantity AND NOT l._deleted ORDER BY l.reception_date LIMIT 1;
  IF v_lot IS NULL THEN RAISE EXCEPTION 'Stock insuffisant pour ce produit'; END IF;
  INSERT INTO public.stock_movements(product_id,lot_id,type,quantity,unit_price,reason,created_by,warehouse_id) VALUES(NEW.product_id,v_lot,'sortie',NEW.quantity,NEW.unit_price,'Minibar hôtel',auth.uid(),v_wh);
 END IF; RETURN NEW;
END $$;