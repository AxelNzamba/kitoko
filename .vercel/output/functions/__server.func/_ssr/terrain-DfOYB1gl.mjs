import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { A as Save, G as Minus, Ht as ArrowDownLeft, L as Plus, Mt as Camera, W as PackageCheck, d as Truck, ht as CloudOff, k as ScanLine, t as X, vt as ClipboardCheck, zt as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as useWarehouseFilter } from "./warehouse-filter-DuSqDZ_e.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.mjs";
import { n as isOffline } from "./session-cache-CesiV_L5.mjs";
import { n as enqueueMutation, r as getSyncDB, s as useOnlineStatus } from "./hooks-RLyvvVA0.mjs";
import { n as Html5Qrcode } from "../_libs/html5-qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terrain-DfOYB1gl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Vrai si l'erreur ressemble à une coupure réseau (et non à un refus serveur). */
function isNetworkError(e) {
	if (isOffline()) return true;
	const msg = String(e?.message ?? e ?? "").toLowerCase();
	return msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("network request failed") || msg.includes("load failed") || msg.includes("fetch failed") || msg.includes("timeout");
}
/** Identifiant utilisateur lu depuis la session locale (fonctionne sans réseau). */
async function getLocalUserId() {
	const { data } = await supabase.auth.getSession();
	return data.session?.user?.id ?? null;
}
function matchesWarehouse(row, warehouseId) {
	if (!warehouseId || warehouseId === "all") return true;
	return row.warehouse_id === warehouseId;
}
function alive(row) {
	return !row._deleted;
}
async function cachedProducts() {
	return (await getSyncDB().cache("products").toArray()).filter(alive).sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
}
async function cachedProductById(id) {
	const row = await getSyncDB().cache("products").get(id);
	return row && alive(row) ? row : null;
}
async function cachedProductByCode(code) {
	return (await getSyncDB().cache("products").toArray()).find((p) => alive(p) && (p.sku === code || p.barcode === code)) ?? null;
}
async function cachedLotByNumber(lotNumber, warehouseId) {
	return (await getSyncDB().cache("lots").toArray()).find((l) => alive(l) && l.lot_number === lotNumber && matchesWarehouse(l, warehouseId)) ?? null;
}
async function cachedLotsForProduct(productId, warehouseId) {
	return (await getSyncDB().cache("lots").toArray()).filter((l) => alive(l) && l.product_id === productId && matchesWarehouse(l, warehouseId)).sort((a, b) => String(b.reception_date ?? "").localeCompare(String(a.reception_date ?? "")));
}
async function cachedOpenSessions(warehouseId) {
	return (await getSyncDB().cache("inventory_sessions").toArray()).filter((s) => alive(s) && s.status === "ouverte" && matchesWarehouse(s, warehouseId)).sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
}
/**
* Exécute une lecture réseau avec repli automatique sur le cache local.
* Le repli est aussi utilisé quand la requête échoue pour cause réseau.
*/
async function withOfflineFallback(online, offline) {
	if (isOffline()) return offline();
	try {
		return await online();
	} catch (e) {
		if (isNetworkError(e)) return offline();
		throw e;
	}
}
/**
* Insère une ligne : direct si en ligne, sinon via l'outbox.
* Un refus serveur (RLS, validation) est remonté tel quel : on ne met jamais
* en file une opération que le serveur a explicitement rejetée.
*/
async function insertOrQueue(table, payload) {
	const id = payload.id ?? crypto.randomUUID();
	const row = {
		...payload,
		id
	};
	if (isOffline()) {
		await enqueueMutation(table, "upsert", id, row);
		return { queued: true };
	}
	try {
		const { error } = await supabase.from(table).insert(row);
		if (error) throw error;
		return { queued: false };
	} catch (e) {
		if (!isNetworkError(e)) throw e;
		await enqueueMutation(table, "upsert", id, row);
		return { queued: true };
	}
}
var nextFrame = () => new Promise((resolve) => {
	if (typeof window === "undefined") return resolve();
	requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
});
function TerrainPage() {
	const [mode, setMode] = (0, import_react.useState)("scan");
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const [scanned, setScanned] = (0, import_react.useState)(null);
	const scannerRef = (0, import_react.useRef)(null);
	const scannerDivId = "terrain-scanner";
	const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
	const stopScanner = () => {
		const scanner = scannerRef.current;
		scannerRef.current = null;
		if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {});
		setScanning(false);
	};
	(0, import_react.useEffect)(() => {
		return () => {
			const scanner = scannerRef.current;
			scannerRef.current = null;
			scanner?.stop().catch(() => {});
		};
	}, []);
	const startScanner = async () => {
		if (scannerRef.current) return;
		setScanning(true);
		setScanned(null);
		await nextFrame();
		if (!document.getElementById(scannerDivId)) {
			setScanning(false);
			toast.error("Zone de scan indisponible");
			return;
		}
		try {
			const scanner = new Html5Qrcode(scannerDivId);
			scannerRef.current = scanner;
			await scanner.start({ facingMode: "environment" }, {
				fps: 10,
				qrbox: {
					width: 250,
					height: 250
				}
			}, (decodedText) => {
				handleScan(decodedText);
			}, () => {});
		} catch {
			scannerRef.current = null;
			toast.error("Impossible d'accéder à la caméra (autorisation refusée ou HTTPS requis)");
			setScanning(false);
		}
	};
	/**
	* Recherche un lot par numéro, sinon un produit par SKU ou code-barres.
	* Fonctionne hors-ligne grâce au miroir local (lots/produits synchronisés).
	*/
	const handleScan = async (rawCode) => {
		const code = rawCode.trim();
		if (!code) {
			toast.error("Code vide");
			return;
		}
		let lot = null;
		let product = null;
		let fromCache = false;
		try {
			const found = await withOfflineFallback(async () => {
				let lotQuery = supabase.from("lots").select("*, products(id, name, sku, sale_price, purchase_price)").eq("lot_number", code).limit(1);
				lotQuery = applyFilter(lotQuery, "warehouse_id");
				const { data: lots, error } = await lotQuery;
				if (error) throw error;
				const l = lots?.[0] ?? null;
				if (l) return {
					lot: l,
					product: l.products ?? null,
					cache: false
				};
				const { data: products, error: pErr } = await supabase.from("products").select("id, name, sku, barcode, sale_price, purchase_price").or(`sku.eq.${code},barcode.eq.${code}`).limit(1);
				if (pErr) throw pErr;
				return {
					lot: null,
					product: products?.[0] ?? null,
					cache: false
				};
			}, async () => {
				const l = await cachedLotByNumber(code, selectedWarehouseId);
				if (l) return {
					lot: l,
					product: l.product_id ? await cachedProductById(String(l.product_id)) : null,
					cache: true
				};
				return {
					lot: null,
					product: await cachedProductByCode(code),
					cache: true
				};
			});
			lot = found.lot;
			product = found.product;
			fromCache = found.cache;
		} catch (e) {
			toast.error(e?.message ?? "Recherche impossible");
			return;
		}
		const suffix = fromCache ? " (données locales)" : "";
		if (lot) {
			setScanned({
				lot,
				product
			});
			stopScanner();
			toast.success(`Lot ${code} reconnu — ${product?.name ?? ""}${suffix}`);
			return;
		}
		if (product) {
			setScanned({
				lot: null,
				product
			});
			stopScanner();
			toast.success(`Produit reconnu — ${product.name}${suffix}`);
			return;
		}
		toast.error(fromCache ? `Aucun lot ni produit pour « ${code} » dans les données locales (synchronisez une fois en ligne)` : `Aucun lot ni produit pour « ${code} »`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md space-y-4 p-4 pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight",
					children: "Mode terrain"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: ["Opérations rapides sur mobile", selectedWarehouseId && selectedWarehouseId !== "all" ? " — entrepôt actif" : " — tous les entrepôts"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
						active: mode === "scan" && !scanning,
						onClick: () => {
							setMode("scan");
							stopScanner();
						},
						icon: ScanLine,
						label: "Scanner"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
						active: mode === "in",
						onClick: () => {
							setMode("in");
							stopScanner();
						},
						icon: ArrowDownLeft,
						label: "Entrée"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
						active: mode === "out",
						onClick: () => {
							setMode("out");
							stopScanner();
						},
						icon: ArrowUpRight,
						label: "Sortie"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
						active: mode === "count",
						onClick: () => {
							setMode("count");
							stopScanner();
						},
						icon: ClipboardCheck,
						label: "Inventaire"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
						active: mode === "receive",
						onClick: () => {
							setMode("receive");
							stopScanner();
						},
						icon: Truck,
						label: "Réception"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
						active: scanning,
						onClick: () => scanning ? stopScanner() : void startScanner(),
						icon: Camera,
						label: scanning ? "Arrêter" : "Caméra"
					})
				]
			}),
			scanning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm",
					children: "Scan en cours"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: stopScanner,
					"aria-label": "Arrêter le scan",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: scannerDivId,
				className: "w-full overflow-hidden rounded"
			}) })] }),
			scanned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanSummary, {
				scanned,
				onClear: () => setScanned(null)
			}),
			mode === "scan" && !scanning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLookup, { onScan: handleScan }),
			mode === "in" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickMovement, {
				type: "entree",
				scanned,
				onClear: () => setScanned(null)
			}),
			mode === "out" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickMovement, {
				type: "sortie",
				scanned,
				onClear: () => setScanned(null)
			}),
			mode === "count" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickCount, { scanned }),
			mode === "receive" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickReceive, {})
		]
	});
}
function ModeButton({ active, onClick, icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: active ? "default" : "outline",
		className: "h-auto min-h-14 flex-col gap-1 py-3",
		onClick,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px]",
			children: label
		})]
	});
}
function ScanSummary({ scanned, onClear }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-2 rounded-lg border bg-muted/50 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate font-medium",
				children: scanned.product?.name ?? "Produit inconnu"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: scanned.lot ? `Lot ${scanned.lot.lot_number}` : `SKU ${scanned.product?.sku ?? "—"}`
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			onClick: onClear,
			"aria-label": "Effacer la sélection",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
		})]
	});
}
function ScanLookup({ onScan }) {
	const [code, setCode] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const run = async () => {
		setBusy(true);
		try {
			await onScan(code);
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-sm",
		children: "Recherche manuelle"
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			placeholder: "Numéro de lot, SKU ou code-barres",
			value: code,
			onChange: (e) => setCode(e.target.value),
			onKeyDown: (e) => {
				if (e.key === "Enter" && code.trim()) run();
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "h-14 w-full",
			onClick: () => void run(),
			disabled: !code.trim() || busy,
			children: "Rechercher"
		})]
	})] });
}
function QuickMovement({ type, scanned, onClear }) {
	const qc = useQueryClient();
	const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
	const [productId, setProductId] = (0, import_react.useState)(scanned?.product?.id ?? "");
	const [lotId, setLotId] = (0, import_react.useState)(scanned?.lot?.id ?? "");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [reason, setReason] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (scanned?.product?.id) setProductId(scanned.product.id);
		if (scanned?.lot?.id) setLotId(scanned.lot.id);
	}, [scanned]);
	const { data: products = [] } = useQuery({
		queryKey: ["products", "min"],
		queryFn: () => withOfflineFallback(async () => {
			const { data, error } = await supabase.from("products").select("id, name, sku").order("name");
			if (error) throw error;
			return data ?? [];
		}, cachedProducts)
	});
	const { data: lots = [] } = useQuery({
		queryKey: [
			"lots",
			"terrain",
			productId,
			selectedWarehouseId
		],
		enabled: !!productId,
		queryFn: () => withOfflineFallback(async () => {
			let q = supabase.from("lots").select("id, lot_number").eq("product_id", productId);
			q = applyFilter(q, "warehouse_id");
			const { data, error } = await q.order("reception_date", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}, () => cachedLotsForProduct(productId, selectedWarehouseId))
	});
	const save = useMutation({
		mutationFn: async () => {
			if (!productId) throw new Error("Sélectionnez un produit");
			const quantity = Number(qty);
			if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantité invalide");
			if (!Number.isInteger(quantity)) throw new Error("La quantité doit être un nombre entier");
			const userId = await getLocalUserId();
			if (!userId) throw new Error("Session expirée — reconnectez-vous");
			const payload = {
				product_id: productId,
				lot_id: lotId || null,
				type,
				quantity,
				reason: reason || (type === "entree" ? "Entrée terrain" : "Sortie terrain"),
				created_by: userId
			};
			if (selectedWarehouseId && selectedWarehouseId !== "all") payload.warehouse_id = selectedWarehouseId;
			return insertOrQueue("stock_movements", payload);
		},
		onSuccess: ({ queued }) => {
			const label = type === "entree" ? "Entrée" : "Sortie";
			if (queued) toast.info(`${label} enregistrée hors-ligne — envoi automatique au retour du réseau`);
			else toast.success(`${label} enregistrée`);
			qc.invalidateQueries({ queryKey: ["movements"] });
			qc.invalidateQueries({ queryKey: ["lot_stock"] });
			setQty("1");
			setReason("");
			setLotId("");
			onClear();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-sm",
		children: type === "entree" ? "Entrée de stock" : "Sortie de stock"
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: productId,
				onValueChange: (v) => {
					setProductId(v);
					setLotId("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Produit" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
					value: p.id,
					children: [p.name, p.sku ? ` — ${p.sku}` : ""]
				}, p.id)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: lotId,
				onValueChange: setLotId,
				disabled: !productId,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Lot (optionnel)" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: lots.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: l.id,
					children: l.lot_number
				}, l.id)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						className: "size-12",
						"aria-label": "Diminuer",
						onClick: () => setQty(String(Math.max(1, Number(qty || 1) - 1))),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: "1",
						className: "h-12 text-center text-lg",
						value: qty,
						onChange: (e) => setQty(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "icon",
						className: "size-12",
						"aria-label": "Augmenter",
						onClick: () => setQty(String(Number(qty || 0) + 1)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Motif",
				value: reason,
				onChange: (e) => setReason(e.target.value),
				className: "h-12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "h-14 w-full",
				onClick: () => save.mutate(),
				disabled: save.isPending || !productId || !qty,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 size-4" }), "Enregistrer"]
			})
		]
	})] });
}
function QuickCount({ scanned }) {
	const qc = useQueryClient();
	const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
	const [sessionId, setSessionId] = (0, import_react.useState)("");
	const [lotNumber, setLotNumber] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (scanned?.lot?.lot_number) setLotNumber(scanned.lot.lot_number);
	}, [scanned]);
	const { data: sessions = [] } = useQuery({
		queryKey: ["inv_sessions_open", selectedWarehouseId],
		queryFn: () => withOfflineFallback(async () => {
			let q = supabase.from("inventory_sessions").select("id, name").eq("status", "ouverte").order("created_at", { ascending: false });
			q = applyFilter(q, "warehouse_id");
			const { data, error } = await q;
			if (error) throw error;
			return data ?? [];
		}, () => cachedOpenSessions(selectedWarehouseId))
	});
	const save = useMutation({
		mutationFn: async () => {
			const quantity = Number(qty);
			if (!Number.isFinite(quantity) || quantity < 0) throw new Error("Quantité invalide");
			if (!Number.isInteger(quantity)) throw new Error("La quantité doit être un nombre entier");
			const number = lotNumber.trim();
			const lot = await withOfflineFallback(async () => {
				let lotQuery = supabase.from("lots").select("id, warehouse_id").eq("lot_number", number).limit(1);
				lotQuery = applyFilter(lotQuery, "warehouse_id");
				const { data: lots, error } = await lotQuery;
				if (error) throw error;
				return lots?.[0] ?? null;
			}, async () => {
				const l = await cachedLotByNumber(number, selectedWarehouseId);
				return l ? {
					id: l.id,
					warehouse_id: l.warehouse_id ?? null
				} : null;
			});
			if (!lot) throw new Error("Lot introuvable dans cet entrepôt");
			const payload = {
				session_id: sessionId,
				lot_id: lot.id,
				counted_quantity: quantity
			};
			const wh = lot.warehouse_id ?? (selectedWarehouseId !== "all" ? selectedWarehouseId : null);
			if (wh) payload.warehouse_id = wh;
			return insertOrQueue("inventory_counts", payload);
		},
		onSuccess: ({ queued }) => {
			if (queued) toast.info("Comptage enregistré hors-ligne — envoi automatique au retour du réseau");
			else toast.success("Comptage enregistré");
			setLotNumber("");
			setQty("");
			qc.invalidateQueries({ queryKey: ["counts"] });
			qc.invalidateQueries({ queryKey: ["inventory_counts"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-sm",
		children: "Comptage rapide"
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: sessionId,
				onValueChange: setSessionId,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Session d'inventaire" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: sessions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: s.id,
					children: s.name
				}, s.id)) })]
			}),
			sessions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Aucune session ouverte pour cet entrepôt. Créez-la depuis l'écran Inventaire."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Numéro de lot",
				value: lotNumber,
				onChange: (e) => setLotNumber(e.target.value),
				className: "h-12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "number",
				min: "0",
				placeholder: "Quantité comptée",
				value: qty,
				onChange: (e) => setQty(e.target.value),
				className: "h-12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "h-14 w-full",
				onClick: () => save.mutate(),
				disabled: save.isPending || !sessionId || !lotNumber.trim() || qty === "",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "mr-2 size-4" }), "Enregistrer le comptage"]
			})
		]
	})] });
}
function QuickReceive() {
	const qc = useQueryClient();
	const online = useOnlineStatus();
	const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
	const [poId, setPoId] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("");
	const { data: orders = [] } = useQuery({
		queryKey: ["po_to_receive", selectedWarehouseId],
		queryFn: async () => {
			let q = supabase.from("purchase_orders").select("id, po_number, supplier_id").in("status", ["envoyee", "partielle"]);
			q = applyFilter(q, "warehouse_id");
			const { data } = await q;
			return data ?? [];
		}
	});
	const receive = useMutation({
		mutationFn: async () => {
			const { data: order, error: orderError } = await supabase.from("purchase_orders").select("*, purchase_order_items(*)").eq("id", poId).maybeSingle();
			if (orderError) throw orderError;
			if (!order) throw new Error("Commande introuvable");
			const items = order.purchase_order_items ?? [];
			if (items.length === 0) throw new Error("Cette commande n'a aucune ligne");
			const totalOrdered = items.reduce((a, i) => a + Number(i.quantity_ordered), 0);
			const qtyNum = Number(qty);
			if (!Number.isFinite(qtyNum) || qtyNum <= 0 || qtyNum > totalOrdered) throw new Error(`Quantité invalide (max ${totalOrdered})`);
			const { data: u } = await supabase.auth.getUser();
			const warehouseId = order.warehouse_id ?? (selectedWarehouseId && selectedWarehouseId !== "all" ? selectedWarehouseId : null);
			const movements = items.map((it) => ({
				product_id: it.product_id,
				type: "entree",
				quantity: qtyNum * (Number(it.quantity_ordered) / totalOrdered),
				unit_price: it.unit_price,
				reason: `Réception ${order.po_number}`,
				created_by: u.user?.id,
				warehouse_id: warehouseId
			}));
			const { error } = await supabase.from("stock_movements").insert(movements);
			if (error) throw error;
			const fullyReceived = qtyNum >= totalOrdered;
			const { error: updateError } = await supabase.from("purchase_orders").update({ status: fullyReceived ? "receptionnee" : "partielle" }).eq("id", poId);
			if (updateError) throw updateError;
		},
		onSuccess: () => {
			toast.success("Réception enregistrée");
			setPoId("");
			setQty("");
			qc.invalidateQueries({ queryKey: ["po_to_receive"] });
			qc.invalidateQueries({ queryKey: ["purchase_orders"] });
			qc.invalidateQueries({ queryKey: ["movements"] });
			qc.invalidateQueries({ queryKey: ["lot_stock"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-sm",
		children: "Réception fournisseur"
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3",
		children: [
			!online && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudOff, { className: "mt-0.5 size-4 shrink-0 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "La réception fournisseur nécessite le réseau (mise à jour de la commande et de ses lignes). Utilisez « Entrée » pour enregistrer la marchandise hors-ligne, puis réceptionnez la commande une fois connecté." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: poId,
				onValueChange: setPoId,
				disabled: !online,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Commande à réceptionner" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: o.id,
					children: o.po_number
				}, o.id)) })]
			}),
			online && orders.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Aucune commande en attente de réception."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "number",
				min: "1",
				placeholder: "Quantité totale reçue",
				value: qty,
				onChange: (e) => setQty(e.target.value),
				className: "h-12",
				disabled: !online
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "h-14 w-full",
				onClick: () => receive.mutate(),
				disabled: !online || receive.isPending || !poId || !qty,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "mr-2 size-4" }), "Réceptionner"]
			})
		]
	})] });
}
//#endregion
export { TerrainPage as component };
