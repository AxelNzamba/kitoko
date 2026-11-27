-- ============================================================
-- Migration: Stock Alerts
-- Date: 2026-07-21
-- Description:
--   - Vue product_stock_levels : stock total par produit
--   - Fonction check_stock_alerts() : produits sous le stock_min
--   - Index pour optimiser la vue
-- ============================================================

-- 1. Vue des niveaux de stock par produit
-- Agrège la vue lot_stock pour donner le stock total par produit
CREATE OR REPLACE VIEW public.product_stock_levels AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  p.sku,
  p.stock_min,
  COALESCE(SUM(ls.current_quantity), 0) AS current_stock
FROM public.products p
LEFT JOIN public.lot_stock ls ON ls.product_id = p.id
GROUP BY p.id, p.name, p.sku, p.stock_min;

ALTER VIEW public.product_stock_levels SET (security_invoker = on);
GRANT SELECT ON public.product_stock_levels TO authenticated;

-- 2. Fonction pour vérifier les produits sous le seuil
-- Retourne les produits où current_stock < stock_min ET stock_min > 0
CREATE OR REPLACE FUNCTION public.check_stock_alerts()
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  sku TEXT,
  stock_min INTEGER,
  current_stock NUMERIC,
  status TEXT
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    psl.product_id,
    psl.product_name,
    psl.sku,
    psl.stock_min,
    psl.current_stock,
    CASE
      WHEN psl.current_stock <= 0 THEN 'rupture'
      WHEN psl.current_stock < psl.stock_min THEN 'faible'
    END::TEXT AS status
  FROM public.product_stock_levels psl
  WHERE psl.stock_min > 0
    AND psl.current_stock < psl.stock_min
  ORDER BY psl.current_stock ASC;
$$;

GRANT EXECUTE ON FUNCTION public.check_stock_alerts() TO authenticated;

-- 3. Index pour accélérer la jointure lot_stock -> products
-- NB : lot_stock est une VUE (pas une table) : un index ne peut pas être posé dessus.
-- On indexe la colonne de jointure de la table sous-jacente stock_movements.
CREATE INDEX IF NOT EXISTS idx_stock_movements_lot_id ON public.stock_movements(lot_id);
