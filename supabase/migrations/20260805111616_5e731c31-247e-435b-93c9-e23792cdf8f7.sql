CREATE TABLE public.sav_intervention_serials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intervention_id uuid NOT NULL REFERENCES public.sav_interventions(id) ON DELETE CASCADE,
  serial_id uuid NOT NULL REFERENCES public.serial_numbers(id) ON DELETE CASCADE,
  outcome text NOT NULL DEFAULT 'traite',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (intervention_id, serial_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sav_intervention_serials TO authenticated;
GRANT ALL ON public.sav_intervention_serials TO service_role;

ALTER TABLE public.sav_intervention_serials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sis_select_roles" ON public.sav_intervention_serials
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));

CREATE POLICY "sis_insert_roles" ON public.sav_intervention_serials
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier','caissier']::public.app_role[]));

CREATE POLICY "sis_update_roles" ON public.sav_intervention_serials
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['proprietaire','magasinier']::public.app_role[]));

CREATE POLICY "sis_delete_owner" ON public.sav_intervention_serials
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'::public.app_role));

CREATE TRIGGER trg_sis_upd BEFORE UPDATE ON public.sav_intervention_serials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_sis_intervention ON public.sav_intervention_serials(intervention_id);
CREATE INDEX idx_sis_serial ON public.sav_intervention_serials(serial_id);