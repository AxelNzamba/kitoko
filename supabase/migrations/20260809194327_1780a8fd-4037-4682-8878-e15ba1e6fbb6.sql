ALTER TABLE public.stock_transfers
  ADD COLUMN IF NOT EXISTS _field_versions jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS _client_id uuid,
  ADD COLUMN IF NOT EXISTS _deleted boolean NOT NULL DEFAULT false;

ALTER TABLE public.stock_transfer_items
  ADD COLUMN IF NOT EXISTS _field_versions jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS _client_id uuid,
  ADD COLUMN IF NOT EXISTS _deleted boolean NOT NULL DEFAULT false;

DROP TRIGGER IF EXISTS trg_bump_versions ON public.stock_transfers;
CREATE TRIGGER trg_bump_versions
  BEFORE INSERT OR UPDATE ON public.stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.bump_field_versions();

DROP TRIGGER IF EXISTS trg_bump_versions ON public.stock_transfer_items;
CREATE TRIGGER trg_bump_versions
  BEFORE INSERT OR UPDATE ON public.stock_transfer_items
  FOR EACH ROW EXECUTE FUNCTION public.bump_field_versions();

CREATE INDEX IF NOT EXISTS idx_stock_transfers_updated_at ON public.stock_transfers (updated_at);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_items_updated_at ON public.stock_transfer_items (updated_at);