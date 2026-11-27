
DROP POLICY IF EXISTS "sale insert" ON public.sales;
CREATE POLICY "sale insert" ON public.sales FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'caissier'));

DROP POLICY IF EXISTS "si insert" ON public.sale_items;
CREATE POLICY "si insert" ON public.sale_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'proprietaire') OR public.has_role(auth.uid(),'caissier'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _is_first BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO _is_first;

  -- Only auto-assign a role to the very first user (bootstrap owner).
  -- Subsequent users start with no role and must be granted one by a proprietaire.
  IF _is_first THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'proprietaire'::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;
