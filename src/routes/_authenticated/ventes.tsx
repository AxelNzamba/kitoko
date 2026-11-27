import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback, useEffect } from "react";
import {
  Trash2,
  Search,
  Receipt as ReceiptIcon,
  Percent,
  Keyboard,
  Mail,
  Printer,
  MessageCircle,
  Delete as DeleteIcon,
  Banknote,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { checkAndNotifyAlerts } from "@/hooks/use-stock-alerts";
import { toast } from "sonner";
import { track } from "@/lib/audit";

import { checkCreditLimit, debtRemaining, whatsappLink } from "@/lib/credit";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatXOF, generateSaleNumber } from "@/lib/format";
import { printReceipt, type ReceiptData } from "@/lib/receipt";
import { shareSaleOnWhatsApp } from "@/lib/whatsapp";
import { readSettings } from "@/lib/app-settings";
import {
  cashShortcuts,
  convertFromBase,
  convertToBase,
  displayCurrencySymbol,
  readCurrencyConfig,
} from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/ventes")({
  component: VentesPage,
  head: () => ({ meta: [{ title: "Ventes / POS — INDUS-ERP" },
      { name: "description", content: "Ventes / POS — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Ventes / POS — INDUS-ERP" },
      { property: "og:description", content: "Ventes / POS — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

type CartLine = {
  product_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  tva: number;
  discount_pct: number; // % de remise ligne
};

type Totals = {
  ht: number;
  tva: number;
  ttc: number;
  discountTotal: number;
  globalDiscountAmount: number;
};

type LastSale = {
  receipt: ReceiptData;
  cart: CartLine[];
  totals: Totals;
  paymentMode: string;
  clientName: string;
  clientPhone: string;
};

const PAYMENT_LABELS: Record<string, string> = {
  especes: "Espèces",
  mobile_money: "Mobile Money",
  carte: "Carte bancaire",
  virement: "Virement",
  cheque: "Chèque",
};

/** Pavé numérique tactile : complète le montant reçu en espèces. */
function NumericKeypad({
  onDigit,
  onClear,
  onBackspace,
}: {
  onDigit: (digit: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}) {
  const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onDigit(key)}
          className="h-10 rounded-md border border-border bg-card text-sm font-semibold transition hover:border-accent active:scale-95"
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="h-10 rounded-md border border-border bg-card text-xs font-semibold text-muted-foreground transition hover:border-destructive hover:text-destructive active:scale-95"
      >
        C
      </button>
      <button
        type="button"
        onClick={() => onDigit("0")}
        className="h-10 rounded-md border border-border bg-card text-sm font-semibold transition hover:border-accent active:scale-95"
      >
        0
      </button>
      <button
        type="button"
        onClick={onBackspace}
        aria-label="Effacer le dernier chiffre"
        className="flex h-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-accent hover:text-foreground active:scale-95"
      >
        <DeleteIcon className="size-4" />
      </button>
    </div>
  );
}

function VentesPage() {
  const qc = useQueryClient();
  const currency = readCurrencyConfig();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMode, setPaymentMode] = useState("especes");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [creditClientId, setCreditClientId] = useState("");
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  const { data: creditClients = [] } = useQuery({
    queryKey: ["clients_credit_pick"],
    enabled: paymentMode === "credit",
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name, phone, credit_limit").eq("_deleted", false).order("name").limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);
  const [lastSale, setLastSale] = useState<LastSale | null>(null);

  // Focus input on mount
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearch("");
      if (e.key === "F8") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>("input[placeholder*='Rechercher']");
        input?.focus();
      }
      if (e.key === "F9") {
        e.preventDefault();
        if (cart.length > 0) submit.mutate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cart]);

  const { data: products = [] } = useQuery({
    queryKey: ["products", "pos"],
    queryFn: async () =>
      (
        await supabase
          .from("products")
          .select("id, name, sku, barcode, sale_price, tva")
          .order("name")
      ).data ?? [],
  });

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return products.slice(0, 12);
    const s = debouncedSearch.toLowerCase();
    const results = products.filter(
      (p: any) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.barcode ?? "").includes(s),
    );
    results.sort((a: any, b: any) => {
      const aName = a.name.toLowerCase().indexOf(s);
      const bName = b.name.toLowerCase().indexOf(s);
      if (aName === -1 && bName === -1) return 0;
      if (aName === -1) return 1;
      if (bName === -1) return -1;
      return aName - bName;
    });
    return results.slice(0, 12);
  }, [products, debouncedSearch]);

  const addToCart = useCallback((p: any) => {
    setCart((c) => {
      const found = c.find((l) => l.product_id === p.id);
      if (found)
        return c.map((l) => (l.product_id === p.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [
        {
          product_id: p.id,
          name: p.name,
          sku: p.sku,
          quantity: 1,
          unit_price: Number(p.sale_price),
          tva: Number(p.tva),
          discount_pct: 0,
        },
        ...c,
      ];
    });
    setSearch("");
  }, []);

  const updateLine = useCallback((index: number, updates: Partial<CartLine>) => {
    setCart((c) => c.map((l, i) => (i === index ? { ...l, ...updates } : l)));
  }, []);

  const removeLine = useCallback((index: number) => {
    setCart((c) => c.filter((_, i) => i !== index));
  }, []);

  const totals = useMemo<Totals>(() => {
    let ht = 0,
      tva = 0,
      discountTotal = 0;
    for (const l of cart) {
      const sub = l.unit_price * l.quantity;
      const discount = sub * (l.discount_pct / 100);
      const afterDiscount = sub - discount;
      ht += afterDiscount;
      tva += (afterDiscount * l.tva) / 100;
      discountTotal += discount;
    }
    const htAfterGlobal = ht * (1 - globalDiscount / 100);
    const tvaAfterGlobal = (htAfterGlobal / ht) * tva || 0;
    return {
      ht: htAfterGlobal,
      tva: tvaAfterGlobal,
      ttc: htAfterGlobal + tvaAfterGlobal,
      discountTotal,
      globalDiscountAmount: ht - htAfterGlobal,
    };
  }, [cart, globalDiscount]);

  // La caisse encaisse dans la devise affichée ; le stockage reste en devise de base.
  const displayTtc = convertFromBase(totals.ttc, currency);
  const cashNumber = Number(cashReceived.replace(",", ".")) || 0;
  const changeDisplay = cashNumber - displayTtc;
  const currencySymbol = displayCurrencySymbol();

  const submit = useMutation({
    mutationFn: async () => {
      if (cart.length === 0) throw new Error("Panier vide");
      const number = generateSaleNumber();
      const { data: u } = await supabase.auth.getUser();
      let creditClient: (typeof creditClients)[number] | undefined;
      if (paymentMode === "credit") {
        creditClient = creditClients.find((c) => c.id === creditClientId);
        if (!creditClient) throw new Error("Choisissez le client pour une vente à crédit");
        if (!dueDate) throw new Error("Indiquez la date d'échéance");
        const { data: open, error: oe } = await supabase.from("client_debts").select("amount, due_date, debt_payments(amount)").eq("client_id", creditClient.id);
        if (oe) throw oe;
        const current = (open ?? []).reduce((a, d: any) => a + debtRemaining({ ...d, payments: d.debt_payments }), 0);
        const check = checkCreditLimit(Number(creditClient.credit_limit), current, totals.ttc);
        if (!check.ok) throw new Error(check.reason);
      }

      const sale = await supabase
        .from("sales")
        .insert({
          number,
          total_ht: totals.ht,
          total_tva: totals.tva,
          total_ttc: totals.ttc,
          payment_mode: paymentMode,
          client_name: creditClient?.name ?? (clientName || null),
          created_by: u.user?.id,
        })
        .select()
        .single();
      if (sale.error) throw sale.error;
      if (creditClient) {
        const debt = await supabase.from("client_debts").insert({ client_id: creditClient.id, sale_id: sale.data.id, amount: totals.ttc, due_date: dueDate, created_by: u.user?.id });
        if (debt.error) throw debt.error;
      }

      for (const l of cart) {
        const { data: lots } = await supabase
          .from("lots")
          .select("id, quantity")
          .eq("product_id", l.product_id)
          .order("reception_date", { ascending: true });
        const firstLot = lots?.[0];

        const item = await supabase.from("sale_items").insert({
          sale_id: sale.data.id,
          product_id: l.product_id,
          lot_id: firstLot?.id ?? null,
          quantity: l.quantity,
          unit_price: l.unit_price * (1 - l.discount_pct / 100),
          tva: l.tva,
        });
        if (item.error) throw item.error;

        const mov = await supabase.from("stock_movements").insert({
          product_id: l.product_id,
          lot_id: firstLot?.id ?? null,
          type: "sortie",
          quantity: l.quantity,
          unit_price: l.unit_price * (1 - l.discount_pct / 100),
          reason: `Vente ${number}${l.discount_pct > 0 ? ` (remise ${l.discount_pct}%)` : ""}`,
          created_by: u.user?.id,
        });
        if (mov.error) throw mov.error;
      }
      const cashBase =
        paymentMode === "especes" && cashNumber > 0
          ? convertToBase(cashNumber, currency)
          : undefined;
      const receipt: ReceiptData = {
        number,
        paymentMode: PAYMENT_LABELS[paymentMode] ?? paymentMode,
        clientName: creditClient?.name ?? clientName ?? null,
        lines: cart.map((l) => ({
          name: l.name,
          sku: l.sku,
          quantity: l.quantity,
          unitPrice: l.unit_price * (1 - l.discount_pct / 100),
          total: l.unit_price * l.quantity * (1 - l.discount_pct / 100),
        })),
        ht: totals.ht,
        tva: totals.tva,
        ttc: totals.ttc,
        discountTotal: totals.discountTotal + totals.globalDiscountAmount,
        cashReceived: cashBase,
        change: cashBase !== undefined ? Math.max(cashBase - totals.ttc, 0) : undefined,
      };

      return { number, sale: sale.data, creditClient, receipt };
    },
    onSuccess: async ({ number, sale, creditClient, receipt }) => {
      if (creditClient) {
        const link = whatsappLink(creditClient.phone, `Bonjour ${creditClient.name}, merci pour votre achat. Facture ${number} : ${formatXOF(totals.ttc)} à crédit, à régler avant le ${dueDate}.`);
        if (link && window.confirm(`Envoyer le récapitulatif de la facture ${number} par WhatsApp à ${creditClient.name} ?`)) window.open(link, "_blank", "noopener");
        setCreditClientId("");
        qc.invalidateQueries({ queryKey: ["client_debts"] });
      }
      track({ module: "ventes", action: "vente_validee", label: `Vente ${number} validée`, table: "sales", recordId: (sale as any)?.id, warehouseId: (sale as any)?.warehouse_id ?? null, details: { total: totals.ttc, paiement: paymentMode, articles: cart.length, client: creditClient?.name ?? clientName ?? null } });
      toast.success(`Vente ${number} enregistrée`);
      setLastSale({
        receipt,
        cart,
        totals,
        paymentMode: PAYMENT_LABELS[paymentMode] ?? paymentMode,
        clientName,
        clientPhone,
      });
      if (readSettings().autoPrintReceipt) printReceipt(receipt);

      setCart([]);
      setClientName("");
      setClientPhone("");
      setGlobalDiscount(0);
      setCashReceived("");
      setShowKeypad(false);
      qc.invalidateQueries({ queryKey: ["movements"] });
      qc.invalidateQueries({ queryKey: ["lot_stock"] });
      qc.invalidateQueries({ queryKey: ["stock-alerts"] });
      checkAndNotifyAlerts();
    },
    onError: (e: any) => toast.error(e.message),
  });

  function appendDigit(digit: string) {
    setCashReceived((v) => (v === "0" ? digit : v + digit));
  }

  function sendOnWhatsApp() {
    if (!lastSale) return;
    const phone = lastSale.clientPhone.trim() || window.prompt("Numéro WhatsApp du client :", "");
    if (!phone) return;
    const ok = shareSaleOnWhatsApp(lastSale.receipt, phone);
    if (ok) toast.success("WhatsApp ouvert dans un nouvel onglet");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ventes / POS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Caisse rapide · <kbd className="rounded bg-muted px-1 font-mono text-xs">F8</kbd>{" "}
            recherche · <kbd className="rounded bg-muted px-1 font-mono text-xs">F9</kbd> valider
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(!showShortcuts)}>
          <Keyboard className="mr-1 size-4" /> Raccourcis
        </Button>
      </div>

      {showShortcuts && (
        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <p className="mb-1 font-semibold">Raccourcis clavier</p>
          <div className="grid grid-cols-2 gap-1 text-muted-foreground sm:grid-cols-3">
            <span>
              <kbd className="rounded bg-muted px-1 font-mono">F8</kbd> Focus recherche
            </span>
            <span>
              <kbd className="rounded bg-muted px-1 font-mono">F9</kbd> Valider la vente
            </span>
            <span>
              <kbd className="rounded bg-muted px-1 font-mono">Échap</kbd> Vider recherche
            </span>
            <span>
              <kbd className="rounded bg-muted px-1 font-mono">↑↓</kbd> Naviguer résultats
            </span>
            <span>
              <kbd className="rounded bg-muted px-1 font-mono">Entrée</kbd> Ajouter au panier
            </span>
          </div>
        </div>
      )}

      {lastSale && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Dernière vente · {lastSale.receipt.number}
            </span>
            <span className="text-xs text-muted-foreground">{formatXOF(lastSale.receipt.ttc)}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => printReceipt(lastSale.receipt)}>
                <Printer className="mr-1 size-4" /> Ticket
              </Button>
              <Button variant="outline" size="sm" onClick={sendOnWhatsApp}>
                <MessageCircle className="mr-1 size-4" /> WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  generateInvoicePDF(
                    lastSale.receipt.number,
                    lastSale.cart,
                    lastSale.totals,
                    lastSale.paymentMode,
                    lastSale.clientName,
                  )
                }
              >
                <ReceiptIcon className="mr-1 size-4" /> Facture A4
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSendInvoiceEmail(lastSale)}>
                <Mail className="mr-1 size-4" /> Email
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* Product search + grid */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher un produit (nom, SKU, code-barres)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filtered.map((p: any) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="flex min-h-24 flex-col rounded-lg border border-border bg-card p-3 text-left transition hover:border-accent hover:shadow-sm active:scale-[0.97]"
              >
                <span className="line-clamp-2 text-sm font-medium">{p.name}</span>
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">{p.sku}</span>
                <span className="mt-auto pt-2 text-sm font-semibold text-accent">
                  {formatXOF(Number(p.sale_price))}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                Aucun produit trouvé.
              </p>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="flex flex-col rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b p-3">
            <span className="text-sm font-semibold">Panier ({cart.length})</span>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-muted-foreground hover:text-destructive"
              >
                Vider
              </button>
            )}
          </div>
          <div className="max-h-[360px] flex-1 overflow-y-auto p-3">
            {cart.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Panier vide.</p>
            )}
            {cart.map((l, i) => {
              const lineTotal = l.unit_price * l.quantity;
              const lineDiscounted = lineTotal * (1 - l.discount_pct / 100);
              return (
                <div key={`${l.product_id}-${i}`} className="mb-2 rounded border p-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1 font-medium">{l.name}</span>
                    <button
                      onClick={() => removeLine(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Input
                      type="number"
                      className="h-8 w-16"
                      value={l.quantity}
                      min={0}
                      onChange={(e) => updateLine(i, { quantity: Number(e.target.value) || 0 })}
                    />
                    <span className="text-xs text-muted-foreground">×</span>
                    <Input
                      type="number"
                      className="h-8 w-24"
                      value={l.unit_price}
                      onChange={(e) => updateLine(i, { unit_price: Number(e.target.value) })}
                    />
                    <div className="relative flex items-center">
                      <Percent className="pointer-events-none absolute left-1.5 size-3 text-muted-foreground" />
                      <Input
                        type="number"
                        className="h-8 w-16 pl-6"
                        value={l.discount_pct}
                        min={0}
                        max={100}
                        onChange={(e) =>
                          updateLine(i, { discount_pct: Number(e.target.value) || 0 })
                        }
                        title="Remise %"
                      />
                    </div>
                    <span className="ml-auto text-right">
                      {l.discount_pct > 0 ? (
                        <>
                          <span className="text-muted-foreground line-through">
                            {formatXOF(lineTotal)}
                          </span>
                          <br />
                          <span className="font-semibold text-accent">
                            {formatXOF(lineDiscounted)}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold">{formatXOF(lineTotal)}</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t p-3 text-sm">
            {totals.discountTotal > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Remises lignes</span>
                <span>-{formatXOF(totals.discountTotal)}</span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Remise globale</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  className="h-6 w-16 text-right text-xs"
                  value={globalDiscount}
                  min={0}
                  max={100}
                  onChange={(e) => setGlobalDiscount(Number(e.target.value) || 0)}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            {totals.globalDiscountAmount > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Remise globale</span>
                <span>-{formatXOF(totals.globalDiscountAmount)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Total HT</span>
              <span>{formatXOF(totals.ht)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA</span>
              <span>{formatXOF(totals.tva)}</span>
            </div>
            <div className="mt-1 flex justify-between text-lg font-bold text-accent">
              <span>TTC</span>
              <span>{formatXOF(totals.ttc)}</span>
            </div>
            {currency.display !== currency.base && (
              <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                Affiché en {currency.display} · stocké en {currency.base}
              </p>
            )}
          </div>

          <div className="grid gap-2 border-t p-3">
            <div className="grid gap-1">
              <Label className="text-xs">Client (optionnel)</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nom client"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">WhatsApp client (optionnel)</Label>
              <Input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="081 234 5678"
                inputMode="tel"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Paiement</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="carte">Carte bancaire</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="credit">Crédit (à payer plus tard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMode === "credit" && (
              <div className="grid gap-2 rounded-md border border-accent/40 p-2">
                <div className="grid gap-1">
                  <Label className="text-xs">Client à crédit</Label>
                  <Select value={creditClientId} onValueChange={setCreditClientId}>
                    <SelectTrigger><SelectValue placeholder="Choisir un client" /></SelectTrigger>
                    <SelectContent>
                      {creditClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} — plafond {formatXOF(Number(c.credit_limit))}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">À payer avant le</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            )}
            {paymentMode === "especes" && (
              <div className="rounded-md border border-border bg-muted/30 p-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1 text-xs">
                    <Banknote className="size-3.5" /> Montant reçu ({currencySymbol})
                  </Label>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-accent"
                    onClick={() => setShowKeypad((v) => !v)}
                  >
                    {showKeypad ? "Masquer le pavé" : "Pavé tactile"}
                  </button>
                </div>
                <Input
                  type="number"
                  inputMode="decimal"
                  className="mt-1 h-9 text-right font-mono text-base"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setCashReceived(String(displayTtc))}
                    className="rounded border border-border bg-card px-2 py-1 text-[10px] font-semibold hover:border-accent"
                  >
                    Exact
                  </button>
                  {cashShortcuts().map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCashReceived(String(amount))}
                      className="rounded border border-border bg-card px-2 py-1 text-[10px] font-semibold hover:border-accent"
                    >
                      {amount.toLocaleString("fr-FR")}
                    </button>
                  ))}
                </div>
                {showKeypad && (
                  <div className="mt-2">
                    <NumericKeypad
                      onDigit={appendDigit}
                      onClear={() => setCashReceived("")}
                      onBackspace={() => setCashReceived((v) => v.slice(0, -1))}
                    />
                  </div>
                )}
                {cashNumber > 0 && (
                  <div
                    className={`mt-2 flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold ${
                      changeDisplay >= 0
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <span>{changeDisplay >= 0 ? "Monnaie à rendre" : "Manquant"}</span>
                    <span className="font-mono">
                      {Math.abs(changeDisplay).toLocaleString("fr-FR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      {currencySymbol}
                    </span>
                  </div>
                )}
              </div>
            )}
            <Button
              className="mt-1 h-11 text-base"
              disabled={cart.length === 0 || submit.isPending}
              onClick={() => submit.mutate()}
            >
              <ReceiptIcon className="mr-1 size-4" />
              {submit.isPending ? "Enregistrement..." : "Valider la vente"}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">
              F9 valide · ticket thermique imprimé automatiquement si activé dans les paramètres.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function handleSendInvoiceEmail(sale: LastSale) {
  const email = prompt(`Adresse email pour envoyer la facture ${sale.receipt.number} :`, "");
  if (!email) return;

  toast.info(
    `Email simulé — configurez une clé Resend pour l'envoi réel à ${email}. ` +
      `Astuce : utilisez plutôt le bouton WhatsApp.`,
  );
}

async function generateInvoicePDF(
  number: string,
  items: CartLine[],
  totals: Totals,
  paymentMode: string,
  clientName: string,
) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("FACTURE", 14, 20);
  doc.setFontSize(10);
  doc.text(`N° ${number}`, 14, 28);
  doc.text(`Date : ${new Date().toLocaleString("fr-FR")}`, 14, 34);
  if (clientName) doc.text(`Client : ${clientName}`, 14, 40);
  doc.text(`Paiement : ${paymentMode}`, 14, clientName ? 46 : 40);

  autoTable(doc, {
    startY: 56,
    head: [["Produit", "SKU", "Qté", "PU", "Rem.%", "Total HT"]],
    body: items.map((i) => [
      i.name,
      i.sku,
      i.quantity.toString(),
      formatXOF(i.unit_price),
      i.discount_pct > 0 ? `${i.discount_pct}%` : "—",
      formatXOF(i.unit_price * i.quantity * (1 - i.discount_pct / 100)),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [23, 42, 69] },
  });

  const y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Total HT : ${formatXOF(totals.ht)}`, 140, y);
  doc.text(`TVA : ${formatXOF(totals.tva)}`, 140, y + 6);
  doc.setFontSize(12);
  doc.setFont(undefined as any, "bold");
  doc.text(`TOTAL TTC : ${formatXOF(totals.ttc)}`, 140, y + 14);

  doc.save(`facture-${number}.pdf`);
}
