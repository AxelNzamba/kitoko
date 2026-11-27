import { Banknote, Euro, RussianRubleIcon as Ruble, JapaneseYenIcon as Won, SwissFrancIcon as Franc, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, type CurrencyCode } from "@/lib/currency";
import { useMemo } from "react";

/** Boutons de monnaie de base (10, 20, 50, 100...) */
export function QuickCashButtons({
  onAmount,
  disabled,
}: {
  onAmount: (amount: number) => void;
  disabled?: boolean;
}) {
  const amounts = [100, 500, 1000, 2000, 5000, 10000];
  return (
    <div className="flex flex-wrap gap-1.5">
      {amounts.map((a) => (
        <Button
          key={a}
          variant="secondary"
          size="sm"
          onClick={() => onAmount(a)}
          disabled={disabled}
          className="text-xs"
        >
          {a.toLocaleString("fr-FR")}
        </Button>
      ))}
    </div>
  );
}

/** Champ "Montant reçu" grand affichage, couleur verte si surenvoie, rouge si manquant */
export function CashReceivedField({
  value,
  currencyCode,
  onValueChange,
  ttc,
  disabled,
}: {
  value: string;
  currencyCode: CurrencyCode;
  onValueChange: (v: string) => void;
  ttc: number;
  disabled?: boolean;
}) {
  const display = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return n;
  }, [value]);

  const change = useMemo(() => {
    const amount = Number(value) || 0;
    return amount - ttc;
  }, [value, ttc]);

  const isPositive = change >= 0;
  const changeDisplay = isPositive ? change : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          Montant reçu
        </Label>
        <span className="text-[10px] text-muted-foreground">
          {formatMoney(ttc)} due
        </span>
      </div>
      <Input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        placeholder="0"
        className="h-12 text-2xl font-bold text-foreground"
        autoFocus
      />
      <div
        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold ${
          isPositive
            ? "border-green-500/30 bg-green-50 text-green-700"
            : "border-red-500/30 bg-red-50 text-red-700"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Banknote className="size-4" />
          Monnaie à rendre
        </span>
        <span className="font-mono">{formatMoney(changeDisplay)}</span>
      </div>
    </div>
  );
}
