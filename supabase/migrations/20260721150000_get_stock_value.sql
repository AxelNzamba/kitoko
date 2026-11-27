-- ============================================================
-- Migration: get_stock_value function
-- Date: 2026-07-21
-- Description:
--   Calcule la valeur totale du stock en multipliant la
--   quantité actuelle de chaque lot par son prix d'achat unitaire
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_stock_value()
RETURNS TABLE(total_value NUMERIC)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(ls.current_quantity * l.unit_purchase_price), 0) AS total_value
  FROM public.lot_stock ls
  JOIN public.lots l ON l.id = ls.lot_id
  WHERE ls.current_quantity > 0;
$$;

GRANT EXECUTE ON FUNCTION public.get_stock_value() TO authenticated;
