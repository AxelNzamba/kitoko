//#region node_modules/.nitro/vite/services/ssr/assets/stock-alerts-email-kdUoaXGC.js
/**
* Email notifications pour les alertes stock.
* Nécessite une clé API Resend (ou autre service SMTP) configurée
* dans les variables d'environnement.
*
* Configuration requise :
*   RESEND_API_KEY=re_xxx
*   ALERT_EMAIL_FROM=alertes@entreprise.cd
*
* Utilisation côté serveur uniquement.
*/
var ALERT_EMAIL_FROM = process.env.ALERT_EMAIL_FROM ?? "alertes@entreprise.cd";
/**
* Envoie un email d'alerte via Resend.
* Silencieux si la clé API n'est pas configurée.
*/
async function sendStockAlertEmail(to, alerts) {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey || apiKey === "re_xxxxxxxx") {
		console.warn("[stock-alerts-email] RESEND_API_KEY non configurée — email non envoyé");
		return;
	}
	if (!alerts.length) return;
	const rupture = alerts.filter((a) => a.status === "rupture");
	const faible = alerts.filter((a) => a.status === "faible");
	const subject = alerts.length === 1 ? `🔴 Alerte stock : ${alerts[0].product_name}` : `🔔 ${alerts.length} alertes stock détectées`;
	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #d94c3d;">🚨 Alertes Stock — INDUS-ERP</h2>
  <p>Bonjour,</p>
  <p>Les produits suivants ont un stock inférieur au seuil minimum :</p>

  ${rupture.length > 0 ? `
    <h3 style="color: #d94c3d;">🔴 Rupture de stock</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px; text-align: left; font-size: 12px;">Produit</th>
          <th style="padding: 8px; text-align: left; font-size: 12px;">SKU</th>
          <th style="padding: 8px; text-align: right; font-size: 12px;">Stock</th>
          <th style="padding: 8px; text-align: right; font-size: 12px;">Seuil</th>
        </tr>
      </thead>
      <tbody>
        ${rupture.map((a) => `
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 8px; font-size: 14px;">${a.product_name}</td>
            <td style="padding: 8px; font-family: monospace; font-size: 12px;">${a.sku}</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; color: #d94c3d;">${a.current_stock}</td>
            <td style="padding: 8px; text-align: right;">${a.stock_min}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : ""}

  ${faible.length > 0 ? `
    <h3 style="color: #b8860b;">🟡 Stock faible</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px; text-align: left; font-size: 12px;">Produit</th>
          <th style="padding: 8px; text-align: left; font-size: 12px;">SKU</th>
          <th style="padding: 8px; text-align: right; font-size: 12px;">Stock</th>
          <th style="padding: 8px; text-align: right; font-size: 12px;">Seuil</th>
        </tr>
      </thead>
      <tbody>
        ${faible.map((a) => `
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 8px; font-size: 14px;">${a.product_name}</td>
            <td style="padding: 8px; font-family: monospace; font-size: 12px;">${a.sku}</td>
            <td style="padding: 8px; text-align: right; color: #b8860b;">${a.current_stock}</td>
            <td style="padding: 8px; text-align: right;">${a.stock_min}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : ""}

  <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
    Cet email a été envoyé automatiquement par INDUS-ERP.<br>
    Connectez-vous à l'application pour gérer vos produits.
  </p>
</body>
</html>`;
	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				from: ALERT_EMAIL_FROM,
				to,
				subject,
				html
			})
		});
		if (!res.ok) {
			const err = await res.text();
			console.error("[stock-alerts-email] Erreur Resend:", err);
		} else console.log(`[stock-alerts-email] Email envoyé à ${to} (${alerts.length} alertes)`);
	} catch (e) {
		console.error("[stock-alerts-email] Échec envoi email:", e);
	}
}
//#endregion
export { sendStockAlertEmail };
