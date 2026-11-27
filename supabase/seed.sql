-- ============================================================================
-- Jeu de données de DÉMONSTRATION — Kitoko Stock / INDUS-ERP
--
-- À exécuter MANUELLEMENT (SQL Editor Supabase ou `supabase db execute -f`)
-- sur une base de test. Ne pas exécuter automatiquement en production.
--
-- Le script est idempotent : il peut être rejoué sans créer de doublons.
-- Les SKU sont préfixés DEMO- pour être repérables et supprimables.
-- ============================================================================

-- 1. Entrepôt de démonstration -------------------------------------------------
INSERT INTO public.warehouses (name, code, address, is_active)
SELECT 'Magasin démo', 'DEMO', 'Kinshasa', true
WHERE NOT EXISTS (SELECT 1 FROM public.warehouses WHERE code = 'DEMO');

-- 2. Catégories ----------------------------------------------------------------
INSERT INTO public.categories (name)
SELECT v.name
FROM (VALUES ('Boissons'), ('Épicerie'), ('Hygiène')) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.name = v.name
);

-- 3. Fournisseur ---------------------------------------------------------------
INSERT INTO public.suppliers (name, phone, email, address)
SELECT 'DEMO Fournisseur', '+243 810 000 000', 'demo@fournisseur.cd', 'Kinshasa'
WHERE NOT EXISTS (SELECT 1 FROM public.suppliers WHERE name = 'DEMO Fournisseur');

-- 4. Produits ------------------------------------------------------------------
INSERT INTO public.products
  (name, sku, barcode, category_id, purchase_price, sale_price, tva, stock_min, description)
SELECT v.name, v.sku, v.barcode, c.id, v.purchase, v.sale, 18, v.stock_min, 'Produit de démonstration'
FROM (
  VALUES
    ('Eau minérale 1,5 L',      'DEMO-EAU-15',  '1000000000017', 'Boissons', 500::numeric,  800::numeric,  20),
    ('Soda cola 33 cl',         'DEMO-COLA-33', '1000000000024', 'Boissons', 700::numeric,  1200::numeric, 24),
    ('Riz parfumé 5 kg',        'DEMO-RIZ-5',   '1000000000031', 'Épicerie', 9000::numeric, 12500::numeric, 10),
    ('Huile végétale 1 L',      'DEMO-HUILE-1', '1000000000048', 'Épicerie', 2500::numeric, 3500::numeric,  12),
    ('Savon de ménage 400 g',   'DEMO-SAVON-4', '1000000000055', 'Hygiène',  800::numeric,  1200::numeric,  30),
    ('Détergent 500 ml',        'DEMO-DETER-5', '1000000000062', 'Hygiène',  1800::numeric, 2600::numeric,  15)
) AS v(name, sku, barcode, category, purchase, sale, stock_min)
JOIN public.categories c ON c.name = v.category
ON CONFLICT (sku) DO NOTHING;

-- 5. Lots (stock initial) ------------------------------------------------------
INSERT INTO public.lots
  (product_id, supplier_id, warehouse_id, lot_number, reception_date, quantity, unit_purchase_price)
SELECT p.id,
       (SELECT id FROM public.suppliers WHERE name = 'DEMO Fournisseur' LIMIT 1),
       (SELECT id FROM public.warehouses WHERE code = 'DEMO' LIMIT 1),
       'LOT-' || p.sku,
       CURRENT_DATE,
       CASE p.sku
         WHEN 'DEMO-EAU-15'  THEN 120
         WHEN 'DEMO-COLA-33' THEN 96
         WHEN 'DEMO-RIZ-5'   THEN 40
         WHEN 'DEMO-HUILE-1' THEN 60
         WHEN 'DEMO-SAVON-4' THEN 150
         ELSE 80
       END,
       p.purchase_price
FROM public.products p
WHERE p.sku LIKE 'DEMO-%'
  AND NOT EXISTS (
    SELECT 1 FROM public.lots l WHERE l.lot_number = 'LOT-' || p.sku
  );

-- 6. Clients -------------------------------------------------------------------
INSERT INTO public.clients (name, company, phone, email, address)
SELECT v.name, v.company, v.phone, v.email, v.address
FROM (
  VALUES
    ('Alice Mbala',  'Dépôt Mbala',   '+243 811 111 111', 'alice@example.cd',  'Kinshasa'),
    ('Boutique Nzela', NULL,          '+243 822 222 222', 'nzela@example.cd',  'Kinshasa'),
    ('Jean Kabasele', 'Kaba Trading', '+243 833 333 333', 'jean@example.cd',   'Lubumbashi')
) AS v(name, company, phone, email, address)
WHERE NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.name = v.name);

-- 7. Ventes de démonstration ---------------------------------------------------
-- 7a. En-têtes de vente
INSERT INTO public.sales (number, total_ht, total_tva, total_ttc, payment_mode, client_name)
SELECT v.number, v.ht, ROUND(v.ht * 0.18, 2), v.ht + ROUND(v.ht * 0.18, 2), v.mode, v.client
FROM (
  VALUES
    ('DEMO-V001', 2 * 800::numeric + 3 * 1200::numeric, 'especes',      'Alice Mbala'),
    ('DEMO-V002', 1 * 12500::numeric + 2 * 3500::numeric, 'mobile_money', 'Boutique Nzela')
) AS v(number, ht, mode, client)
WHERE NOT EXISTS (SELECT 1 FROM public.sales s WHERE s.number = v.number);

-- 7b. Lignes de vente
INSERT INTO public.sale_items (sale_id, product_id, lot_id, quantity, unit_price, tva)
SELECT s.id, p.id, l.id, v.qty, p.sale_price, 18
FROM (
  VALUES
    ('DEMO-V001', 'DEMO-EAU-15',  2),
    ('DEMO-V001', 'DEMO-COLA-33', 3),
    ('DEMO-V002', 'DEMO-RIZ-5',   1),
    ('DEMO-V002', 'DEMO-HUILE-1', 2)
) AS v(sale_number, sku, qty)
JOIN public.sales s ON s.number = v.sale_number
JOIN public.products p ON p.sku = v.sku
LEFT JOIN public.lots l ON l.lot_number = 'LOT-' || p.sku
WHERE NOT EXISTS (
  SELECT 1
  FROM public.sale_items si
  WHERE si.sale_id = s.id AND si.product_id = p.id
);

-- 7c. Mouvements de sortie associés (cohérence du stock et du journal)
INSERT INTO public.stock_movements
  (product_id, lot_id, warehouse_id, type, quantity, unit_price, reason)
SELECT si.product_id,
       si.lot_id,
       (SELECT id FROM public.warehouses WHERE code = 'DEMO' LIMIT 1),
       'sortie',
       si.quantity,
       si.unit_price,
       'Vente ' || s.number || ' (démo)'
FROM public.sale_items si
JOIN public.sales s ON s.id = si.sale_id
WHERE s.number LIKE 'DEMO-V%'
  AND NOT EXISTS (
    SELECT 1 FROM public.stock_movements m
    WHERE m.reason = 'Vente ' || s.number || ' (démo)'
      AND m.product_id = si.product_id
  );

-- 8. Dépense de démonstration --------------------------------------------------
INSERT INTO public.expenses (label, amount, expense_date, category)
SELECT 'Loyer magasin (démo)', 250000, CURRENT_DATE, 'Loyer'
WHERE NOT EXISTS (
  SELECT 1 FROM public.expenses e WHERE e.label = 'Loyer magasin (démo)'
);

-- Fin du seed de démonstration.
