CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view clients" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Proprio or caissier can insert clients" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'proprietaire') OR public.has_role(auth.uid(), 'caissier'));

CREATE POLICY "Proprio or caissier can update clients" ON public.clients
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire') OR public.has_role(auth.uid(), 'caissier'));

CREATE POLICY "Proprio can delete clients" ON public.clients
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();