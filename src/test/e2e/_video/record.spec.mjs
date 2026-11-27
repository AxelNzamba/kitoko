// Enregistreur d'étapes — même scénario que l'audit, captures 1600×900.
import { chromium } from "@playwright/test";
import fs from "fs";

const BASE = "http://localhost:8080";
const CAPS = "C:/BrightServices_build/pres_kit/video/steps";
fs.mkdirSync(CAPS, { recursive: true });

const shot = (page, name) =>
  page.screenshot({ path: `${CAPS}/${name}.png` });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const page = await ctx.newPage();

await page.goto(BASE + "/auth");
await page.waitForTimeout(2500);

// c1 — connexion
await shot(page, "c1_login");
await page.fill("#login-email", "admin@brightservices.cg");
await page.fill("#login-password", "Bright2026!");
await shot(page, "c1_filled");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard", { timeout: 30000 });
await page.waitForTimeout(2500);
await shot(page, "c1_dashboard");

// c2 — dashboard + recherche globale
await shot(page, "c2_dash");
await page.keyboard.press("Control+k");
await page.waitForTimeout(800);
await page.keyboard.type("ciment");
await page.waitForTimeout(1100);
await shot(page, "c2_search");
await page.keyboard.press("Escape");

// c3 — produits
await page.goto(BASE + "/produits");
await page.waitForTimeout(2500);
await shot(page, "c3_list");
await page.getByRole("button", { name: /Nouveau produit/ }).click();
await page.waitForTimeout(700);
await page.fill("#name", "Fer à béton HA 12");
await page.fill("#sku", "FER-HA12");
await page.fill("#purchase_price", "4500");
await page.fill("#sale_price", "5800");
await page.fill("#tva", "16");
await page.fill("#stock_min", "50");
await page.fill("#description", "Barre HA 12 — 12 mètres");
await page.waitForTimeout(400);
await shot(page, "c3_form");
await page.getByRole("dialog").getByRole("button", { name: "Créer" }).click();
await page.waitForTimeout(2500);
await shot(page, "c3_saved");

// c4 — stock
await page.goto(BASE + "/stock");
await page.waitForTimeout(2500);
await shot(page, "c4_hist");
await page.getByRole("button", { name: /Entrée/ }).click();
await page.waitForTimeout(700);
let dlg = page.getByRole("dialog");
await dlg.getByRole("combobox").first().click();
await page.getByRole("option", { name: /Ciment CPJ 35/ }).click();
await dlg.locator('input[type="number"]').first().fill("200");
await dlg.locator("input").nth(2).fill("Réception camion — approvisionnement");
await shot(page, "c4_entree_form");
await dlg.getByRole("button", { name: "Enregistrer" }).click();
await page.waitForTimeout(2200);
await shot(page, "c4_entree_ok");

await page.getByRole("button", { name: /Sortie/ }).click();
await page.waitForTimeout(700);
dlg = page.getByRole("dialog");
await dlg.getByRole("combobox").first().click();
await page.getByRole("option", { name: /Fer à béton HA 12/ }).click();
await dlg.locator('input[type="number"]').first().fill("25");
await dlg.locator("input").nth(2).fill("Chantier Lordson Congo");
await shot(page, "c4_sortie_form");
await dlg.getByRole("button", { name: "Enregistrer" }).click();
await page.waitForTimeout(2200);
await shot(page, "c4_sortie_ok");

// c5 — POS
await page.goto(BASE + "/ventes");
await page.waitForTimeout(2500);
await shot(page, "c5_pos");
await page.getByPlaceholder(/Rechercher un produit/).fill("fer");
await page.waitForTimeout(900);
await page.getByRole("button", { name: /Fer à béton HA 12/ }).first().click();
await page.waitForTimeout(600);
await shot(page, "c5_cart");
try {
  const dl = await Promise.race([
    (async () => {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 15000 }),
        page.getByRole("button", { name: /Valider/ }).click(),
      ]);
      await download.saveAs(`${CAPS}/c5_invoice.pdf`);
      return true;
    })(),
    new Promise((r) => setTimeout(() => r(false), 18000)),
  ]);
  console.log("facture:", dl ? "PDF capturé" : "non interceptée");
} catch {
  console.log("facture: exception — suite");
}
await page.waitForTimeout(2500);
await shot(page, "c5_invoice");

// c6 — inventaire + scanner
await page.goto(BASE + "/inventaire");
await page.waitForTimeout(2200);
await shot(page, "c6_inv");
await page.goto(BASE + "/scanner");
await page.waitForTimeout(2500);
await page.getByPlaceholder(/PRD-XXXXXX/).fill("CMT-CPJ35");
await page.getByRole("button", { name: "Rechercher", exact: true }).click();
await page.waitForTimeout(2500);
await shot(page, "c6_scan");

// c7 — rapports + utilisateurs
await page.goto(BASE + "/rapports");
await page.waitForTimeout(2500);
await shot(page, "c7_rapports");
await page.goto(BASE + "/utilisateurs");
await page.waitForTimeout(2500);
await shot(page, "c7_users");

await browser.close();
console.log("ÉTAPES CAPTURÉES :", fs.readdirSync(CAPS).filter((f) => f.endsWith(".png")).length);
