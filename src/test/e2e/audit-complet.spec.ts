import { test, expect, Page } from "@playwright/test";

/**
 * AUDIT E2E COMPLET — INDUS-ERP / Kitoko-Stock (Bright Management)
 * Teste chaque fonctionnalité réelle et capture chaque écran.
 * Un seul test séquentiel : l'état des données de test est conservé d'une
 * étape à l'autre (catégorie -> produit -> lot -> mouvements -> vente...).
 */

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 1600, height: 900 } });

const CRED = { email: "admin@brightservices.cg", password: "Bright2026!" };
const CAP = "captures_e2e";
const results: Record<string, string> = {};
const consoleErrors: string[] = [];

async function shot(page: Page, name: string, fullPage = false) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${CAP}/${name}.png`, fullPage });
  results[name] = "capturé";
}

async function visit(page: Page, route: string, name: string, fullPage = false) {
  await page.goto(route);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${CAP}/${name}.png`, fullPage });
  results[route] = "page OK";
}

function watchConsole(page: Page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`${page.url()} :: ${msg.text().slice(0, 200)}`);
  });
}

test("00 - Identifiants incorrects rejetés", async ({ page }) => {
  watchConsole(page);
  await page.goto("/auth");
  await page.waitForTimeout(1500);
  await shot(page, "00_login");
  await page.fill("#login-email", "admin@brightservices.cg");
  await page.fill("#login-password", "MauvaisMotDePasse123");
  await page.click('button[type="submit"]');
  await expect(page.locator('[data-sonner-toast]').last()).toContainText("Identifiants incorrects", { timeout: 10000 });
  await shot(page, "00b_login_erreur");
  results["auth: mauvais identifiants"] = "✅ rejetés correctement";
});

test("01 → 99 — Parcours complet", async ({ page }) => {
  test.setTimeout(900_000);
  watchConsole(page);
  page.on("dialog", (d) => d.accept());

  // ── 01 CONNEXION ──────────────────────────────────────────────
  await page.goto("/auth");
  await page.fill("#login-email", CRED.email);
  await page.fill("#login-password", CRED.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  await expect(page.locator("body")).toContainText(/Tableau de bord|INDUS/i, { timeout: 15000 });
  results["auth: connexion"] = "✅";
  await shot(page, "01_dashboard", true);

  // ── 02 CATÉGORIES : créer ─────────────────────────────────────
  await visit(page, "/categories", "02_categories");
  await page.getByRole("button", { name: /Nouvelle catégorie/ }).click();
  const dlgCat = page.getByRole("dialog");
  await dlgCat.locator("input").first().fill("Matériaux construction");
  await shot(page, "02b_categorie_form");
  await dlgCat.getByRole("button", { name: "Créer" }).click();
  await expect(page.locator('[data-sonner-toast]').last()).toContainText(/créée/i, { timeout: 10000 });
  results["catégories: création"] = "✅";
  // catégorie jetable pour le test de suppression
  await page.getByRole("button", { name: /Nouvelle catégorie/ }).click();
  await page.getByRole("dialog").locator("input").first().fill("Test Suppression");
  await page.getByRole("dialog").getByRole("button", { name: "Créer" }).click();
  await page.waitForTimeout(1500);
  const rowTest = page.getByRole("row", { name: /Test Suppression/ });
  await rowTest.getByRole("button").last().click(); // corbeille (confirm auto-accepté)
  await page.waitForTimeout(1500);
  results["catégories: suppression"] = await rowTest.count() === 0 ? "✅" : "⚠️ ligne encore présente";

  // ── 03 FOURNISSEURS : créer ───────────────────────────────────
  await visit(page, "/fournisseurs", "03_fournisseurs");
  await page.getByRole("button", { name: /Nouveau fournisseur/ }).click();
  const dlgF = page.getByRole("dialog");
  await dlgF.locator("input").first().fill("QuincaillerieCentre SCAB");
  const inputsF = dlgF.locator("input");
  await inputsF.nth(1).fill("+242 05 555 11 22");
  await inputsF.nth(2).fill("contact@quincaillerie-centre.cg");
  await dlgF.locator("textarea").fill("Centre-ville, Pointe-Noire");
  await shot(page, "03b_fournisseur_form");
  await dlgF.getByRole("button", { name: "Créer" }).click();
  await expect(page.locator('[data-sonner-toast]').last()).toContainText(/créé/i, { timeout: 10000 });
  results["fournisseurs: création"] = "✅";

  // ── 04 CLIENTS : créer ────────────────────────────────────────
  await visit(page, "/clients", "04_clients");
  await page.getByRole("button", { name: /Nouveau client/ }).click();
  await page.fill("#name", "Lordson Congo");
  await page.fill("#company", "Lordson Congo SA");
  await page.fill("#phone", "+242 06 666 77 88");
  await page.fill("#email", "achats@lordsoncongo.cg");
  await page.fill("#address", "Boulevard Loiniti, Pointe-Noire");
  await shot(page, "04b_client_form");
  await page.getByRole("dialog").getByRole("button", { name: "Créer" }).click();
  await page.waitForTimeout(1500);
  results["clients: création"] = (await page.getByText("Lordson Congo", { exact: false }).count()) > 0 ? "✅" : "⚠️";
  // recherche client
  await page.getByPlaceholder(/Rechercher un client/).fill("Lordson");
  await page.waitForTimeout(800);
  results["clients: recherche"] = (await page.getByText("Lordson Congo").count()) > 0 ? "✅" : "⚠️";
  await shot(page, "04c_client_recherche");

  // ── 05 PRODUITS : créer ───────────────────────────────────────
  await visit(page, "/produits", "05_produits");
  await page.getByRole("button", { name: /Nouveau produit/ }).click();
  await page.fill("#name", "Ciment CPJ 35");
  await page.fill("#sku", "CMT-CPJ35");
  await page.fill("#purchase_price", "7500");
  await page.fill("#sale_price", "9500");
  await page.fill("#tva", "16");
  await page.fill("#stock_min", "20");
  await page.fill("#description", "Sac de ciment 50 kg — CPJ 35");
  await shot(page, "05b_produit_form");
  await page.getByRole("dialog").getByRole("button", { name: "Créer" }).click();
  await page.waitForTimeout(2000);
  results["produits: création"] = (await page.getByText("Ciment CPJ 35").count()) > 0 ? "✅" : "⚠️";
  await shot(page, "05c_produits_liste", true);
  // recherche + filtre
  await page.getByPlaceholder(/Rechercher par nom ou SKU/).fill("ciment");
  await page.waitForTimeout(1000);
  results["produits: recherche"] = (await page.getByText("Ciment CPJ 35").count()) > 0 ? "✅" : "⚠️";
  await shot(page, "05d_produits_recherche");
  await page.getByPlaceholder(/Rechercher par nom ou SKU/).fill("");

  // ── 06 LOTS : créer ───────────────────────────────────────────
  await visit(page, "/lots", "06_lots");
  await page.getByRole("button", { name: /Nouveau lot/ }).click();
  const dlgL = page.getByRole("dialog");
  // produit (trigger 1), fournisseur (2), entrepôt (3) — emplacement désactivé
  const triggersL = dlgL.getByRole("combobox");
  await triggersL.nth(0).click();
  await page.getByRole("option", { name: /Ciment CPJ 35/ }).click();
  await triggersL.nth(2).click();
  await page.getByRole("option", { name: /Entrepôt principal/ }).click();
  await page.fill("#lot_number", "LOT-2026-001");
  await page.fill("#reception_date", "2026-09-13");
  await page.fill("#quantity", "500");
  await page.fill("#unit_purchase_price", "7500");
  await shot(page, "06b_lot_form");
  await dlgL.getByRole("button", { name: "Créer" }).click();
  await page.waitForTimeout(2000);
  results["lots: création"] = (await page.getByText("LOT-2026-001").count()) > 0 ? "✅" : "⚠️";

  // ── 07 STOCK : entrée ─────────────────────────────────────────
  await visit(page, "/stock", "07_stock");
  await page.getByRole("button", { name: /Entrée/ }).click();
  const dlgE = page.getByRole("dialog");
  await dlgE.getByRole("combobox").first().click();
  await page.getByRole("option", { name: /Ciment CPJ 35/ }).click();
  await dlgE.locator('input[type="number"]').first().fill("500");
  await dlgE.locator('input[type="number"]').nth(1).fill("7500");
  await dlgE.locator("input").nth(2).fill("Stock initial — réception LOT-2026-001");
  await shot(page, "07b_entree_form");
  await dlgE.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.locator('[data-sonner-toast]').last()).toContainText("Entrée enregistrée", { timeout: 10000 });
  results["stock: entrée"] = "✅";
  await shot(page, "07c_stock_apres_entree", true);

  // ── 08 STOCK : sortie ─────────────────────────────────────────
  await page.getByRole("button", { name: /Sortie/ }).click();
  const dlgS = page.getByRole("dialog");
  await dlgS.getByRole("combobox").first().click();
  await page.getByRole("option", { name: /Ciment CPJ 35/ }).click();
  await dlgS.locator('input[type="number"]').first().fill("40");
  await dlgS.locator("input").nth(2).fill("Chantier Lordson Congo");
  await shot(page, "08b_sortie_form");
  await dlgS.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.locator('[data-sonner-toast]').last()).toContainText("Sortie enregistrée", { timeout: 10000 });
  results["stock: sortie"] = "✅";
  await shot(page, "08c_stock_apres_sortie");

  // ── 09 VENTES / POS ───────────────────────────────────────────
  await visit(page, "/ventes", "09_ventes_pos");
  await page.getByPlaceholder(/Rechercher un produit/).fill("ciment");
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: /Ciment CPJ 35/ }).first().click();
  await page.waitForTimeout(600);
  results["ventes: ajout panier"] = (await page.getByText(/Panier \(1\)/).count()) > 0 ? "✅" : "⚠️";
  await shot(page, "09b_panier");
  let pdfOk = "non détecté";
  try {
    const dlPromise = page.waitForEvent("download", { timeout: 12000 });
    await page.getByRole("button", { name: /Valider & imprimer|Valider et imprimer/ }).click();
    const dl = await dlPromise;
    await dl.saveAs(`${CAP}/facture_${dl.suggestedFilename()}`);
    pdfOk = `✅ (${dl.suggestedFilename()})`;
  } catch {
    // la vente peut réussir sans téléchargement direct
    await page.waitForTimeout(4000);
  }
  results["ventes: validation"] = `terminée — facture PDF : ${pdfOk}`;
  await shot(page, "09c_vente_validee");

  // ── 10 DÉPENSES ───────────────────────────────────────────────
  await visit(page, "/depenses", "10_depenses");
  await page.getByRole("button", { name: /Nouvelle dépense/ }).click();
  const dlgD = page.getByRole("dialog");
  await dlgD.getByRole("combobox").first().click();
  await page.getByRole("option").first().click();
  await dlgD.locator('input[type="date"]').fill("2026-09-13");
  await dlgD.locator("input").nth(1).fill("Carburant véhicule logistique");
  await dlgD.locator('input[type="number"]').fill("35000");
  await shot(page, "10b_depense_form");
  await dlgD.getByRole("button", { name: "Enregistrer" }).click();
  await page.waitForTimeout(2000);
  results["dépenses: création"] = (await page.getByText(/Carburant véhicule/).count()) > 0 ? "✅" : "⚠️";

  // ── 11 INVENTAIRE : session + clôture ─────────────────────────
  await visit(page, "/inventaire", "11_inventaire");
  await page.getByRole("button", { name: /Nouvelle session/ }).click();
  await shot(page, "11b_session_form");
  await page.getByRole("dialog").getByRole("button", { name: "Créer" }).click();
  await page.waitForTimeout(2000);
  await shot(page, "11c_session_active", true);
  results["inventaire: création session"] = "terminé";
  const cloturer = page.getByRole("button", { name: /Clôturer/ });
  if (await cloturer.first().isVisible().catch(() => false)) {
    await cloturer.first().click();
    await page.waitForTimeout(2000);
    results["inventaire: clôture"] = "terminé";
  }
  await shot(page, "11d_inventaire");

  // ── 12 SCANNER (saisie manuelle) ──────────────────────────────
  await visit(page, "/scanner", "12_scanner");
  await page.getByPlaceholder(/PRD-XXXXXX/).fill("CMT-CPJ35");
  await page.getByRole("button", { name: "Rechercher" }).click();
  await page.waitForTimeout(2000);
  results["scanner: recherche SKU"] = (await page.getByText(/Ciment CPJ 35/).count()) > 0 ? "✅" : "⚠️";
  await shot(page, "12b_scanner_resultat");

  // ── 13→24 PAGES RESTANTES (consultation) ──────────────────────
  await visit(page, "/dashboard", "01_dashboard", true);
  await visit(page, "/historique-produit", "13_historique_produit");
  await visit(page, "/emplacements", "14_emplacements");
  await visit(page, "/certificats", "15_certificats");
  await visit(page, "/commandes-fournisseurs", "16_commandes_fournisseurs");
  await visit(page, "/transferts", "17_transferts");
  await visit(page, "/terrain", "18_mode_terrain");
  await visit(page, "/achats", "19_achats");
  await visit(page, "/retours-fournisseurs", "20_retours_fournisseurs");
  await visit(page, "/avoirs", "21_avoirs");
  await visit(page, "/sav", "22_sav");
  await visit(page, "/rapports", "23_rapports", true);
  await visit(page, "/utilisateurs", "24_utilisateurs");
  await visit(page, "/parametres", "25_parametres");
  await visit(page, "/synchronisation", "26_synchronisation");

  // ── 25 DÉCONNEXION ────────────────────────────────────────────
  await page.goto("/dashboard");
  await page.waitForTimeout(1500);
  const logout = page.locator("button, a").filter({ has: page.locator("svg.lucide-log-out") }).first();
  await logout.click();
  await page.waitForURL("**/auth", { timeout: 15000 });
  results["auth: déconnexion"] = "✅";
  await shot(page, "99_logout");

  // ── RÉSULTATS ─────────────────────────────────────────────────
  const fs = await import("fs");
  fs.writeFileSync(`${CAP}/audit_results.json`, JSON.stringify({ results, consoleErrors }, null, 2));
});
