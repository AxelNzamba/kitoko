CREATE OR REPLACE VIEW public.lot_stock_by_warehouse
WITH (security_invoker = true)
AS
SELECT
  l.id AS lot_id,
  l.product_id,
  l.warehouse_id,
  COALESCE(SUM(CASE WHEN m.type = 'entree' THEN m.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN m.type = 'sortie' THEN m.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN m.type = 'inventaire' THEN m.quantity ELSE 0 END), 0)
    AS current_quantity
FROM public.lots l
LEFT JOIN public.stock_movements m ON m.lot_id = l.id AND m.warehouse_id = l.warehouse_id
GROUP BY l.id, l.product_id, l.warehouse_id;

-- Accès à la vue pour authenticated
GRANT SELECT ON public.lot_stock_by_warehouse TO authenticated;
GRANT SELECT ON public.lot_stock_by_warehouse TO service_role;
