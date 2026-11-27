import { test, expect, Page } from "@playwright/test";
import fs from "fs";

/**
 * RUN 3 — COMPLÉMENT DE L'AUDIT (après run 2 réussi jusqu'au scanner)
 * Les données de démo existent déjà (produit CMT-CPJ35, lot, mouvements, vente, dépense).
 * Ce run :
 * - reproduit le chemin inventaire → scanner avec diagnostic pageerror
 * - capture toutes les pages de consultation restantes
 * - teste la déconnexion
 * Les résultats sont écrits progressivement (rien ne se perd en cas de timeout).
 */

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1600, height: 900 } });

const CRED = { email: "admin@brightservices.cg", password: "Bright2026!" };
const CAP = "captures_e2e";
const pageErrors: string[] = [];

async function shot(page: Page, name: string, fullPage = false) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${CAP}/${name}.png`, fullPage });
}

function append(key: string, value: string) {
  const p = `${CAP}/audit_results.json`;
  let data: any = {};
  try { data = JSON.parse(fs.readFileSync(p, "utf8")); } catch { /* nouveau fichier */ }
  data.results = data.results ?? {};
  data.results[key] = value;
  if (pageErrors.length) data.pageErrors = pageErrors;
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function watch(page: Page) {
  page.on("pageerror", (err) => pageErrors.push(`${page.url()} :: ${String(err).slice(0, 400)}`));
}

async function loginRetry(page: Page) {
  await page.goto("/auth");
  await page.waitForTimeout(2000);
  for (let essai = 1; essai <= 3; essai++) {
    await page.fill("#login-email", CRED.email);
    await page.fill("#login-password", CRED.password);
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      return;
    } catch {
      if (essai < 3) { await page.goto("/auth"); await page.waitForTimeout(3000); }
    }
  }
  throw new Error("Connexion impossible après 3 essais");
}

test("A — Chemin inventaire → scanner avec diagnostic", async ({ page }) => {
  test.setTimeout(300_000);
  watch(page);
  page.on("dialog", (d) => d.accept());

  await loginRetry(page);
  append("auth: connexion (run3)", "✅");

  // inventaire : ouvrir la session ouverte (recréée par run 2) puis en sortir
  await page.goto("/inventaire");
  await page.waitForTimeout(2000);
  const ouvrir = page.getByRole("button", { name: "Ouvrir" }).first();
  if (await ouvrir.isVisible().catch(() => false)) {
    await ouvrir.click();
    await page.waitForTimeout(2000);
    await shot(page, "11c_session_active");
    append("inventaire: ouverture session", "✅");
    // sortir de la session via "← Retour"
    const retour = page.getByText("← Retour");
    if (await retour.isVisible().catch(() => false)) {
      await retour.click();
      await page.waitForTimeout(1000);
    }
  }

  // scanner — le crash attendu apparaît ici ; pageerror sera capturé
  await page.goto("/scanner");
  await page.waitForTimeout(3000);
  const h1 = await page.locator("h1").first().textContent().catch(() => "CRASH");
  append("scanner: après inventaire", h1 === "Scanner QR" ? "✅ page OK" : `❌ crash: ${h1}`);
  await shot(page, "12_scanner");
  if (h1 === "Scanner QR") {
    await page.getByPlaceholder(/PRD-XXXXXX/).fill("CMT-CPJ35");
    await page.getByRole("button", { name: "Rechercher", exact: true }).click();
    await page.waitForTimeout(2500);
    const found = (await page.getByText(/Ciment CPJ 35/).count()) > 0;
    append("scanner: recherche SKU", found ? "✅" : "⚠️ produit non affiché");
    await shot(page, "12b_scanner_resultat");
  } else {
    append("scanner: pageerror", pageErrors.join(" | ") || "aucune exception capturée");
    await shot(page, "12_scanner_crash");
  }
});

test("B — Pages de consultation restantes", async ({ page }) => {
  test.setTimeout(300_000);
  watch(page);
  page.on("dialog", (d) => d.accept());

  await loginRetry(page);

  const pages: Array<[string, string, boolean?]> = [
    ["/dashboard", "01_dashboard", true],
    ["/historique-produit", "13_historique_produit"],
    ["/emplacements", "14_emplacements"],
    ["/certificats", "15_certificats"],
    ["/commandes-fournisseurs", "16_commandes_fournisseurs"],
    ["/transferts", "17_transferts"],
    ["/terrain", "18_mode_terrain"],
    ["/achats", "19_achats"],
    ["/retours-fournisseurs", "20_retours_fournisseurs"],
    ["/avoirs", "21_avoirs"],
    ["/sav", "22_sav"],
    ["/rapports", "23_rapports", true],
    ["/utilisateurs", "24_utilisateurs"],
    ["/parametres", "25_parametres"],
    ["/synchronisation", "26_synchronisation"],
  ];
  for (const [route, name, full] of pages) {
    try {
      await page.goto(route);
      await page.waitForTimeout(2200);
      const h1 = await page.locator("h1, h2").first().textContent().catch(() => "?");
      await page.screenshot({ path: `${CAP}/${name}.png`, fullPage: !!full });
      append(`page ${route}`, h1 && h1 !== "?" && !h1.includes("Erreur") ? `✅ (${h1.trim().slice(0, 40)})` : `❌ (${(h1 ?? "").trim().slice(0, 40)})`);
    } catch (e) {
      append(`page ${route}`, `❌ ${String(e).slice(0, 120)}`);
    }
  }
});

test("C — Déconnexion", async ({ page }) => {
  test.setTimeout(120_000);
  watch(page);
  await loginRetry(page);
  await page.goto("/dashboard");
  await page.waitForTimeout(1500);
  const logout = page.locator("button, a").filter({ has: page.locator("svg.lucide-log-out") }).first();
  await logout.click();
  await page.waitForURL("**/auth", { timeout: 15000 });
  append("auth: déconnexion", "✅");
  await shot(page, "99_logout");
  append("résumé pageErrors", String(pageErrors.length));
});
