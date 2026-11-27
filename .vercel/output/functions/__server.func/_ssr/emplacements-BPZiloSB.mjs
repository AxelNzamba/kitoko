import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { B as Pencil, Bt as ArrowLeftRight, Dt as ChevronRight, J as MapPin, L as Plus, O as Search, Pt as Building2, a as Warehouse, h as Trash2, kt as ChevronDown, t as X } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CmIv1W53.mjs";
import { t as useWarehouseFilter } from "./warehouse-filter-DuSqDZ_e.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/emplacements-BPZiloSB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function locationPath(loc) {
	return [
		loc.zone && `Zone ${loc.zone}`,
		loc.aisle && `Allée ${loc.aisle}`,
		loc.rack && `Rack ${loc.rack}`,
		loc.bay && `Rayon ${loc.bay}`,
		loc.level && `Niveau ${loc.level}`
	].filter(Boolean).join(" / ");
}
function matches(loc, q) {
	if (!q) return true;
	const haystack = [
		loc.name,
		loc.zone,
		loc.aisle,
		loc.rack,
		loc.bay,
		loc.level,
		loc.warehouses?.name
	].filter(Boolean).join(" ").toLowerCase();
	return q.toLowerCase().split(/\s+/).filter(Boolean).every((token) => haystack.includes(token));
}
/**
* Explorateur d'emplacements : arborescence Entrepôt > Zone > emplacements,
* recherche avec auto-complétion et création rapide au bon niveau.
*/
function LocationExplorer({ locations, warehouses, onEdit, onDelete, onQuickCreate }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [collapsed, setCollapsed] = (0, import_react.useState)({});
	const filtered = (0, import_react.useMemo)(() => locations.filter((l) => matches(l, query)), [locations, query]);
	const suggestions = (0, import_react.useMemo)(() => {
		if (query.trim().length < 1) return [];
		const set = /* @__PURE__ */ new Set();
		for (const l of locations) for (const v of [
			l.name,
			l.zone && `Zone ${l.zone}`,
			l.aisle && `Allée ${l.aisle}`,
			l.rack && `Rack ${l.rack}`
		]) if (v && v.toLowerCase().includes(query.toLowerCase()) && v.toLowerCase() !== query.toLowerCase()) set.add(v);
		return [...set].slice(0, 6);
	}, [locations, query]);
	const tree = (0, import_react.useMemo)(() => {
		const byWarehouse = /* @__PURE__ */ new Map();
		for (const loc of filtered) {
			const wid = loc.warehouse_id ?? "none";
			if (!byWarehouse.has(wid)) byWarehouse.set(wid, /* @__PURE__ */ new Map());
			const zones = byWarehouse.get(wid);
			const zone = loc.zone?.trim() || "Sans zone";
			if (!zones.has(zone)) zones.set(zone, []);
			zones.get(zone).push(loc);
		}
		return byWarehouse;
	}, [filtered]);
	const warehouseName = (id) => warehouses.find((w) => w.id === id)?.name ?? "Sans entrepôt";
	const toggle = (key) => setCollapsed((prev) => ({
		...prev,
		[key]: !prev[key]
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Rechercher un emplacement (nom, zone, allée, rack, entrepôt)…",
						className: "pl-9 pr-9"
					}),
					query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Effacer",
						className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
						onClick: () => setQuery(""),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					}),
					suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setQuery(s),
							className: "rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground transition hover:border-accent hover:text-foreground",
							children: s
						}, s))
					})
				]
			}),
			[...tree.keys()].length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mx-auto mb-2 size-8 text-muted-foreground/40" }), "Aucun emplacement ne correspond."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: [...tree.entries()].map(([wid, zones]) => {
					const whKey = `wh-${wid}`;
					const total = [...zones.values()].reduce((n, arr) => n + arr.length, 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex min-w-0 items-center gap-2 text-sm font-semibold",
								onClick: () => toggle(whKey),
								children: [
									collapsed[whKey] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-4 text-accent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: warehouseName(wid)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-normal text-muted-foreground",
										children: [
											total,
											" emplacement",
											total > 1 ? "s" : ""
										]
									})
								]
							}), wid !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "h-7 gap-1 text-xs",
								onClick: () => onQuickCreate({ warehouse_id: wid }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Emplacement"]
							})]
						}), !collapsed[whKey] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y",
							children: [...zones.entries()].map(([zone, locs]) => {
								const zoneKey = `${wid}-${zone}`;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between bg-muted/30 px-3 py-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground",
										onClick: () => toggle(zoneKey),
										children: [
											collapsed[zoneKey] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" }),
											zone,
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "normal-case",
												children: [
													"(",
													locs.length,
													")"
												]
											})
										]
									}), wid !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "sm",
										className: "h-6 gap-1 text-[11px]",
										onClick: () => onQuickCreate({
											warehouse_id: wid,
											zone: zone === "Sans zone" ? void 0 : zone
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" }), " Ajouter ici"]
									})]
								}), !collapsed[zoneKey] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: locs.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: `flex items-center justify-between px-3 py-2 ${loc.is_active ? "" : "bg-muted/20"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex min-w-0 items-center gap-2 pl-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: `size-4 shrink-0 ${loc.is_active ? "text-accent" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "truncate text-sm font-medium",
												children: [loc.name, !loc.is_active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-2 text-[10px] uppercase text-muted-foreground",
													children: "inactif"
												})]
											}), locationPath(loc) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-xs text-muted-foreground",
												children: locationPath(loc)
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex shrink-0 gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => onEdit(loc),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => onDelete(loc.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-destructive" })
										})]
									})]
								}, loc.id)) })] }, zoneKey);
							})
						})]
					}, wid);
				})
			})
		]
	});
}
function EmplacementsPage() {
	const qc = useQueryClient();
	const { applyFilter, selectedWarehouseId } = useWarehouseFilter();
	const [activeTab, setActiveTab] = (0, import_react.useState)("warehouses");
	const [whOpen, setWhOpen] = (0, import_react.useState)(false);
	const [editWh, setEditWh] = (0, import_react.useState)(null);
	const [whName, setWhName] = (0, import_react.useState)("");
	const [whCode, setWhCode] = (0, import_react.useState)("");
	const [whAddress, setWhAddress] = (0, import_react.useState)("");
	const [whActive, setWhActive] = (0, import_react.useState)(true);
	const [locOpen, setLocOpen] = (0, import_react.useState)(false);
	const [editLoc, setEditLoc] = (0, import_react.useState)(null);
	const [locName, setLocName] = (0, import_react.useState)("");
	const [locWh, setLocWh] = (0, import_react.useState)("");
	const [locZone, setLocZone] = (0, import_react.useState)("");
	const [locAisle, setLocAisle] = (0, import_react.useState)("");
	const [locRack, setLocRack] = (0, import_react.useState)("");
	const [locBay, setLocBay] = (0, import_react.useState)("");
	const [locLevel, setLocLevel] = (0, import_react.useState)("");
	const [locDesc, setLocDesc] = (0, import_react.useState)("");
	const [locActive, setLocActive] = (0, import_react.useState)(true);
	const [transferOpen, setTransferOpen] = (0, import_react.useState)(false);
	const [fromLoc, setFromLoc] = (0, import_react.useState)("");
	const [toLoc, setToLoc] = (0, import_react.useState)("");
	const [transferProduct, setTransferProduct] = (0, import_react.useState)("");
	const [transferQty, setTransferQty] = (0, import_react.useState)("1");
	const { data: warehouses = [] } = useQuery({
		queryKey: ["warehouses"],
		queryFn: async () => {
			const { data } = await supabase.from("warehouses").select("*").order("name");
			return data ?? [];
		}
	});
	const { data: locations = [] } = useQuery({
		queryKey: ["stock-locations", selectedWarehouseId],
		queryFn: async () => {
			let q = supabase.from("stock_locations").select("*, warehouses(name)").order("name");
			q = applyFilter(q, "warehouse_id");
			const { data } = await q;
			return data ?? [];
		}
	});
	const { data: products = [] } = useQuery({
		queryKey: ["products", "min"],
		queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? []
	});
	const openWhNew = () => {
		setEditWh(null);
		setWhName("");
		setWhCode("");
		setWhAddress("");
		setWhActive(true);
		setWhOpen(true);
	};
	const openWhEdit = (w) => {
		setEditWh(w);
		setWhName(w.name);
		setWhCode(w.code ?? "");
		setWhAddress(w.address ?? "");
		setWhActive(w.is_active);
		setWhOpen(true);
	};
	const saveWarehouse = useMutation({
		mutationFn: async () => {
			if (!whName.trim()) throw new Error("Le nom est requis");
			const payload = {
				name: whName.trim(),
				code: whCode.trim() || null,
				address: whAddress.trim() || null,
				is_active: whActive
			};
			if (editWh) {
				const { error } = await supabase.from("warehouses").update(payload).eq("id", editWh.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("warehouses").insert(payload);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editWh ? "Entrepôt modifié" : "Entrepôt créé");
			qc.invalidateQueries({ queryKey: ["warehouses"] });
			setWhOpen(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const delWarehouse = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("warehouses").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Entrepôt supprimé");
			qc.invalidateQueries({ queryKey: ["warehouses"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const openLocNew = () => {
		setEditLoc(null);
		setLocName("");
		setLocWh(selectedWarehouseId === "all" ? "" : selectedWarehouseId);
		setLocZone("");
		setLocAisle("");
		setLocRack("");
		setLocBay("");
		setLocLevel("");
		setLocDesc("");
		setLocActive(true);
		setLocOpen(true);
	};
	const openLocEdit = (loc) => {
		setEditLoc(loc);
		setLocName(loc.name);
		setLocWh(loc.warehouse_id ?? "");
		setLocZone(loc.zone ?? "");
		setLocAisle(loc.aisle ?? "");
		setLocRack(loc.rack ?? "");
		setLocBay(loc.bay ?? "");
		setLocLevel(loc.level ?? "");
		setLocDesc(loc.description ?? "");
		setLocActive(loc.is_active);
		setLocOpen(true);
	};
	const saveLocation = useMutation({
		mutationFn: async () => {
			if (!locName.trim()) throw new Error("Le nom est requis");
			if (!locWh.trim()) throw new Error("L'entrepôt est requis");
			const payload = {
				name: locName.trim(),
				warehouse_id: locWh,
				zone: locZone.trim() || null,
				aisle: locAisle.trim() || null,
				rack: locRack.trim() || null,
				bay: locBay.trim() || null,
				level: locLevel.trim() || null,
				description: locDesc.trim() || null,
				is_active: locActive
			};
			if (editLoc) {
				const { error } = await supabase.from("stock_locations").update(payload).eq("id", editLoc.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("stock_locations").insert(payload);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editLoc ? "Emplacement modifié" : "Emplacement créé");
			qc.invalidateQueries({ queryKey: ["stock-locations"] });
			setLocOpen(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const delLocation = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("stock_locations").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Emplacement supprimé");
			qc.invalidateQueries({ queryKey: ["stock-locations"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const doTransfer = useMutation({
		mutationFn: async () => {
			if (!fromLoc || !toLoc || !transferProduct || !transferQty) throw new Error("Veuillez remplir tous les champs");
			if (fromLoc === toLoc) throw new Error("Les emplacements doivent être différents");
			const { data: userRes } = await supabase.auth.getUser();
			const qty = Number(transferQty);
			if (qty <= 0) throw new Error("La quantité doit être positive");
			const fromWarehouse = locations.find((l) => l.id === fromLoc)?.warehouse_id;
			const toWarehouse = locations.find((l) => l.id === toLoc)?.warehouse_id;
			const { error: err1 } = await supabase.from("stock_movements").insert({
				product_id: transferProduct,
				type: "sortie",
				quantity: qty,
				reason: "Transfert vers autre emplacement",
				location_id: fromLoc,
				warehouse_id: fromWarehouse,
				created_by: userRes.user?.id
			});
			if (err1) throw err1;
			const { error: err2 } = await supabase.from("stock_movements").insert({
				product_id: transferProduct,
				type: "entree",
				quantity: qty,
				reason: "Transfert depuis autre emplacement",
				location_id: toLoc,
				warehouse_id: toWarehouse,
				created_by: userRes.user?.id
			});
			if (err2) throw err2;
		},
		onSuccess: () => {
			toast.success("Transfert effectué");
			notify.info("Transfert stock", `Transfert de ${transferQty} unité(s) effectué`);
			setTransferOpen(false);
			setFromLoc("");
			setToLoc("");
			setTransferProduct("");
			setTransferQty("1");
			qc.invalidateQueries({ queryKey: ["movements"] });
			qc.invalidateQueries({ queryKey: ["lot_stock"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Entrepôts & Emplacements"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Gérez vos entrepôts et localisez précisément chaque lot (zone, allée, rack, rayon, niveau)."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setTransferOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "mr-1 size-4" }), " Transférer"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: activeTab === "warehouses" ? "default" : "outline",
							onClick: () => setActiveTab("warehouses"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "mr-1 size-4" }), " Entrepôts"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: activeTab === "locations" ? "default" : "outline",
							onClick: () => setActiveTab("locations"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mr-1 size-4" }), " Emplacements"]
						})
					]
				})]
			}),
			activeTab === "warehouses" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: openWhNew,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouvel entrepôt"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: [warehouses.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-lg border p-4 ${w.is_active ? "border-border bg-card" : "border-dashed bg-muted/30"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Warehouse, { className: `size-5 ${w.is_active ? "text-accent" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-sm",
										children: w.name
									}), w.code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] uppercase tracking-wider text-muted-foreground",
										children: w.code
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => openWhEdit(w),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-destructive" })
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Supprimer l'entrepôt ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
										"Êtes-vous sûr de vouloir supprimer ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: w.name }),
										" ? Les emplacements et mouvements liés conserveront une référence historique."
									] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Annuler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
										onClick: () => delWarehouse.mutate(w.id),
										className: "bg-destructive text-destructive-foreground",
										children: "Supprimer"
									})] })] })] })]
								})]
							}),
							w.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: w.address
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex items-center gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-block rounded px-2 py-0.5 text-[10px] font-medium ${w.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`,
									children: w.is_active ? "Actif" : "Inactif"
								})
							})
						]
					}, w.id)), warehouses.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-full flex flex-col items-center justify-center py-10 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Warehouse, { className: "mb-2 size-8 text-muted-foreground/40" }), "Aucun entrepôt. Créez le premier."]
					})]
				})]
			}),
			activeTab === "locations" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: openLocNew,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouvel emplacement"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationExplorer, {
					locations,
					warehouses,
					onEdit: (loc) => openLocEdit(loc),
					onDelete: (id) => delLocation.mutate(id),
					onQuickCreate: (prefill) => {
						openLocNew();
						setLocWh(prefill.warehouse_id);
						setLocZone(prefill.zone ?? "");
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: whOpen,
				onOpenChange: setWhOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editWh ? "Modifier l'entrepôt" : "Nouvel entrepôt" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						saveWarehouse.mutate();
					},
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: whName,
								onChange: (e) => setWhName(e.target.value),
								placeholder: "Entrepôt Nord",
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: whCode,
								onChange: (e) => setWhCode(e.target.value),
								placeholder: "ENK"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Adresse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: whAddress,
								onChange: (e) => setWhAddress(e.target.value),
								rows: 2
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: whActive,
								onCheckedChange: setWhActive
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Actif" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => setWhOpen(false),
							children: "Annuler"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: saveWarehouse.isPending,
							children: saveWarehouse.isPending ? "..." : "Enregistrer"
						})] })
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: locOpen,
				onOpenChange: setLocOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editLoc ? "Modifier l'emplacement" : "Nouvel emplacement" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							saveLocation.mutate();
						},
						className: "grid gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: locName,
									onChange: (e) => setLocName(e.target.value),
									placeholder: "Rack A-12",
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Entrepôt *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: locWh,
									onValueChange: setLocWh,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un entrepôt" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: warehouses.filter((w) => w.is_active).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: w.id,
										children: w.name
									}, w.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Zone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: locZone,
											onChange: (e) => setLocZone(e.target.value),
											placeholder: "Zone A"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Allée" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: locAisle,
											onChange: (e) => setLocAisle(e.target.value),
											placeholder: "12"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rack" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: locRack,
											onChange: (e) => setLocRack(e.target.value),
											placeholder: "A"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rayon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: locBay,
											onChange: (e) => setLocBay(e.target.value),
											placeholder: "3"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Niveau" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: locLevel,
											onChange: (e) => setLocLevel(e.target.value),
											placeholder: "2"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: locDesc,
									onChange: (e) => setLocDesc(e.target.value),
									rows: 2
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: locActive,
									onCheckedChange: setLocActive
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Actif" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setLocOpen(false),
								children: "Annuler"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: saveLocation.isPending,
								children: saveLocation.isPending ? "..." : "Enregistrer"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: transferOpen,
				onOpenChange: setTransferOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Transfert entre emplacements" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						doTransfer.mutate();
					},
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Produit *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: transferProduct,
								onValueChange: setTransferProduct,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un produit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: p.id,
									children: [
										p.name,
										" (",
										p.sku,
										")"
									]
								}, p.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Depuis *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: fromLoc,
								onValueChange: setFromLoc,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Emplacement source" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: locations.filter((l) => l.is_active).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: l.id,
									children: locationLabel(l)
								}, l.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Vers *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: toLoc,
								onValueChange: setToLoc,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Emplacement destination" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: locations.filter((l) => l.is_active && l.id !== fromLoc).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: l.id,
									children: locationLabel(l)
								}, l.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Quantité *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: "1",
								value: transferQty,
								onChange: (e) => setTransferQty(e.target.value),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => setTransferOpen(false),
							children: "Annuler"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: doTransfer.isPending,
							children: doTransfer.isPending ? "..." : "Transférer"
						})] })
					]
				})] })
			})
		]
	});
}
function locationLabel(loc) {
	return [
		loc.name,
		loc.zone,
		loc.aisle,
		loc.rack,
		loc.bay,
		loc.level
	].filter(Boolean).join(" — ");
}
//#endregion
export { EmplacementsPage as component };
