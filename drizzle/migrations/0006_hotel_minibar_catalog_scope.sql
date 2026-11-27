DROP POLICY IF EXISTS "prod read" ON public.products;
CREATE POLICY "prod read" ON public.products FOR SELECT TO authenticated USING(public.has_any_role(auth.uid(),ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));
CREATE OR REPLACE FUNCTION public.hotel_minibar_catalog() RETURNS TABLE(id uuid,name text,sale_price numeric) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.is_hotel_staff(auth.uid()) THEN RAISE EXCEPTION 'Accès hôtel non autorisé'; END IF;
 RETURN QUERY SELECT p.id,p.name,p.sale_price FROM public.products p WHERE NOT p._deleted ORDER BY p.name LIMIT 500;
END $$;
REVOKE ALL ON FUNCTION public.hotel_minibar_catalog() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hotel_minibar_catalog() TO authenticated;