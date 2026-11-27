import { Banknote, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, readCurrencyConfig, type CurrencyCode } from "@/lib/currency";
import { NumericKeypad } from "./numeric-keypad";
import { QuickCashButtons } from "./quick-cash";

/** Section de paiement espèces : montant reçu grand affichage, monnaie exacte en gros caractères verts */
export function CashSection({
  cashReceived,
  onCashReceivedChange,
  ttc,
  onQuickAmount,
  onQuickAmountReset,
  currencyCode,
  currencySymbol,
  showKeypad,
  onToggleKeypad,
  disabled,
}: {
  cashReceived: string;
  onCashReceivedChange: (v: string) => void;
  ttc: number;
  onQuickAmount: (amount: number) => void;
  onQuickAmountReset: () => void;
  currencyCode: CurrencyCode;
  currencySymbol: string;
  showKeypad: boolean;
  onToggleKeypad: () => void;
  disabled?: boolean;
}) {
  const { base, display } = readCurrencyConfig();

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          Paiement — Espèces
        </Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleKeypad}
          className="text-[11px] px-1.5 py-0.5"
        >
          {showKeypad ? "Masquer le pavé" : "Pavé tactile"}
        </Button>
      </div>

      {/* Champ grand affichage montant reçu */}
      <div className="mt-1">
        <Input
          type="text"
          inputMode="decimal"
          value={cashReceived}
          onChange={(e) => onCashReceivedChange(e.target.value)}
          disabled={disabled}
          placeholder="0"
          className="h-14 text-3xl font-bold text-foreground"
          autoFocus
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          {formatMoney(ttc)} due · {currencySymbol}
        </p>
      </div>

      {/* Boutons de monnaie rapides */}
      <div className="mt-2">
        <QuickCashButtons onAmount={onQuickAmount} disabled={disabled} />
        <button
          type="button"
          onClick={onQuickAmountReset}
          className="mt-1.5 text-[10px] font-semibold text-muted-foreground hover:text-accent"
        >
          ← Réinitialiser
        </button>
      </div>

      {/* Monnaie à rendre */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-green-500/30 bg-green-50 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Banknote className="size-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700">Monnaie à rendre</span>
        </div>
        <span className="font-mono text-lg font-bold text-green-700">
          {formatMoney(ttc)} → {formatMoney(0)}
        </span>
      </div>
    </div>
  );
}
