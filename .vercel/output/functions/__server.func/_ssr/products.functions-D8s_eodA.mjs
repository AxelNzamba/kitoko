import { a as recordType, i as objectType, o as stringType, r as numberType } from "../_libs/zod.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwdutfJC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products.functions-D8s_eodA.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Vérifie que l'utilisateur authentifié possède au moins l'un des rôles requis.
* Utilise le client Supabase déjà scopé à l'utilisateur (via requireSupabaseAuth),
* donc respecte RLS et ne peut pas être détourné.
*
* Jette une Response 403 si non autorisé — TanStack la remonte proprement au client.
*/
async function requireRole(context, roles) {
	const { data, error } = await context.supabase.rpc("has_any_role", {
		_user_id: context.userId,
		_roles: roles
	});
	if (error) throw new Response(`RBAC check failed: ${error.message}`, { status: 500 });
	if (!data) throw new Response(`Forbidden: requires one of [${roles.join(", ")}]`, { status: 403 });
}
var productUpsertSchema = objectType({
	id: stringType().uuid().optional(),
	name: stringType().trim().min(1).max(255),
	sku: stringType().trim().max(50).optional().nullable(),
	category_id: stringType().uuid().optional().nullable(),
	purchase_price: numberType().min(0),
	sale_price: numberType().min(0),
	tva: numberType().min(0).max(100),
	stock_min: numberType().min(0),
	description: stringType().trim().max(1e3).optional().nullable(),
	photo_url: stringType().url().optional().nullable(),
	barcode: stringType().max(50).optional().nullable(),
	_client_id: stringType().uuid().optional().nullable(),
	_field_versions: recordType(stringType(), numberType()).optional()
});
/**
* Crée ou met à jour un produit.
* Autorisé : proprietaire, magasinier.
*/
var upsertProduct_createServerFn_handler = createServerRpc({
	id: "3b4a3c54812b4c0b1ed31ec62bbf2a64c77b8c36025f31e942058a97a061226e",
	name: "upsertProduct",
	filename: "src/lib/products.functions.ts"
}, (opts) => upsertProduct.__executeServer(opts));
var upsertProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => productUpsertSchema.parse(input)).handler(upsertProduct_createServerFn_handler, async ({ data, context }) => {
	await requireRole(context, ["proprietaire", "magasinier"]);
	const { error, data: row } = await context.supabase.from("products").upsert(data).select().single();
	if (error) throw new Response(error.message, { status: 400 });
	return row;
});
var deleteProduct_createServerFn_handler = createServerRpc({
	id: "154b8633eea94111b40f7036631572cb49e5f458d27dce468c3338ae0c0dc0db",
	name: "deleteProduct",
	filename: "src/lib/products.functions.ts"
}, (opts) => deleteProduct.__executeServer(opts));
var deleteProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ id: stringType().uuid() }).parse(input)).handler(deleteProduct_createServerFn_handler, async ({ data, context }) => {
	await requireRole(context, ["proprietaire"]);
	const { error } = await context.supabase.from("products").delete().eq("id", data.id);
	if (error) throw new Response(error.message, { status: 400 });
	return { ok: true };
});
var listProducts_createServerFn_handler = createServerRpc({
	id: "51ad93d03c52987e0e52d0164e41771f8765a8919d8a537367eaf795dff9b9d8",
	name: "listProducts",
	filename: "src/lib/products.functions.ts"
}, (opts) => listProducts.__executeServer(opts));
var listProducts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listProducts_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
	if (error) throw new Response(error.message, { status: 400 });
	return data ?? [];
});
//#endregion
export { deleteProduct_createServerFn_handler, listProducts_createServerFn_handler, upsertProduct_createServerFn_handler };
