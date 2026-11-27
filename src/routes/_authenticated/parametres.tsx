import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Bell, Volume2, Save, Info, Mail, AlertTriangle, Printer } from "lucide-react";

import { notify } from "@/lib/notify";
import { readSettings, writeSettings, type AppSettings } from "@/lib/app-settings";
import { CURRENCIES, CURRENCY_OPTIONS } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/parametres")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Paramètres — INDUS-ERP" },
      { name: "description", content: "Paramètres — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:title", content: "Paramètres — INDUS-ERP" },
      { property: "og:description", content: "Paramètres — INDUS-ERP : gestion et suivi dans INDUS-ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

type Settings = AppSettings;

function SettingsPage() {
  const [s, setS] = useState<Settings>(() => readSettings());
  const [initialCurrency, setInitialCurrency] = useState<Settings>(() => readSettings());

  useEffect(() => {
    const current = readSettings();
    setS(current);
    setInitialCurrency(current);
  }, []);

  function save() {
    const next: Settings = { ...s };
    // La devise secondaire doit différer de la devise de base.
    if (next.secondaryCurrency === next.currency) {
      next.secondaryCurrency = next.currency === "USD" ? "CDF" : "USD";
    }
    // Une devise d'affichage doit toujours être base ou secondaire.
    if (next.displayCurrency !== next.currency && next.displayCurrency !== next.secondaryCurrency) {
      next.displayCurrency = next.currency;
    }
    // Pas de conversion possible sans taux : on reste en devise de base.
    if (next.displayCurrency === next.secondaryCurrency && !(next.exchangeRate > 0)) {
      notify.error(
        "Taux de change manquant",
        "Saisissez un taux supérieur à 0 avant d'afficher la devise secondaire.",
      );
      return;
    }
    setS(next);
    writeSettings(next);
    const currencyChanged =
      next.currency !== initialCurrency.currency ||
      next.secondaryCurrency !== initialCurrency.secondaryCurrency ||
      next.displayCurrency !== initialCurrency.displayCurrency ||
      next.exchangeRate !== initialCurrency.exchangeRate;

    if (currencyChanged) {
      notify.success("Paramètres enregistrés", "Application des nouveaux réglages de devise…");
      window.setTimeout(() => window.location.reload(), 600);
      return;
    }
    notify.success("Paramètres enregistrés", "Les modifications sont appliquées.");
  }

  function testSound() {
    notify.info("Test du son", "Notification déclenchée manuellement.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configuration de l'entreprise, du POS et des notifications.</p>
        </div>
        <Button onClick={save}><Save className="mr-1 size-4" /> Enregistrer</Button>
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="size-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Entreprise</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label>Nom de l'entreprise</Label>
            <Input value={s.companyName} onChange={(e) => setS({ ...s, companyName: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Téléphone</Label>
            <Input value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Adresse</Label>
            <Textarea rows={2} value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>NIF / Identifiant fiscal</Label>
            <Input value={s.taxId} onChange={(e) => setS({ ...s, taxId: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Devise de base (stockage)</Label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={s.currency}
              onChange={(e) =>
                setS({ ...s, currency: e.target.value as Settings["currency"], displayCurrency: e.target.value as Settings["currency"] })
              }
            >
              {CURRENCY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {code} — {CURRENCIES[code].label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Les montants restent stockés dans cette devise ; changer de devise
              n'effectue aucune conversion des données existantes.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Devise secondaire (affichage)</Label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={s.secondaryCurrency}
              onChange={(e) =>
                setS({ ...s, secondaryCurrency: e.target.value as Settings["secondaryCurrency"] })
              }
            >
              {CURRENCY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {code} — {CURRENCIES[code].label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Devise affichée actuellement</Label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={s.displayCurrency}
              onChange={(e) =>
                setS({ ...s, displayCurrency: e.target.value as Settings["displayCurrency"] })
              }
            >
              {[s.currency, s.secondaryCurrency]
                .filter((c, i, arr) => arr.indexOf(c) === i)
                .map((code) => (
                  <option key={code} value={code}>
                    {code} — {CURRENCIES[code].label}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Taux de change</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">1 {s.secondaryCurrency} =</span>
              <Input
                type="number"
                min="0"
                step="any"
                value={s.exchangeRate}
                onChange={(e) => setS({ ...s, exchangeRate: Number(e.target.value) || 0 })}
                className="max-w-40"
              />
              <span className="text-sm text-muted-foreground">{s.currency}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Taux utilisé pour convertir les montants dans la devise secondaire,
              à mettre à jour régulièrement.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Info className="size-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Vente & stock</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>TVA par défaut (%)</Label>
            <Input type="number" min="0" max="100" value={s.tvaDefault}
              onChange={(e) => setS({ ...s, tvaDefault: Number(e.target.value) })} />
          </div>
          <div className="grid gap-2">
            <Label>Seuil stock faible</Label>
            <Input type="number" min="0" value={s.lowStockThreshold}
              onChange={(e) => setS({ ...s, lowStockThreshold: Number(e.target.value) })} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Printer className="size-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Ticket de caisse</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Largeur du ticket</Label>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={s.receiptWidth}
                onChange={(e) =>
                  setS({ ...s, receiptWidth: Number(e.target.value) === 58 ? 58 : 80 })
                }
              >
                <option value={80}>80 mm (imprimante de comptoir)</option>
                <option value={58}>58 mm (imprimante portable)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Indicatif WhatsApp par défaut</Label>
              <Input
                value={s.whatsappCountryCode}
                onChange={(e) =>
                  setS({ ...s, whatsappCountryCode: e.target.value.replace(/\D/g, "") })
                }
                placeholder="243"
              />
              <p className="text-xs text-muted-foreground">
                Utilisé pour compléter les numéros locaux (ex. 081… → +243 81…).
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Imprimer le ticket à chaque vente</p>
              <p className="text-xs text-muted-foreground">
                Ouvre le ticket thermique (58/80 mm) immédiatement après validation.
              </p>
            </div>
            <Switch
              checked={s.autoPrintReceipt}
              onCheckedChange={(v) => setS({ ...s, autoPrintReceipt: v })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Pied de ticket</Label>
            <Textarea
              rows={2}
              value={s.receiptFooter}
              onChange={(e) => setS({ ...s, receiptFooter: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="size-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Son des notifications</p>
              <p className="text-xs text-muted-foreground">Joue un son court à chaque alerte importante.</p>
            </div>
            <Switch checked={s.soundEnabled} onCheckedChange={(v) => setS({ ...s, soundEnabled: v })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tester le son</p>
              <p className="text-xs text-muted-foreground">Déclenche une notification de test.</p>
            </div>
            <Button variant="outline" onClick={testSound}><Volume2 className="mr-1 size-4" /> Tester</Button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="size-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Alertes stock</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Seuil affichage dashboard</p>
              <p className="text-xs text-muted-foreground">
                Seuil global d'affichage des alertes sur le tableau de bord. Chaque produit a son propre <code>stock_min</code> défini dans sa fiche.
              </p>
            </div>
            <Input type="number" min="0" className="w-20" value={s.lowStockThreshold}
              onChange={(e) => setS({ ...s, lowStockThreshold: Number(e.target.value) })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Notifications email</p>
                <p className="text-xs text-muted-foreground">
                  Envoyer un email lorsque le stock passe sous le seuil minimum (nécessite une clé Resend configurée).
                </p>
              </div>
            </div>
            <Switch checked={s.emailAlertsEnabled} onCheckedChange={(v) => setS({ ...s, emailAlertsEnabled: v })} />
          </div>
          {s.emailAlertsEnabled && (
            <div className="grid gap-2 pl-7">
              <Label htmlFor="alertEmail">Email de notification</Label>
              <Input id="alertEmail" type="email" value={s.alertEmail}
                onChange={(e) => setS({ ...s, alertEmail: e.target.value })} placeholder="responsable@entreprise.cd" />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide">À propos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          INDUS-ERP · Gestion de stock industriel · Version 1.0
        </p>
      </section>
    </div>
  );
}
