import type { Product } from "@/components/ux/quick-pills";
import { CategoryColorBadge } from "@/components/ux/category-pills";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Grille de produits avec photo et badge de catégorie pour sélection tactile rapide */
export function ProductGrid({
  products,
  activeId,
  onSelect,
  onAddToCart,
}: {
  products: Product[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAddToCart: (id: string) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
        Aucun produit trouvé.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {products.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={cn(
            "group flex flex-col rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-accent hover:shadow-md active:scale-[0.97]",
            activeId === p.id
              ? "ring-2 ring-accent ring-offset-1"
              : "hover:bg-accent/5",
          )}
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
              {p.sku}
            </span>
            <CategoryColorBadge label={p.category ?? "Autre"} />
          </div>
          <h3 className="mt-1 line-clamp-1 text-sm font-semibold leading-tight">
            {p.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {p.barcode ?? "—"}
          </p>
          <span className="mt-auto pt-2 text-lg font-bold text-accent">
            {p.sale_price?.toLocaleString("fr-FR") ?? ""}
          </span>
        </button>
      ))}
    </div>
  );
}
