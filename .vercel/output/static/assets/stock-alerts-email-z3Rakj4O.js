var e={}.ALERT_EMAIL_FROM??`alertes@entreprise.cd`;async function t(t,n){let r={}.RESEND_API_KEY;if(!r||r===`re_xxxxxxxx`){console.warn(`[stock-alerts-email] RESEND_API_KEY non configurée — email non envoyé`);return}if(!n.length)return;let i=n.filter(e=>e.status===`rupture`),a=n.filter(e=>e.status===`faible`),o=n.length===1?`🔴 Alerte stock : ${n[0].product_name}`:`🔔 ${n.length} alertes stock détectées`,s=`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #d94c3d;">🚨 Alertes Stock — INDUS-ERP</h2>
  <p>Bonjour,</p>
  <p>Les produits suivants ont un stock inférieur au seuil minimum :</p>

  ${i.length>0?`
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
        ${i.map(e=>`
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 8px; font-size: 14px;">${e.product_name}</td>
            <td style="padding: 8px; font-family: monospace; font-size: 12px;">${e.sku}</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; color: #d94c3d;">${e.current_stock}</td>
            <td style="padding: 8px; text-align: right;">${e.stock_min}</td>
          </tr>
        `).join(``)}
      </tbody>
    </table>
  `:``}

  ${a.length>0?`
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
        ${a.map(e=>`
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 8px; font-size: 14px;">${e.product_name}</td>
            <td style="padding: 8px; font-family: monospace; font-size: 12px;">${e.sku}</td>
            <td style="padding: 8px; text-align: right; color: #b8860b;">${e.current_stock}</td>
            <td style="padding: 8px; text-align: right;">${e.stock_min}</td>
          </tr>
        `).join(``)}
      </tbody>
    </table>
  `:``}

  <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
    Cet email a été envoyé automatiquement par INDUS-ERP.<br>
    Connectez-vous à l'application pour gérer vos produits.
  </p>
</body>
</html>`;try{let i=await fetch(`https://api.resend.com/emails`,{method:`POST`,headers:{Authorization:`Bearer ${r}`,"Content-Type":`application/json`},body:JSON.stringify({from:e,to:t,subject:o,html:s})});if(i.ok)console.log(`[stock-alerts-email] Email envoyé à ${t} (${n.length} alertes)`);else{let e=await i.text();console.error(`[stock-alerts-email] Erreur Resend:`,e)}}catch(e){console.error(`[stock-alerts-email] Échec envoi email:`,e)}}export{t as sendStockAlertEmail};