import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { B as Pencil, F as QrCode, H as Package, I as Printer, L as Plus, O as Search, h as Trash2, t as X, ut as FileDown, x as SlidersHorizontal } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { a as generateSKU, i as generateBarcode, r as formatXOF } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { k as isRedirect, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as recordType, i as objectType, n as literalType, o as stringType, r as numberType, t as coerce } from "../_libs/zod.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CmIv1W53.mjs";
import { t as exportToCsv } from "./csv-bEMY3y7g.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwdutfJC.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver--vXzdH4c.mjs";
import { n as useViewMode, r as viewGridClass, t as ViewModeToggle } from "./view-mode-toggle-CMF486cj.mjs";
import { t as QRCodeSVG } from "../_libs/qrcode.react.mjs";
import { t as require_JsBarcode } from "../_libs/jsbarcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/produits-OiLtV682.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_JsBarcode = /* @__PURE__ */ __toESM(require_JsBarcode());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
var upsertProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => productUpsertSchema.parse(input)).handler(createSsrRpc("3b4a3c54812b4c0b1ed31ec62bbf2a64c77b8c36025f31e942058a97a061226e"));
/**
* Supprime un produit.
* Autorisé : proprietaire uniquement.
*/
var deleteProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ id: stringType().uuid() }).parse(input)).handler(createSsrRpc("154b8633eea94111b40f7036631572cb49e5f458d27dce468c3338ae0c0dc0db"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("51ad93d03c52987e0e52d0164e41771f8765a8919d8a537367eaf795dff9b9d8"));
/**
* Compresse une image côté client avant upload.
*
* Redimensionne et convertit en WebP pour réduire la taille,
* améliorer les performances de chargement et économiser
* de l'espace de stockage.
*
* @param file - Le fichier image d'origine
* @param maxWidth - Largeur maximale en pixels (défaut: 1200)
* @param quality - Qualité WebP (0-1, défaut: 0.82)
* @returns Un Promise<File> de l'image compressée au format WebP
*
* @example
* ```tsx
* const compressed = await compressImage(photoFile, 800, 0.8);
* // Utiliser compressed pour l'upload Supabase
* ```
*/
async function compressImage(file, maxWidth = 1200, quality = .82) {
	if (!file.type.startsWith("image/")) return file;
	const bitmap = await createImageBitmap(file);
	let { width, height } = bitmap;
	if (width > maxWidth) {
		height = Math.round(height * maxWidth / width);
		width = maxWidth;
	}
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		bitmap.close();
		return file;
	}
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();
	const blob = await new Promise((resolve) => {
		canvas.toBlob((b) => resolve(b), "image/webp", quality);
	});
	if (!blob) return file;
	const fileName = file.name.replace(/\.[^.]+$/, "") + ".webp";
	return new File([blob], fileName, { type: "image/webp" });
}
function QrPreview({ value, size = 128 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
		value,
		size,
		level: "M",
		includeMargin: true
	});
}
function BarcodePreview({ value, height = 60 }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (ref.current && value) try {
			(0, import_JsBarcode.default)(ref.current, value, {
				format: "CODE128",
				height,
				displayValue: true,
				fontSize: 12,
				margin: 4
			});
		} catch {}
	}, [value, height]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { ref });
}
var productSchema = objectType({
	name: stringType().trim().min(1, "Le nom est requis").max(255),
	sku: stringType().trim().max(50).optional().or(literalType("")),
	category_id: stringType().optional().or(literalType("")),
	purchase_price: coerce.number().min(0, "Prix positif"),
	sale_price: coerce.number().min(0, "Prix positif"),
	tva: coerce.number().min(0).max(100),
	stock_min: coerce.number().min(0),
	description: stringType().trim().max(1e3).optional().or(literalType(""))
});
var PRODUCTS_PAGE_SIZE = 20;
function ProduitsPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editProduct, setEditProduct] = (0, import_react.useState)(null);
	const [detailId, setDetailId] = (0, import_react.useState)(null);
	const [qrOpen, setQrOpen] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(PRODUCTS_PAGE_SIZE);
	const [searchText, setSearchText] = (0, import_react.useState)("");
	const debouncedSearch = useDebounce(searchText, 300);
	const [filterCategory, setFilterCategory] = (0, import_react.useState)("");
	const [priceMin, setPriceMin] = (0, import_react.useState)("");
	const [priceMax, setPriceMax] = (0, import_react.useState)("");
	const [stockStatus, setStockStatus] = (0, import_react.useState)("all");
	const [filtersVisible, setFiltersVisible] = (0, import_react.useState)(false);
	const { mode: viewMode, setMode: setViewMode } = useViewMode("produits", "list");
	const activeFilterCount = (0, import_react.useMemo)(() => {
		let count = 0;
		if (searchText.trim()) count++;
		if (filterCategory) count++;
		if (priceMin) count++;
		if (priceMax) count++;
		if (stockStatus !== "all") count++;
		return count;
	}, [
		searchText,
		filterCategory,
		priceMin,
		priceMax,
		stockStatus
	]);
	(0, import_react.useEffect)(() => {
		setPage(1);
	}, [debouncedSearch]);
	const { data: productsData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"products",
			page,
			pageSize,
			debouncedSearch,
			filterCategory,
			priceMin,
			priceMax
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			let query = supabase.from("products").select("*, categories(name), lot_stock:lots(id, quantity)", {
				count: "exact",
				head: false
			});
			if (debouncedSearch.trim()) query = query.or(`name.ilike.%${debouncedSearch.trim()}%,sku.ilike.%${debouncedSearch.trim()}%`);
			if (filterCategory) query = query.eq("category_id", filterCategory);
			if (priceMin) query = query.gte("sale_price", Number(priceMin));
			if (priceMax) query = query.lte("sale_price", Number(priceMax));
			const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const { data, error } = await supabase.from("categories").select("*").order("name");
			if (error) throw error;
			return data;
		}
	});
	const products = (0, import_react.useMemo)(() => {
		if (stockStatus === "all") return productsData.data;
		return productsData.data.filter((p) => {
			const totalStock = (p.lot_stock ?? []).reduce((s, ls) => s + Number(ls.quantity), 0);
			const min = Number(p.stock_min);
			if (stockStatus === "rupture") return totalStock <= 0;
			if (stockStatus === "faible") return totalStock > 0 && totalStock < min;
			return totalStock >= min;
		});
	}, [productsData.data, stockStatus]);
	const totalProducts = productsData.count;
	const detail = productsData.data.find((p) => p.id === detailId);
	const clearFilters = () => {
		setSearchText("");
		setFilterCategory("");
		setPriceMin("");
		setPriceMax("");
		setStockStatus("all");
		setPage(1);
	};
	const deleteProductFn = useServerFn(deleteProduct);
	const del = useMutation({
		mutationFn: async (id) => {
			await deleteProductFn({ data: { id } });
		},
		onSuccess: () => {
			toast.success("Produit supprimé");
			qc.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const handleExportCsv = async () => {
		const { data: allProducts, error } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
		if (error) {
			toast.error("Erreur lors de l'export");
			return;
		}
		exportToCsv([
			{
				key: "name",
				label: "Nom"
			},
			{
				key: "sku",
				label: "SKU"
			},
			{
				key: "category",
				label: "Catégorie"
			},
			{
				key: "purchase_price",
				label: "Prix achat"
			},
			{
				key: "sale_price",
				label: "Prix vente"
			},
			{
				key: "tva",
				label: "TVA %"
			},
			{
				key: "stock_min",
				label: "Stock min"
			},
			{
				key: "barcode",
				label: "Code-barres"
			},
			{
				key: "description",
				label: "Description"
			}
		], (allProducts ?? []).map((p) => ({
			name: p.name,
			sku: p.sku ?? "",
			category: p.categories?.name ?? "",
			purchase_price: Number(p.purchase_price).toFixed(2),
			sale_price: Number(p.sale_price).toFixed(2),
			tva: p.tva,
			stock_min: p.stock_min,
			barcode: p.barcode ?? "",
			description: p.description ?? ""
		})), `produits-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	};
	const openEdit = (product) => {
		setEditProduct(product);
		setOpen(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Produits"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Catalogue et fiches produits."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: handleExportCsv,
							title: "Exporter en CSV",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), "CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setQrOpen(true),
							title: "Afficher les QR codes de tous les produits",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "mr-1 size-4" }), "QR codes"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
							open,
							onOpenChange: (o) => {
								setOpen(o);
								if (!o) setEditProduct(null);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => setEditProduct(null),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouveau produit"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductFormDialog, {
								categories,
								product: editProduct,
								onClose: () => {
									setOpen(false);
									setEditProduct(null);
								},
								onSaved: () => {
									qc.invalidateQueries({ queryKey: ["products"] });
									setOpen(false);
									setEditProduct(null);
								}
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: searchText,
									onChange: (e) => {
										setSearchText(e.target.value);
										setPage(1);
									},
									placeholder: "Rechercher par nom ou SKU…",
									className: "pl-8"
								}),
								searchText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setSearchText("");
										setPage(1);
									},
									className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: filtersVisible ? "default" : "outline",
							size: "sm",
							onClick: () => setFiltersVisible(!filtersVisible),
							className: "relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "mr-1 size-4" }),
								"Filtres",
								activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "ml-1.5 size-5 rounded-full p-0 text-[10px] font-medium leading-5",
									children: activeFilterCount
								})
							]
						}),
						activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: clearFilters,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-4" }), "Effacer"]
						})
					]
				}), filtersVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs text-muted-foreground",
								children: "Catégorie"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: filterCategory,
								onValueChange: (v) => {
									setFilterCategory(v);
									setPage(1);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-8 min-w-[160px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Toutes" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "",
									children: "Toutes"
								}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id,
									children: c.name
								}, c.id))] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs text-muted-foreground",
								children: "Prix vente min"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.01",
								min: "0",
								placeholder: "0",
								value: priceMin,
								onChange: (e) => {
									setPriceMin(e.target.value);
									setPage(1);
								},
								className: "h-8 w-[120px]"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs text-muted-foreground",
								children: "Prix vente max"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.01",
								min: "0",
								placeholder: "∞",
								value: priceMax,
								onChange: (e) => {
									setPriceMax(e.target.value);
									setPage(1);
								},
								className: "h-8 w-[120px]"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs text-muted-foreground",
								children: "Stock"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: stockStatus,
								onValueChange: (v) => {
									setStockStatus(v);
									setPage(1);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-8 min-w-[140px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Tous" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "all",
										children: "Tous"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "rupture",
										children: "En rupture"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "faible",
										children: "Stock faible"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "normal",
										children: "Stock normal"
									})
								] })]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						products.length,
						" produit(s) affiché(s) sur ",
						totalProducts
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewModeToggle, {
					mode: viewMode,
					onChange: setViewMode
				})]
			}),
			products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card py-16 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "mx-auto mb-3 size-10 text-muted-foreground/40" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-muted-foreground",
						children: activeFilterCount > 0 ? "Aucun produit ne correspond aux filtres." : "Aucun produit. Créez le premier."
					}),
					activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "link",
						size: "sm",
						onClick: clearFilters,
						className: "mt-1",
						children: "Effacer les filtres"
					})
				]
			}) : viewMode === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "SKU" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Catégorie" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Prix vente"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "TVA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Stock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: products.map((p) => {
					productStock(p);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "cursor-pointer",
						onClick: () => setDetailId(p.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductThumb, {
									product: p,
									className: "size-10",
									iconClass: "size-4"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: p.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono text-xs",
								children: p.sku
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-sm text-muted-foreground",
								children: p.categories?.name ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: formatXOF(Number(p.sale_price))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right text-sm",
								children: [p.tva, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockBadge, { product: p })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
									product: p,
									onEdit: openEdit,
									onDelete: (id) => del.mutate(id)
								})
							})
						]
					}, p.id);
				}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalProducts,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: viewGridClass(viewMode),
					children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
						product: p,
						mode: viewMode,
						onOpen: () => setDetailId(p.id),
						onEdit: openEdit,
						onDelete: (id) => del.mutate(id)
					}, p.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border border-border bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
						page,
						pageSize,
						total: totalProducts,
						onPageChange: setPage,
						onPageSizeChange: setPageSize
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!detail,
				onOpenChange: (o) => !o && setDetailId(null),
				children: detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: detail.name }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								detail.photo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: detail.photo_url,
									alt: "",
									className: "w-full rounded border"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "SKU :"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono",
												children: detail.sku
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Code-barres :"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono",
												children: detail.barcode
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Prix achat :"
											}),
											" ",
											formatXOF(Number(detail.purchase_price))
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Prix vente :"
											}),
											" ",
											formatXOF(Number(detail.sale_price))
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "TVA :"
											}),
											" ",
											detail.tva,
											"%"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Stock min :"
											}),
											" ",
											detail.stock_min
										] })
									]
								}),
								detail.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: detail.description
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-4 rounded-lg border border-dashed p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrPreview, {
									value: detail.sku,
									size: 140
								}),
								detail.barcode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarcodePreview, { value: detail.barcode }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => window.print(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "mr-1 size-4" }), " Imprimer"]
								})
							]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: qrOpen,
				onOpenChange: setQrOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
							"QR Codes — Produits (",
							products.length,
							")"
						] }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5",
							children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center gap-1 rounded-lg border p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrPreview, {
										value: p.sku,
										size: 80
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "max-w-full truncate text-[10px] font-medium",
										children: p.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[8px] text-muted-foreground",
										children: p.sku
									})
								]
							}, p.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => window.print(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "mr-1 size-4" }), " Imprimer"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => setQrOpen(false),
							children: "Fermer"
						})] })
					]
				})
			})
		]
	});
}
function ProductFormDialog({ categories, product, onClose, onSaved }) {
	const isEdit = !!product;
	const [photoFile, setPhotoFile] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const form = useForm({
		resolver: u(productSchema),
		defaultValues: {
			name: product?.name ?? "",
			sku: product?.sku ?? "",
			category_id: product?.category_id ?? "",
			purchase_price: product?.purchase_price ?? 0,
			sale_price: product?.sale_price ?? 0,
			tva: product?.tva ?? 18,
			stock_min: product?.stock_min ?? 0,
			description: product?.description ?? ""
		}
	});
	const upsertFn = useServerFn(upsertProduct);
	const save = useMutation({
		mutationFn: async (values) => {
			setBusy(true);
			let photo_url = product?.photo_url ?? null;
			if (photoFile) {
				const compressed = await compressImage(photoFile, 800, .8);
				const path = `${Date.now()}-${compressed.name}`;
				const up = await supabase.storage.from("product-photos").upload(path, compressed, { upsert: false });
				if (up.error) throw up.error;
				photo_url = (await supabase.storage.from("product-photos").createSignedUrl(path, 3600 * 24 * 365 * 5)).data?.signedUrl ?? null;
			}
			const sku = values.sku?.trim() || generateSKU();
			const payload = {
				...isEdit ? { id: product.id } : {},
				name: values.name.trim(),
				sku,
				category_id: values.category_id || null,
				photo_url,
				purchase_price: Number(values.purchase_price),
				sale_price: Number(values.sale_price),
				tva: Number(values.tva),
				stock_min: Number(values.stock_min),
				description: values.description || null,
				...isEdit ? {} : { barcode: generateBarcode() }
			};
			await upsertFn({ data: payload });
		},
		onSuccess: () => {
			toast.success(isEdit ? "Produit modifié" : "Produit créé");
			onSaved();
		},
		onError: (e) => toast.error(e.message ?? "Erreur"),
		onSettled: () => setBusy(false)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Modifier le produit" : "Nouveau produit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: form.handleSubmit((values) => save.mutate(values)),
			className: "grid gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Nom *"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							...form.register("name")
						}),
						form.formState.errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive",
							children: form.formState.errors.name.message
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "sku",
							children: "SKU (auto si vide)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "sku",
							...form.register("sku")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Catégorie" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.watch("category_id"),
							onValueChange: (v) => form.setValue("category_id", v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Aucune" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.id,
								children: c.name
							}, c.id)) })]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "purchase_price",
								children: "Prix achat"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "purchase_price",
								type: "number",
								step: "0.01",
								...form.register("purchase_price")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "sale_price",
									children: "Prix vente"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "sale_price",
									type: "number",
									step: "0.01",
									...form.register("sale_price")
								}),
								form.formState.errors.sale_price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive",
									children: form.formState.errors.sale_price.message
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "tva",
								children: "TVA %"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "tva",
								type: "number",
								step: "0.01",
								...form.register("tva")
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "stock_min",
							children: "Stock min"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "stock_min",
							type: "number",
							...form.register("stock_min")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Photo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "file",
							accept: "image/*",
							onChange: (e) => setPhotoFile(e.target.files?.[0] ?? null)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "description",
						children: "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "description",
						rows: 2,
						...form.register("description")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: onClose,
					children: "Annuler"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: busy ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"
				})] })
			]
		})]
	});
}
function productStock(p) {
	return (p.lot_stock ?? []).reduce((s, ls) => s + Number(ls.quantity), 0);
}
function ProductThumb({ product, className = "size-10", iconClass = "size-4" }) {
	if (product.photo_url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: product.photo_url,
		alt: product.name,
		className: `${className} rounded object-cover`,
		loading: "lazy"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `${className} flex items-center justify-center rounded bg-muted text-muted-foreground`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: iconClass })
	});
}
function StockBadge({ product }) {
	const total = productStock(product);
	const min = Number(product.stock_min);
	const status = total <= 0 ? "rupture" : total < min ? "faible" : "normal";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status === "rupture" ? "bg-red-500/10 text-red-600" : status === "faible" ? "bg-orange-500/10 text-orange-600" : "bg-emerald-500/10 text-emerald-600"}`,
		children: total.toFixed(0)
	});
}
function RowActions({ product, onEdit, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-end gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => onEdit(product),
			"aria-label": "Modifier",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				"aria-label": "Supprimer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Supprimer le produit ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
			"Êtes-vous sûr de vouloir supprimer ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: product.name }),
			" ? Cette action est irréversible."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Annuler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: () => onDelete(product.id),
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: "Supprimer"
		})] })] })] })]
	});
}
function ProductCard({ product: p, mode, onOpen, onEdit, onDelete }) {
	if (mode === "mosaic") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onOpen,
		className: "group flex flex-col items-center gap-1 rounded-lg border bg-card p-2 text-center transition hover:border-primary/40 hover:shadow-sm",
		title: p.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductThumb, {
				product: p,
				className: "size-14 w-full",
				iconClass: "size-5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "line-clamp-2 text-[11px] font-medium leading-tight",
				children: p.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockBadge, { product: p })
		]
	});
	if (mode === "details") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-3 rounded-lg border bg-card p-3 transition hover:border-primary/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onOpen,
			className: "shrink-0",
			"aria-label": `Ouvrir ${p.name}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductThumb, {
				product: p,
				className: "size-20",
				iconClass: "size-6"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onOpen,
						className: "min-w-0 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[11px] text-muted-foreground",
							children: p.sku
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
						product: p,
						onEdit,
						onDelete
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Catégorie : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: p.categories?.name ?? "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Achat : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: formatXOF(Number(p.purchase_price))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Vente : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: formatXOF(Number(p.sale_price))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["TVA : ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-foreground",
							children: [p.tva, "%"]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Stock min : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: p.stock_min
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1",
							children: ["Stock : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockBadge, { product: p })]
						})
					]
				}),
				p.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 line-clamp-2 text-xs text-muted-foreground",
					children: p.description
				})
			]
		})]
	});
	const isXl = mode === "xl-icons";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group flex flex-col rounded-lg border bg-card transition hover:border-primary/40 hover:shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onOpen,
			className: "w-full text-left",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductThumb, {
				product: p,
				className: `w-full rounded-b-none ${isXl ? "h-48" : "h-32"}`,
				iconClass: isXl ? "size-10" : "size-7"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `flex flex-1 flex-col gap-1 p-3 ${isXl ? "" : "p-2"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onOpen,
					className: "text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `line-clamp-2 font-medium leading-tight ${isXl ? "text-base" : "text-sm"}`,
						children: p.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] text-muted-foreground",
						children: p.sku
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex items-center justify-between gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `font-semibold ${isXl ? "text-base" : "text-sm"}`,
						children: formatXOF(Number(p.sale_price))
					}), isXl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: p.categories?.name ?? "Sans catégorie"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockBadge, { product: p })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowActions, {
					product: p,
					onEdit,
					onDelete
				})
			]
		})]
	});
}
//#endregion
export { ProduitsPage as component };
