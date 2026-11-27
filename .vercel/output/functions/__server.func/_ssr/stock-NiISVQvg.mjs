import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { B as Pencil, Ct as CircleArrowUp, J as MapPin, h as Trash2, ut as FileDown, wt as CircleArrowDown } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { n as formatDateTime, r as formatXOF } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CmIv1W53.mjs";
import { t as exportToCsv } from "./csv-bEMY3y7g.mjs";
import { t as exportTablePdf } from "./pdf-table-D7ZtlDDS.mjs";
import { t as checkAndNotifyAlerts } from "./use-stock-alerts-mO5rUefU.mjs";
import { n as useRealtimeSubscription, t as LiveBadge } from "./use-realtime-Sd5YTUEj.mjs";
import { t as useWarehouseFilter } from "./warehouse-filter-DuSqDZ_e.mjs";
import { n as useViewMode, r as viewGridClass, t as ViewModeToggle } from "./view-mode-toggle-CMF486cj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stock-NiISVQvg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOVEMENTS_PAGE_SIZE = 30;
function StockPage() {
	const qc = useQueryClient();
	const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
	const [type, setType] = (0, import_react.useState)(null);
	const [editMovement, setEditMovement] = (0, import_react.useState)(null);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(MOVEMENTS_PAGE_SIZE);
	const [locationFilter, setLocationFilter] = (0, import_react.useState)("");
	const [dateFrom, setDateFrom] = (0, import_react.useState)("");
	const [dateTo, setDateTo] = (0, import_react.useState)("");
	const [userFilter, setUserFilter] = (0, import_react.useState)("");
	const { mode: viewMode, setMode: setViewMode } = useViewMode("stock", "list");
	const rtMovements = useRealtimeSubscription({ table: "stock_movements" }, { onPayload: () => {
		qc.invalidateQueries({ queryKey: ["movements"] });
		qc.invalidateQueries({ queryKey: ["lot_stock"] });
		checkAndNotifyAlerts();
	} });
	const { data: locations = [] } = useQuery({
		queryKey: ["stock-locations", selectedWarehouseId],
		queryFn: async () => {
			let q = supabase.from("stock_locations").select("*, warehouses(name)").order("name");
			q = applyFilter(q, "warehouse_id");
			const { data } = await q;
			return data ?? [];
		}
	});
	const { data: profiles = [] } = useQuery({
		queryKey: ["profiles", "min"],
		queryFn: async () => (await supabase.from("profiles").select("id, full_name").order("full_name")).data ?? []
	});
	const { data: movementsData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"movements",
			page,
			pageSize,
			locationFilter,
			dateFrom,
			dateTo,
			userFilter,
			selectedWarehouseId
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			let query = supabase.from("stock_movements").select("*, products!left(name, sku), lots!left(lot_number), stock_locations!left(name)", {
				count: "exact",
				head: false
			});
			query = applyFilter(query, "warehouse_id");
			if (locationFilter) query = query.eq("location_id", locationFilter);
			if (userFilter) query = query.eq("created_by", userFilter);
			if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00`);
			if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59`);
			const result = await query.order("created_at", { ascending: false }).range(from, to);
			if (result.error) throw result.error;
			return {
				data: result.data ?? [],
				count: result.count ?? 0
			};
		}
	});
	const movements = movementsData.data;
	const totalMovements = movementsData.count;
	const refreshAll = () => {
		qc.invalidateQueries({ queryKey: ["movements"] });
		qc.invalidateQueries({ queryKey: ["lot_stock"] });
		qc.invalidateQueries({ queryKey: ["stock-alerts"] });
		checkAndNotifyAlerts();
	};
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("stock_movements").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Mouvement supprimé");
			refreshAll();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const fetchFiltered = async () => {
		let q = supabase.from("stock_movements").select("*, products!left(name, sku), lots!left(lot_number), stock_locations!left(name)").order("created_at", { ascending: false });
		q = applyFilter(q, "warehouse_id");
		if (locationFilter) q = q.eq("location_id", locationFilter);
		if (userFilter) q = q.eq("created_by", userFilter);
		if (dateFrom) q = q.gte("created_at", `${dateFrom}T00:00:00`);
		if (dateTo) q = q.lte("created_at", `${dateTo}T23:59:59`);
		const { data, error } = await q;
		if (error) throw error;
		const byUser = new Map(profiles.map((p) => [p.id, p.full_name]));
		return (data ?? []).map((m) => ({
			date: formatDateTime(m.created_at),
			type: m.type,
			product: m.products?.name ?? "",
			sku: m.products?.sku ?? "",
			lot: m.lots?.lot_number ?? "",
			location: m.stock_locations?.name ?? "",
			magasinier: byUser.get(m.created_by) ?? "",
			quantity: String(m.quantity),
			unit_price: m.unit_price ? formatXOF(Number(m.unit_price)) : "",
			total: m.unit_price ? formatXOF(Number(m.unit_price) * Number(m.quantity)) : "",
			reason: m.reason ?? ""
		}));
	};
	const EXPORT_HEADERS = [
		{
			key: "date",
			label: "Date"
		},
		{
			key: "type",
			label: "Type"
		},
		{
			key: "product",
			label: "Produit"
		},
		{
			key: "sku",
			label: "SKU"
		},
		{
			key: "lot",
			label: "Lot"
		},
		{
			key: "location",
			label: "Emplacement"
		},
		{
			key: "magasinier",
			label: "Magasinier"
		},
		{
			key: "quantity",
			label: "Quantité"
		},
		{
			key: "unit_price",
			label: "PU"
		},
		{
			key: "total",
			label: "Total"
		},
		{
			key: "reason",
			label: "Motif"
		}
	];
	const periodLabel = () => `Période : ${dateFrom || "début"} → ${dateTo || "aujourd'hui"}` + (userFilter ? ` — Magasinier : ${profiles.find((p) => p.id === userFilter)?.full_name ?? ""}` : "");
	const handleExportCsv = async () => {
		try {
			const rows = await fetchFiltered();
			exportToCsv(EXPORT_HEADERS, rows, `stock-mouvements-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		} catch {
			toast.error("Erreur lors de l'export");
		}
	};
	const handleExportPdf = async () => {
		try {
			const rows = await fetchFiltered();
			await exportTablePdf({
				title: "Mouvements de stock",
				subtitle: periodLabel(),
				headers: EXPORT_HEADERS.map((h) => h.label),
				rows: rows.map((r) => EXPORT_HEADERS.map((h) => r[h.key] ?? "")),
				filename: `stock-mouvements-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`,
				landscape: true,
				footerNote: `${rows.length} mouvement(s) exporté(s).`
			});
		} catch {
			toast.error("Erreur lors de l'export");
		}
	};
	const openEdit = (movement) => {
		setEditMovement(movement);
	};
	const closeEdit = () => {
		setEditMovement(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Stock"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Mouvements d'entrée et de sortie."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveBadge, { status: rtMovements.status }),
						locations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: locationFilter,
							onValueChange: (v) => {
								setLocationFilter(v);
								setPage(1);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
								className: "h-8 w-44",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mr-1 size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Tous les emplacements" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "",
								children: "Tous les emplacements"
							}), locations.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: l.id,
								children: l.name
							}, l.id))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							className: "h-8 w-36",
							value: dateFrom,
							onChange: (e) => {
								setDateFrom(e.target.value);
								setPage(1);
							},
							title: "Date de début"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							className: "h-8 w-36",
							value: dateTo,
							onChange: (e) => {
								setDateTo(e.target.value);
								setPage(1);
							},
							title: "Date de fin"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: userFilter,
							onValueChange: (v) => {
								setUserFilter(v);
								setPage(1);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 w-40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Tous les magasiniers" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "",
								children: "Tous les magasiniers"
							}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p.id,
								children: p.full_name ?? p.id.slice(0, 8)
							}, p.id))] })]
						}),
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
							onClick: handleExportPdf,
							title: "Exporter en PDF",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), "PDF"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
							open: type === "entree",
							onOpenChange: (o) => setType(o ? "entree" : null),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowDown, { className: "mr-1 size-4 text-emerald-600" }), " Entrée"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementForm, {
								kind: "entree",
								onClose: () => setType(null),
								onDone: () => {
									refreshAll();
									setType(null);
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
							open: type === "sortie",
							onOpenChange: (o) => setType(o ? "sortie" : null),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowUp, { className: "mr-1 size-4" }), " Sortie"] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementForm, {
								kind: "sortie",
								onClose: () => setType(null),
								onDone: () => {
									refreshAll();
									setType(null);
								}
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [totalMovements, " mouvement(s)"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewModeToggle, {
					mode: viewMode,
					onChange: setViewMode
				})]
			}),
			movements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border border-border bg-card py-10 text-center text-sm text-muted-foreground",
				children: "Aucun mouvement."
			}) : viewMode === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Lot" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Emplacement" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Quantité"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "PU"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Motif" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: movements.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "animate-row-enter",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm",
							children: formatDateTime(m.created_at)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementTypeBadge, { type: m.type }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: m.products?.name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: m.lots?.lot_number ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground",
							children: m.stock_locations?.name || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: Number(m.quantity)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: m.unit_price ? formatXOF(Number(m.unit_price)) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm text-muted-foreground",
							children: m.reason ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementActions, {
								movement: m,
								onEdit: openEdit,
								onDelete: (id) => del.mutate(id)
							})
						})
					]
				}, m.id)) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalMovements,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: viewGridClass(viewMode),
					children: movements.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementCard, {
						movement: m,
						mode: viewMode,
						onEdit: openEdit,
						onDelete: (id) => del.mutate(id)
					}, m.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border border-border bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
						page,
						pageSize,
						total: totalMovements,
						onPageChange: setPage,
						onPageSizeChange: setPageSize
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!editMovement,
				onOpenChange: (o) => {
					if (!o) closeEdit();
				},
				children: editMovement && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementForm, {
					movement: editMovement,
					kind: editMovement.type,
					onClose: closeEdit,
					onDone: () => {
						refreshAll();
						closeEdit();
					}
				})
			})
		]
	});
}
function MovementForm({ kind, movement, onClose, onDone }) {
	const isEdit = !!movement;
	const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
	const [productId, setProductId] = (0, import_react.useState)(movement?.product_id ?? "");
	const [lotId, setLotId] = (0, import_react.useState)(movement?.lot_id ?? "");
	const [quantity, setQuantity] = (0, import_react.useState)(movement?.quantity?.toString() ?? "1");
	const [unitPrice, setUnitPrice] = (0, import_react.useState)(movement?.unit_price?.toString() ?? "");
	const [reason, setReason] = (0, import_react.useState)(movement?.reason ?? "");
	const [locationId, setLocationId] = (0, import_react.useState)(movement?.location_id ?? "");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { data: products = [] } = useQuery({
		queryKey: ["products", "min"],
		queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? []
	});
	const { data: locations = [] } = useQuery({
		queryKey: ["stock-locations", selectedWarehouseId],
		queryFn: async () => {
			let q = supabase.from("stock_locations").select("*").eq("is_active", true).order("name");
			q = applyFilter(q, "warehouse_id");
			const { data } = await q;
			return data ?? [];
		}
	});
	const { data: lots = [] } = useQuery({
		queryKey: [
			"lots",
			productId,
			selectedWarehouseId
		],
		enabled: !!productId,
		queryFn: async () => {
			let q = supabase.from("lots").select("id, lot_number").eq("product_id", productId);
			q = applyFilter(q, "warehouse_id");
			const { data } = await q.order("reception_date", { ascending: false });
			return data ?? [];
		}
	});
	const resolvedWarehouseId = () => {
		if (locationId) {
			const loc = locations.find((l) => l.id === locationId);
			if (loc?.warehouse_id) return loc.warehouse_id;
		}
		return selectedWarehouseId && selectedWarehouseId !== "all" ? selectedWarehouseId : null;
	};
	const submit = useMutation({
		mutationFn: async () => {
			setBusy(true);
			const warehouseId = resolvedWarehouseId();
			if (isEdit) {
				const { error } = await supabase.from("stock_movements").update({
					product_id: productId,
					lot_id: lotId || null,
					location_id: locationId || null,
					warehouse_id: warehouseId,
					type: kind,
					quantity: Number(quantity),
					unit_price: unitPrice ? Number(unitPrice) : null,
					reason: reason || null
				}).eq("id", movement.id);
				if (error) throw error;
			} else {
				const { data: userRes } = await supabase.auth.getUser();
				const { error } = await supabase.from("stock_movements").insert({
					product_id: productId,
					lot_id: lotId || null,
					location_id: locationId || null,
					warehouse_id: warehouseId,
					type: kind,
					quantity: Number(quantity),
					unit_price: unitPrice ? Number(unitPrice) : null,
					reason: reason || null,
					created_by: userRes.user?.id
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(isEdit ? "Mouvement modifié" : `${kind === "entree" ? "Entrée" : "Sortie"} enregistrée`);
			onDone();
		},
		onError: (e) => toast.error(e.message ?? "Erreur"),
		onSettled: () => setBusy(false)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Modifier le mouvement" : kind === "entree" ? "Entrée de stock" : "Sortie de stock" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			if (!productId) return;
			submit.mutate();
		},
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Produit *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: productId,
					onValueChange: (v) => {
						setProductId(v);
						setLotId("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
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
			locations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Emplacement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: locationId,
					onValueChange: setLocationId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Non spécifié" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "",
						children: "Non spécifié"
					}), locations.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: l.id,
						children: l.name
					}, l.id))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Lot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: lotId,
					onValueChange: setLotId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: productId ? "Choisir un lot" : "Choisir un produit d'abord" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: lots.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: l.id,
						children: l.lot_number
					}, l.id)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Quantité *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						step: "0.001",
						value: quantity,
						onChange: (e) => setQuantity(e.target.value),
						required: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prix unitaire" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						step: "0.01",
						value: unitPrice,
						onChange: (e) => setUnitPrice(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Motif" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: reason,
					onChange: (e) => setReason(e.target.value),
					placeholder: kind === "entree" ? "Réception fournisseur, ajustement..." : "Vente, casse, retour..."
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
				children: busy ? "..." : isEdit ? "Modifier" : "Enregistrer"
			})] })
		]
	})] });
}
function MovementTypeBadge({ type }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${type === "entree" ? "bg-emerald-500/10 text-emerald-600" : type === "sortie" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`,
		children: type
	});
}
function MovementActions({ movement: m, onEdit, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-end gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => onEdit(m),
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
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Supprimer le mouvement ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
			"Êtes-vous sûr de vouloir supprimer ce mouvement du",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatDateTime(m.created_at) }),
			" (",
			m.type,
			") ? Cette action est irréversible."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Annuler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: () => onDelete(m.id),
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: "Supprimer"
		})] })] })] })]
	});
}
function MovementCard({ movement: m, mode, onEdit, onDelete }) {
	const isIn = m.type === "entree";
	const Icon = isIn ? CircleArrowDown : CircleArrowUp;
	const tone = isIn ? "text-emerald-600" : "text-accent";
	if (mode === "mosaic") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1 rounded-lg border bg-card p-2 text-center",
		title: m.products?.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-6 ${tone}` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "line-clamp-2 text-[11px] font-medium leading-tight",
				children: m.products?.name ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-semibold",
				children: Number(m.quantity)
			})
		]
	});
	if (mode === "details") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-6 shrink-0 ${tone}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: m.products?.name ?? "—"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: formatDateTime(m.created_at)
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementActions, {
					movement: m,
					onEdit,
					onDelete
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Type : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementTypeBadge, { type: m.type })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Quantité : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: Number(m.quantity)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["PU : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: m.unit_price ? formatXOF(Number(m.unit_price)) : "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Lot : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-foreground",
						children: m.lots?.lot_number ?? "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Emplacement : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: m.stock_locations?.name || "—"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["SKU : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-foreground",
						children: m.products?.sku ?? "—"
					})] })
				]
			}),
			m.reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 line-clamp-2 text-xs text-muted-foreground",
				children: ["Motif : ", m.reason]
			})
		]
	});
	const isXl = mode === "xl-icons";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 rounded-lg border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `${isXl ? "size-10" : "size-6"} ${tone}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementTypeBadge, { type: m.type })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `line-clamp-2 font-medium leading-tight ${isXl ? "text-base" : "text-sm"}`,
				children: m.products?.name ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: formatDateTime(m.created_at)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `font-semibold ${isXl ? "text-lg" : "text-sm"}`,
					children: Number(m.quantity)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: m.unit_price ? formatXOF(Number(m.unit_price)) : "—"
				})]
			}),
			isXl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground",
				children: [
					"Lot ",
					m.lots?.lot_number ?? "—",
					" · ",
					m.stock_locations?.name || "Sans emplacement"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovementActions, {
				movement: m,
				onEdit,
				onDelete
			})
		]
	});
}
//#endregion
export { StockPage as component };
