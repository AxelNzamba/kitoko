import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search, Package, Boxes, Users, Truck, LayoutDashboard, FileText } from "lucide-react";
import { modules } from "@/lib/modules";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

type SearchResult = {
  id: string;
  type: "product" | "lot" | "client" | "supplier" | "page";
  title: string;
  subtitle?: string;
  to?: string;
};

export function GlobalCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [rawQuery, setRawQuery] = useState("");
  const query = useDebounce(rawQuery, 200);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const pageResults: SearchResult[] = useMemo(
    () =>
      modules
        .flatMap((g) => g.items)
        .filter((m) => m.title.toLowerCase().includes(rawQuery.toLowerCase()))
        .map((m) => ({
          id: `page-${m.to}`,
          type: "page",
          title: m.title,
          to: m.to,
        })),
    [rawQuery],
  );

  useEffect(() => {
    if (!open) {
      setResults([]);
      setRawQuery("");
      return;
    }

    const q = query.trim();
    if (q.length < 2) {
      setResults(pageResults);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function search() {
      const pattern = `%${q}%`;
      const [{ data: products }, { data: lots }, { data: clients }, { data: suppliers }] =
        await Promise.all([
          (supabase as any)
            .from("products")
            .select("id, name, sku, barcode")
            .or(`name.ilike.${pattern},sku.ilike.${pattern},barcode.ilike.${pattern}`)
            .limit(5),
          (supabase as any)
            .from("lots")
            .select("id, lot_number, products(name)")
            .ilike("lot_number", pattern)
            .limit(5),
          (supabase as any)
            .from("clients")
            .select("id, name, phone, company")
            .or(`name.ilike.${pattern},phone.ilike.${pattern},company.ilike.${pattern}`)
            .limit(5),
          (supabase as any)
            .from("suppliers")
            .select("id, name, phone")
            .or(`name.ilike.${pattern},phone.ilike.${pattern}`)
            .limit(5),
        ]);

      if (cancelled) return;

      const mapped: SearchResult[] = [
        ...(products ?? []).map((p: any) => ({
          id: p.id,
          type: "product" as const,
          title: p.name,
          subtitle: p.sku || p.barcode,
          to: `/produits`,
        })),
        ...(lots ?? []).map((l: any) => ({
          id: l.id,
          type: "lot" as const,
          title: l.lot_number,
          subtitle: l.products?.name,
          to: `/lots`,
        })),
        ...(clients ?? []).map((c: any) => ({
          id: c.id,
          type: "client" as const,
          title: c.name,
          subtitle: c.company || c.phone,
          to: `/clients`,
        })),
        ...(suppliers ?? []).map((s: any) => ({
          id: s.id,
          type: "supplier" as const,
          title: s.name,
          subtitle: s.phone,
          to: `/fournisseurs`,
        })),
      ];

      setResults([...mapped, ...pageResults]);
      setLoading(false);
    }

    search();
    return () => {
      cancelled = true;
    };
  }, [open, query, pageResults]);

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    if (result.to) navigate({ to: result.to });
  };

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      const key = r.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return groups;
  }, [results]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Rechercher un produit, lot, client, fournisseur ou page…"
        value={rawQuery}
        onValueChange={setRawQuery}
      />
      <CommandList>
        {loading && <div className="py-6 text-center text-sm text-muted-foreground">Recherche…</div>}
        {!loading && results.length === 0 && <CommandEmpty>Aucun résultat.</CommandEmpty>}

        {grouped.page?.length > 0 && (
          <CommandGroup heading="Pages">
            {grouped.page.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleSelect(r)}>
                <LayoutDashboard className="mr-2 size-4" />
                {r.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {grouped.product?.length > 0 && (
          <CommandGroup heading="Produits">
            {grouped.product.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleSelect(r)}>
                <Package className="mr-2 size-4" />
                <span className="flex-1">{r.title}</span>
                {r.subtitle && <span className="text-xs text-muted-foreground">{r.subtitle}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {grouped.lot?.length > 0 && (
          <CommandGroup heading="Lots">
            {grouped.lot.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleSelect(r)}>
                <Boxes className="mr-2 size-4" />
                <span className="flex-1">{r.title}</span>
                {r.subtitle && <span className="text-xs text-muted-foreground">{r.subtitle}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {grouped.client?.length > 0 && (
          <CommandGroup heading="Clients">
            {grouped.client.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleSelect(r)}>
                <Users className="mr-2 size-4" />
                <span className="flex-1">{r.title}</span>
                {r.subtitle && <span className="text-xs text-muted-foreground">{r.subtitle}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {grouped.supplier?.length > 0 && (
          <CommandGroup heading="Fournisseurs">
            {grouped.supplier.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleSelect(r)}>
                <Truck className="mr-2 size-4" />
                <span className="flex-1">{r.title}</span>
                {r.subtitle && <span className="text-xs text-muted-foreground">{r.subtitle}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative hidden h-9 w-64 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:flex"
    >
      <Search className="mr-2 size-4" />
      Rechercher…
      <kbd className="pointer-events-none absolute right-2 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium lg:inline">
        ⌘K
      </kbd>
    </button>
  );
}
