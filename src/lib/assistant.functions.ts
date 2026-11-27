import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireRole } from "@/lib/rbac.server";

const inputSchema = z.object({ question: z.string().trim().min(2).max(1000) });

/** Assistant de gestion : répond à partir d'un résumé des données réelles (stock, ventes 30 j, crédits). */
export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireRole(context, ["proprietaire", "magasinier", "caissier"]);
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Assistant non configuré");
    const sb = context.supabase;
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

    const [products, stock, items, debts] = await Promise.all([
      sb.from("products").select("id, name, sku, sale_price, purchase_price, stock_min").eq("_deleted", false).limit(300),
      sb.from("lot_stock").select("product_id, current_quantity").limit(2000),
      sb.from("sale_items").select("product_id, quantity, unit_price, sales!inner(created_at)").gte("sales.created_at", since).eq("_deleted", false).limit(5000),
      sb.from("client_debts").select("amount, due_date, clients:client_id(name), debt_payments(amount)").limit(500),
    ]);

    const stockBy = new Map<string, number>();
    for (const s of (stock.data ?? []) as any[]) stockBy.set(s.product_id, (stockBy.get(s.product_id) ?? 0) + Number(s.current_quantity ?? 0));
    const soldBy = new Map<string, { qty: number; ca: number }>();
    for (const i of (items.data ?? []) as any[]) {
      const cur = soldBy.get(i.product_id) ?? { qty: 0, ca: 0 };
      cur.qty += Number(i.quantity); cur.ca += Number(i.quantity) * Number(i.unit_price ?? 0);
      soldBy.set(i.product_id, cur);
    }
    const lines = ((products.data ?? []) as any[]).map((p) => {
      const st = stockBy.get(p.id) ?? 0; const s = soldBy.get(p.id) ?? { qty: 0, ca: 0 };
      const perDay = s.qty / 30; const days = perDay > 0 ? Math.floor(st / perDay) : null;
      return `${p.name} (${p.sku ?? "-"}) | stock ${st} | min ${p.stock_min} | vendus 30j ${s.qty} | CA 30j ${Math.round(s.ca)} | rupture dans ${days ?? "∞"} j | prix ${p.sale_price} | achat ${p.purchase_price}`;
    });
    const debtLines = ((debts.data ?? []) as any[]).map((d) => {
      const paid = (d.debt_payments ?? []).reduce((a: number, x: any) => a + Number(x.amount), 0);
      return `${d.clients?.name ?? "?"} | reste ${Number(d.amount) - paid} | échéance ${d.due_date}`;
    }).filter((l) => !l.includes("reste 0 "));

    const instructions = `Tu es l'assistant de gestion d'un dépôt/boutique en RDC. Réponds en français simple, court, concret, en texte brut sans markdown (pas d’astérisques), montants en F, avec des chiffres tirés UNIQUEMENT des données ci-dessous. Si une info manque, dis-le. Pour les commandes, propose une quantité couvrant 30 jours de ventes moins le stock. Date du jour : ${new Date().toISOString().slice(0, 10)}.

PRODUITS (nom | stock | stock minimum | ventes 30 j | chiffre d'affaires 30 j | jours avant rupture | prix vente | prix achat) :
${lines.join("\n") || "aucun"}

CRÉDITS CLIENTS OUVERTS :
${debtLines.join("\n") || "aucun"}`;

    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: instructions,
      messages: [{ role: "user", content: data.question }],
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
    });
    try {
      const text = await result.text;
      if (!text.trim()) return { answer: "L'assistant n'a pas pu répondre à cette question." };
      return { answer: text };
    } catch (e: any) {
      const status = e?.statusCode ?? e?.status;
      if (status === 429) return { answer: "Trop de questions en même temps, réessayez dans une minute." };
      if (status === 402 || status === 403) return { answer: "Le crédit de l'assistant est épuisé ou bloqué pour cet espace de travail." };
      throw new Error("L'assistant est momentanément indisponible.");
    }
  });
