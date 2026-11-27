import { Link } from "@tanstack/react-router";
import { Check, Coins, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CURRENCIES,
  readCurrencyConfig,
  setDisplayCurrency,
  type CurrencyCode,
} from "@/lib/currency";

/**
 * Bascule rapide entre la devise de base et la devise secondaire.
 * Les montants stockés ne changent pas : seul l'affichage est converti.
 * Un rechargement garantit que tous les écrans adoptent la nouvelle devise.
 */
export function CurrencyToggle() {
  const config = readCurrencyConfig();
  const options: CurrencyCode[] = [config.base, config.secondary].filter(
    (c, i, arr) => arr.indexOf(c) === i,
  );

  function choose(code: CurrencyCode) {
    if (code === config.display) return;
    if (setDisplayCurrency(code)) window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Devise d'affichage"
          className="flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <Coins className="size-3.5" />
          {config.display}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Devise d'affichage</DropdownMenuLabel>
        {options.map((code) => (
          <DropdownMenuItem key={code} onSelect={() => choose(code)} className="gap-2">
            <Check
              className={code === config.display ? "size-3.5 text-accent" : "size-3.5 opacity-0"}
            />
            <span className="flex-1">{CURRENCIES[code].label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{code}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/parametres" className="gap-2">
            <Settings2 className="size-3.5" />
            Taux et devises
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
