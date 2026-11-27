import type { CurrencyCode } from "@/lib/currency";

export const SETTINGS_KEY = "indus-erp-settings";

export type ReceiptWidth = 58 | 80;

export type AppSettings = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  tvaDefault: number;
  /** Devise de stockage des montants en base. */
  currency: CurrencyCode;
  /** Devise secondaire utilisée pour l'affichage alternatif. */
  secondaryCurrency: CurrencyCode;
  /** Nombre d'unités de la devise de base pour 1 unité de la devise secondaire. */
  exchangeRate: number;
  /** Devise actuellement affichée dans l'interface. */
  displayCurrency: CurrencyCode;
  receiptFooter: string;
  receiptWidth: ReceiptWidth;
  autoPrintReceipt: boolean;
  whatsappCountryCode: string;
  soundEnabled: boolean;
  lowStockThreshold: number;
  emailAlertsEnabled: boolean;
  alertEmail: string;
};

export const defaultSettings: AppSettings = {
  companyName: "INDUS-ERP",
  address: "",
  phone: "",
  email: "",
  taxId: "",
  tvaDefault: 18,
  currency: "XOF",
  secondaryCurrency: "USD",
  exchangeRate: 600,
  displayCurrency: "XOF",
  receiptFooter: "Merci de votre confiance !",
  receiptWidth: 80,
  autoPrintReceipt: true,
  whatsappCountryCode: "243",
  soundEnabled: true,
  lowStockThreshold: 10,
  emailAlertsEnabled: false,
  alertEmail: "",
};

/** Lit les paramètres locaux de façon tolérante (stockage indisponible, JSON invalide). */
export function readSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return defaultSettings;
  }
}

export function writeSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...readSettings(), ...partial };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      /* stockage indisponible : les réglages ne survivront pas au rechargement */
    }
  }
  return next;
}
