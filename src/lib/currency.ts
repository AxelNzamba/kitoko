import { readSettings, writeSettings } from "@/lib/app-settings";

export type CurrencyCode = "XOF" | "XAF" | "CDF" | "USD" | "EUR";

export type CurrencyMeta = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  decimals: number;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  CDF: { code: "CDF", label: "Franc congolais", symbol: "FC", decimals: 0 },
  XOF: { code: "XOF", label: "Franc CFA (UEMOA)", symbol: "F", decimals: 0 },
  XAF: { code: "XAF", label: "Franc CFA (CEMAC)", symbol: "FCFA", decimals: 0 },
  USD: { code: "USD", label: "Dollar américain", symbol: "$US", decimals: 2 },
  EUR: { code: "EUR", label: "Euro", symbol: "€", decimals: 2 },
};

export const CURRENCY_OPTIONS: CurrencyCode[] = ["CDF", "XOF", "XAF", "USD", "EUR"];

export type CurrencyConfig = {
  base: CurrencyCode;
  display: CurrencyCode;
  secondary: CurrencyCode;
  /** Nombre d'unités de la devise de base pour 1 unité de la devise secondaire. */
  rate: number;
};

/**
 * Configuration monétaire courante.
 * Les montants sont TOUJOURS stockés dans la devise de base ; la devise
 * d'affichage (base ou secondaire) n'intervient qu'à la présentation.
 */
export function readCurrencyConfig(): CurrencyConfig {
  const s = readSettings();
  const base = isCurrency(s.currency) ? s.currency : "XOF";
  const secondary = isCurrency(s.secondaryCurrency) ? s.secondaryCurrency : "USD";
  const display = isCurrency(s.displayCurrency) ? s.displayCurrency : base;
  const rate = Number(s.exchangeRate) > 0 ? Number(s.exchangeRate) : 1;
  return { base, display, secondary, rate };
}

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && value in CURRENCIES;
}

/** Convertit un montant de la devise de base vers la devise d'affichage. */
export function convertFromBase(amount: number, config = readCurrencyConfig()): number {
  if (config.display === config.base) return amount;
  if (config.display !== config.secondary) return amount;
  return amount / config.rate;
}

/** Convertit un montant saisi dans la devise d'affichage vers la devise de base. */
export function convertToBase(amount: number, config = readCurrencyConfig()): number {
  if (config.display === config.base) return amount;
  if (config.display !== config.secondary) return amount;
  return amount * config.rate;
}

export function formatCurrency(amount: number, code: CurrencyCode): string {
  const meta = CURRENCIES[code];
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: meta.decimals,
    minimumFractionDigits: meta.decimals,
  }).format(amount);
  return `${formatted} ${meta.symbol}`;
}

/** Formate un montant exprimé dans la devise de base, dans la devise d'affichage. */
export function formatMoney(amountInBase: number): string {
  const config = readCurrencyConfig();
  return formatCurrency(convertFromBase(amountInBase, config), config.display);
}

/** Change la devise d'affichage ; retourne false si la devise est inconnue. */
export function setDisplayCurrency(code: CurrencyCode): boolean {
  if (!isCurrency(code)) return false;
  writeSettings({ displayCurrency: code });
  return true;
}

/** Symbole de la devise affichée (sans espace). */
export function displayCurrencySymbol(): string {
  return CURRENCIES[readCurrencyConfig().display].symbol;
}

/** Valeurs de billets/pièces proposées comme raccourcis au comptoir. */
export function cashShortcuts(): number[] {
  const config = readCurrencyConfig();
  if (config.display === "USD" || config.display === "EUR") {
    return [1, 5, 10, 20, 50, 100];
  }
  return [1000, 2000, 5000, 10000, 20000, 50000];
}
