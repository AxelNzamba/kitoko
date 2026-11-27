-- Aligne la couverture du journal d'activité sur la base déployée.
--
-- La migration 20261106090000 pose les triggers sur 12 tables ; la base de
-- production en trace 27 (dont profiles, SAV, commandes fournisseurs,
-- transferts, retours, inventaire). Cette migration ajoute les triggers
-- manquants SANS toucher à ceux déjà en place (par exemple ceux qui utilisent
-- log_audit('achats') sur les achats).
--
-- Idempotente : réexécutable sans doublon ni erreur.
-- Dépend de public.audit_row_change() créée par 20261106090000_audit_logs.sql.

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories', 'suppliers', 'products', 'lots', 'stock_movements',
    'sales', 'sale_items', 'clients', 'expenses', 'user_roles',
    'warehouses', 'credits',
    -- Tables supplémentaires déjà tracées en production.
    'profiles', 'client_debts', 'debt_payments',
    'purchase_orders', 'purchase_order_items',
    'sav_interventions', 'sav_tickets', 'sav_intervention_serials',
    'serial_numbers', 'stock_locations', 'stock_transfers',
    'stock_transfer_items', 'supplier_returns',
    'inventory_sessions', 'inventory_counts'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) AND NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = t
        AND tg.tgname = format('audit_%s', t)
        AND NOT tg.tgisinternal
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.audit_row_change()',
        t, t
      );
    END IF;
  END LOOP;
END;
$$;
