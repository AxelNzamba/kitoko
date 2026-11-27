-- ============================================================
-- Fix RLS Policies — Audit de sécurité 2026-07-21
-- ============================================================
-- 
-- Problème détecté :
-- Les tables stock_movements, sales, sale_items, 
-- inventory_sessions et inventory_counts avaient des politiques
-- RLS qui vérifiaient seulement auth.uid() IS NOT NULL
-- (i.e., n'importe quel utilisateur authentifié).
--
-- Cela signifie qu'un simple "caissier" pouvait :
-- - Créer des mouvements de stock (réservé aux magasiniers)
-- - Gérer des sessions d'inventaire
--
-- Correction : Ajouter des vérifications de rôle appropriées.
-- ============================================================

-- ---
-- 1. stock_movements : Seuls proprietaire et magasinier
-- ---
DROP POLICY IF EXISTS "mov insert" ON public.stock_movements;
CREATE POLICY "mov insert" ON public.stock_movements
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'magasinier')
  );

DROP POLICY IF EXISTS "mov update" ON public.stock_movements;
CREATE POLICY "mov update" ON public.stock_movements
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'magasinier')
  );

DROP POLICY IF EXISTS "mov delete" ON public.stock_movements;
CREATE POLICY "mov delete" ON public.stock_movements
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

COMMENT ON POLICY "mov insert" ON public.stock_movements IS 'Seuls proprietaire et magasinier peuvent créer des mouvements de stock';
COMMENT ON POLICY "mov update" ON public.stock_movements IS 'Seuls proprietaire et magasinier peuvent modifier des mouvements de stock';
COMMENT ON POLICY "mov delete" ON public.stock_movements IS 'Seul proprietaire peut supprimer des mouvements de stock';

-- ---
-- 2. sales + sale_items : Proprietaire et caissier (ventes)
-- ---
DROP POLICY IF EXISTS "sale insert" ON public.sales;
CREATE POLICY "sale insert" ON public.sales
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'caissier')
  );

DROP POLICY IF EXISTS "sale update" ON public.sales;
CREATE POLICY "sale update" ON public.sales
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'caissier')
  );

DROP POLICY IF EXISTS "sale delete" ON public.sales;
CREATE POLICY "sale delete" ON public.sales
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

COMMENT ON POLICY "sale insert" ON public.sales IS 'Seuls proprietaire et caissier peuvent créer des ventes';

DROP POLICY IF EXISTS "si insert" ON public.sale_items;
CREATE POLICY "si insert" ON public.sale_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'caissier')
  );

DROP POLICY IF EXISTS "si update" ON public.sale_items;
CREATE POLICY "si update" ON public.sale_items
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'caissier')
  );

DROP POLICY IF EXISTS "si delete" ON public.sale_items;
CREATE POLICY "si delete" ON public.sale_items
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

COMMENT ON POLICY "si insert" ON public.sale_items IS 'Seuls proprietaire et caissier peuvent créer des lignes de vente';

-- ---
-- 3. inventory_sessions + inventory_counts : Proprietaire et magasinier
-- ---
DROP POLICY IF EXISTS "inv insert" ON public.inventory_sessions;
CREATE POLICY "inv insert" ON public.inventory_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'magasinier')
  );

DROP POLICY IF EXISTS "inv update" ON public.inventory_sessions;
CREATE POLICY "inv update" ON public.inventory_sessions
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'magasinier')
  );

DROP POLICY IF EXISTS "inv delete" ON public.inventory_sessions;
CREATE POLICY "inv delete" ON public.inventory_sessions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

COMMENT ON POLICY "inv insert" ON public.inventory_sessions IS 'Seuls proprietaire et magasinier peuvent créer des sessions d''inventaire';

DROP POLICY IF EXISTS "ic insert" ON public.inventory_counts;
CREATE POLICY "ic insert" ON public.inventory_counts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'magasinier')
  );

DROP POLICY IF EXISTS "ic update" ON public.inventory_counts;
CREATE POLICY "ic update" ON public.inventory_counts
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'proprietaire')
    OR public.has_role(auth.uid(), 'magasinier')
  );

DROP POLICY IF EXISTS "ic delete" ON public.inventory_counts;
CREATE POLICY "ic delete" ON public.inventory_counts
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'proprietaire'));

COMMENT ON POLICY "ic insert" ON public.inventory_counts IS 'Seuls proprietaire et magasinier peuvent créer des comptages d''inventaire';

-- Les politiques de LECTURE restent inchangées (tous les authentifiés peuvent lire)

-- ---
-- 4. Storage buckets : Ajout de vérification des rôles
-- ---

-- Product-photos : Seuls proprietaire et magasinier peuvent uploader
DROP POLICY IF EXISTS "photos insert" ON storage.objects;
CREATE POLICY "photos insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-photos'
    AND (
      public.has_role(auth.uid(), 'proprietaire')
      OR public.has_role(auth.uid(), 'magasinier')
    )
  );

DROP POLICY IF EXISTS "photos update" ON storage.objects;
CREATE POLICY "photos update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-photos'
    AND (
      public.has_role(auth.uid(), 'proprietaire')
      OR public.has_role(auth.uid(), 'magasinier')
    )
  );

DROP POLICY IF EXISTS "photos delete" ON storage.objects;
CREATE POLICY "photos delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-photos'
    AND public.has_role(auth.uid(), 'proprietaire')
  );

COMMENT ON POLICY "photos insert" ON storage.objects IS 'Seuls proprietaire et magasinier peuvent uploader des photos produits';
COMMENT ON POLICY "photos delete" ON storage.objects IS 'Seul proprietaire peut supprimer des photos produits';

-- Certificats : Seuls proprietaire et magasinier peuvent uploader
DROP POLICY IF EXISTS "certs insert" ON storage.objects;
CREATE POLICY "certs insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'certificats'
    AND (
      public.has_role(auth.uid(), 'proprietaire')
      OR public.has_role(auth.uid(), 'magasinier')
    )
  );

DROP POLICY IF EXISTS "certs update" ON storage.objects;
CREATE POLICY "certs update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'certificats'
    AND (
      public.has_role(auth.uid(), 'proprietaire')
      OR public.has_role(auth.uid(), 'magasinier')
    )
  );

DROP POLICY IF EXISTS "certs delete" ON storage.objects;
CREATE POLICY "certs delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'certificats'
    AND public.has_role(auth.uid(), 'proprietaire')
  );

COMMENT ON POLICY "certs insert" ON storage.objects IS 'Seuls proprietaire et magasinier peuvent uploader des certificats';
COMMENT ON POLICY "certs delete" ON storage.objects IS 'Seul proprietaire peut supprimer des certificats';

-- ---
-- 5. Index pour les requêtes d'audit
-- ---
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_by
  ON public.stock_movements(created_by);

CREATE INDEX IF NOT EXISTS idx_sales_created_by
  ON public.sales(created_by);

CREATE INDEX IF NOT EXISTS idx_inventory_sessions_created_by
  ON public.inventory_sessions(created_by);

-- Index pour le tri par date (performance)
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at_desc
  ON public.stock_movements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_created_at_desc
  ON public.sales(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_sessions_created_at_desc
  ON public.inventory_sessions(created_at DESC);
