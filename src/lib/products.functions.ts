import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireRole } from "@/lib/rbac.server";

const productUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(255),
  sku: z.string().trim().max(50).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  purchase_price: z.number().min(0),
  sale_price: z.number().min(0),
  tva: z.number().min(0).max(100),
  stock_min: z.number().min(0),
  description: z.string().trim().max(1000).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  _client_id: z.string().uuid().optional().nullable(),
  _field_versions: z.record(z.string(), z.number()).optional(),
});

/**
 * Crée ou met à jour un produit.
 * Autorisé : proprietaire, magasinier.
 */
export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productUpsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireRole(context, ["proprietaire", "magasinier"]);

    const { error, data: row } = await context.supabase
      .from("products")
      .upsert(data as never)
      .select()
      .single();


    if (error) throw new Response(error.message, { status: 400 });
    return row;
  });

/**
 * Supprime un produit.
 * Autorisé : proprietaire uniquement.
 */
export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireRole(context, ["proprietaire"]);

    const { error } = await context.supabase
      .from("products")
      .delete()
      .eq("id", data.id);

    if (error) throw new Response(error.message, { status: 400 });
    return { ok: true };
  });

/**
 * Liste tous les produits accessibles à l'utilisateur (RLS s'applique).
 * Autorisé : tous les rôles authentifiés.
 */
export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });

    if (error) throw new Response(error.message, { status: 400 });
    return data ?? [];
  });
