import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { Bt as ArrowLeftRight, D as Send, Dt as ChevronRight, L as Plus, Lt as Ban, Mt as Camera, Pt as Building2, W as PackageCheck, ct as Funnel, h as Trash2, lt as FileText, t as X, ut as FileDown } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { n as formatDateTime } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as exportToCsv } from "./csv-bEMY3y7g.mjs";
import { t as exportTablePdf } from "./pdf-table-D7ZtlDDS.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { n as Html5Qrcode } from "../_libs/html5-qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transferts-DB7MM-Q3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Construction des jeux de données d'export (CSV / PDF) pour les transferts
* entre entrepôts. Une ligne par ligne de bon (produit / lot / quantités).
*/
var TRANSFER_EXPORT_HEADERS = [
	{
		key: "transfer_number",
		label: "Bon"
	},
	{
		key: "status",
		label: "Statut"
	},
	{
		key: "source",
		label: "Entrepôt source"
	},
	{
		key: "dest",
		label: "Entrepôt destination"
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
		key: "quantity",
		label: "Qté expédiée"
	},
	{
		key: "quantity_received",
		label: "Qté reçue"
	},
	{
		key: "created_by",
		label: "Créé par"
	},
	{
		key: "sent_by",
		label: "Départ validé par"
	},
	{
		key: "received_by",
		label: "Réceptionné par"
	},
	{
		key: "created_at",
		label: "Date"
	},
	{
		key: "notes",
		label: "Notes"
	}
];
function buildTransferExportRows(transfers, statusLabels, userName) {
	const rows = [];
	for (const t of transfers) {
		const items = t.stock_transfer_items ?? [];
		const base = {
			transfer_number: t.transfer_number ?? "",
			status: statusLabels[t.status] ?? t.status ?? "",
			source: t.source?.name ?? "—",
			dest: t.dest?.name ?? "—",
			created_by: userName(t.created_by),
			sent_by: userName(t.sent_by),
			received_by: userName(t.received_by),
			created_at: t.created_at ? formatDateTime(t.created_at) : "",
			notes: t.notes ?? ""
		};
		if (items.length === 0) {
			rows.push({
				...base,
				product: "—",
				sku: "",
				lot: "",
				quantity: "0",
				quantity_received: "0"
			});
			continue;
		}
		for (const i of items) rows.push({
			...base,
			product: i.products?.name ?? "—",
			sku: i.products?.sku ?? "",
			lot: i.lots?.lot_number ?? "",
			quantity: String(Number(i.quantity ?? 0)),
			quantity_received: String(Number(i.quantity_received ?? 0))
		});
	}
	return rows;
}
var statusLabels = {
	brouillon: "Brouillon",
	en_transit: "En transit",
	recu: "Reçu",
	annule: "Annulé"
};
var statusVariant = {
	brouillon: "secondary",
	en_transit: "default",
	recu: "outline",
	annule: "destructive"
};
function TransfertsPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [sourceWh, setSourceWh] = (0, import_react.useState)("");
	const [destWh, setDestWh] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([]);
	const [scanOpen, setScanOpen] = (0, import_react.useState)(false);
	const [manualLot, setManualLot] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [fFrom, setFFrom] = (0, import_react.useState)("");
	const [fTo, setFTo] = (0, import_react.useState)("");
	const [fUser, setFUser] = (0, import_react.useState)("all");
	const [fWarehouse, setFWarehouse] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(20);
	const { data: warehouses = [] } = useQuery({
		queryKey: ["warehouses"],
		queryFn: async () => (await supabase.from("warehouses").select("*").eq("is_active", true).order("name")).data ?? [],
		staleTime: 5 * 6e4
	});
	const { data: profiles = [] } = useQuery({
		queryKey: ["profiles-min"],
		queryFn: async () => (await supabase.from("profiles").select("id, full_name").order("full_name")).data ?? [],
		staleTime: 5 * 6e4
	});
	const userName = (id) => {
		if (!id) return "—";
		return profiles.find((x) => x.id === id)?.full_name ?? `${String(id).slice(0, 8)}…`;
	};
	const { data: transfers = [], isLoading } = useQuery({
		queryKey: [
			"stock-transfers",
			page,
			pageSize
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			const { data, error, count } = await supabase.from("stock_transfers").select("*, source:source_warehouse_id(name), dest:dest_warehouse_id(name), stock_transfer_items(id, quantity, quantity_received, product_id, lot_id, products(name, sku), lots(lot_number))", {
				count: "exact",
				head: false
			}).order("created_at", { ascending: false }).range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const transfersList = transfers?.data ?? [];
	const transfersCount = transfers?.count ?? 0;
	const filtered = (0, import_react.useMemo)(() => {
		return transfersList.filter((t) => {
			const created = t.created_at ? new Date(t.created_at) : null;
			if (fFrom && created && created < /* @__PURE__ */ new Date(`${fFrom}T00:00:00`)) return false;
			if (fTo && created && created > /* @__PURE__ */ new Date(`${fTo}T23:59:59`)) return false;
			if (fUser !== "all" && ![
				t.created_by,
				t.sent_by,
				t.received_by
			].includes(fUser)) return false;
			if (fWarehouse !== "all" && t.source_warehouse_id !== fWarehouse && t.dest_warehouse_id !== fWarehouse) return false;
			return true;
		});
	}, [
		transfersList,
		fFrom,
		fTo,
		fUser,
		fWarehouse
	]);
	const exportRows = () => buildTransferExportRows(filtered, statusLabels, userName);
	const filterSubtitle = () => {
		const parts = [];
		if (fFrom || fTo) parts.push(`Période : ${fFrom || "début"} → ${fTo || "aujourd'hui"}`);
		if (fUser !== "all") parts.push(`Magasinier : ${userName(fUser)}`);
		if (fWarehouse !== "all") parts.push(`Entrepôt : ${warehouses.find((w) => w.id === fWarehouse)?.name ?? fWarehouse}`);
		return parts.length > 0 ? parts.join(" · ") : "Tous les transferts";
	};
	const handleExportCsv = () => {
		const rows = exportRows();
		if (rows.length === 0) return toast.error("Aucun transfert à exporter avec ces filtres");
		exportToCsv(TRANSFER_EXPORT_HEADERS, rows, `transferts-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		toast.success(`${rows.length} ligne(s) exportée(s) en CSV`);
	};
	const handleExportPdf = async () => {
		const rows = exportRows();
		if (rows.length === 0) return toast.error("Aucun transfert à exporter avec ces filtres");
		const totalSent = rows.reduce((s, r) => s + Number(r.quantity || 0), 0);
		const totalReceived = rows.reduce((s, r) => s + Number(r.quantity_received || 0), 0);
		await exportTablePdf({
			title: "Transferts entre entrepôts",
			subtitle: filterSubtitle(),
			headers: TRANSFER_EXPORT_HEADERS.map((h) => h.label),
			rows: rows.map((r) => TRANSFER_EXPORT_HEADERS.map((h) => r[h.key])),
			filename: `transferts-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`,
			landscape: true,
			footerNote: `${filtered.length} bon(s) — ${rows.length} ligne(s) · Total expédié : ${totalSent} · Total reçu : ${totalReceived}`
		});
		toast.success("PDF généré");
	};
	/**
	* Contrôles au scan :
	*  1. quantité entière strictement positive ;
	*  2. numéro de série obligatoire si le lot est suivi unitairement ;
	*  3. lot présent dans l'entrepôt source et stock disponible suffisant ;
	*  4. messages d'erreur explicites (jamais d'ajout silencieux).
	*/
	async function resolveLot(code) {
		const value = code.trim();
		if (!value) {
			toast.error("Scannez ou saisissez un numéro de lot ou de série");
			return;
		}
		const qtyNum = Number(qty);
		if (!Number.isFinite(qtyNum) || !Number.isInteger(qtyNum) || qtyNum <= 0) {
			toast.error("Quantité invalide : saisissez un nombre entier supérieur à 0");
			return;
		}
		const { data: serialRow } = await supabase.from("serial_numbers").select("id, serial, status, lot_id, product_id, warehouse_id, products(name), lots(lot_number)").eq("serial", value).limit(1).maybeSingle();
		if (serialRow) {
			if (serialRow.status !== "en_stock") {
				toast.error(`Numéro de série ${serialRow.serial} non transférable (statut : ${serialRow.status.replace("_", " ")})`);
				return;
			}
			if (sourceWh && serialRow.warehouse_id && serialRow.warehouse_id !== sourceWh) {
				toast.error(`Le numéro de série ${serialRow.serial} n'est pas dans l'entrepôt source`);
				return;
			}
			if (!sourceWh && serialRow.warehouse_id) setSourceWh(serialRow.warehouse_id);
			if (lines.some((l) => l.serial === serialRow.serial)) {
				toast.error(`Numéro de série déjà ajouté : ${serialRow.serial}`);
				return;
			}
			setLines((prev) => [...prev, {
				product_id: serialRow.product_id,
				lot_id: serialRow.lot_id,
				quantity: 1,
				serial: serialRow.serial,
				label: `${serialRow.products?.name ?? "Produit"} — S/N ${serialRow.serial}${serialRow.lots?.lot_number ? ` (Lot ${serialRow.lots.lot_number})` : ""}`
			}]);
			toast.success(`Numéro de série ajouté : ${serialRow.serial}`);
			setManualLot("");
			setQty("1");
			return;
		}
		const { data } = await supabase.from("lots").select("id, lot_number, product_id, warehouse_id, products(name, sku)").or(`lot_number.eq.${value},id.eq.${value}`).limit(1).maybeSingle();
		if (!data) {
			toast.error(`Aucun lot ni numéro de série ne correspond à « ${value} »`);
			return;
		}
		if (sourceWh && data.warehouse_id && data.warehouse_id !== sourceWh) {
			toast.error("Ce lot n'appartient pas à l'entrepôt source sélectionné");
			return;
		}
		if (!sourceWh && data.warehouse_id) setSourceWh(data.warehouse_id);
		const { count: serialCount } = await supabase.from("serial_numbers").select("id", {
			count: "exact",
			head: true
		}).eq("lot_id", data.id).eq("status", "en_stock");
		if ((serialCount ?? 0) > 0) {
			toast.error(`Lot ${data.lot_number} suivi par numéro de série : scannez les numéros de série un par un (${serialCount} en stock)`);
			return;
		}
		const { data: stockRow } = await supabase.from("lot_stock").select("*").eq("lot_id", data.id).limit(1).maybeSingle();
		const available = stockRow?.current_quantity != null ? Number(stockRow.current_quantity) : null;
		const already = lines.filter((l) => l.lot_id === data.id).reduce((s, l) => s + l.quantity, 0);
		if (available != null && already + qtyNum > available) {
			toast.error(`Stock insuffisant sur le lot ${data.lot_number} : ${available} disponible(s), ${already + qtyNum} demandé(s)`);
			return;
		}
		setLines((prev) => {
			if (prev.find((l) => l.lot_id === data.id && !l.serial)) return prev.map((l) => l.lot_id === data.id && !l.serial ? {
				...l,
				quantity: l.quantity + qtyNum,
				available
			} : l);
			return [...prev, {
				product_id: data.product_id,
				lot_id: data.id,
				quantity: qtyNum,
				available,
				label: `${data.products?.name ?? "Produit"} — Lot ${data.lot_number}`
			}];
		});
		toast.success(`Ajouté : ${data.lot_number} × ${qtyNum}`);
		setManualLot("");
	}
	const createTransfer = useMutation({
		mutationFn: async () => {
			if (!sourceWh || !destWh) throw new Error("Entrepôt source et destination requis");
			if (sourceWh === destWh) throw new Error("Les entrepôts doivent être différents");
			if (lines.length === 0) throw new Error("Ajoutez au moins une ligne");
			const { data: userRes } = await supabase.auth.getUser();
			const { data: numberData, error: numErr } = await supabase.rpc("generate_transfer_number");
			if (numErr) throw numErr;
			const { data: transfer, error } = await supabase.from("stock_transfers").insert({
				transfer_number: numberData,
				source_warehouse_id: sourceWh,
				dest_warehouse_id: destWh,
				notes: notes.trim() || null,
				created_by: userRes.user?.id
			}).select("id, transfer_number").single();
			if (error) throw error;
			const { error: itemsErr } = await supabase.from("stock_transfer_items").insert(lines.map((l) => ({
				transfer_id: transfer.id,
				product_id: l.product_id,
				lot_id: l.lot_id,
				quantity: l.quantity
			})));
			if (itemsErr) throw itemsErr;
			return transfer;
		},
		onSuccess: (t) => {
			toast.success(`Bon de transfert ${t.transfer_number} créé`);
			notify.info("Transfert créé", `Bon ${t.transfer_number} en brouillon`);
			setOpen(false);
			setLines([]);
			setNotes("");
			qc.invalidateQueries({ queryKey: ["stock-transfers"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	/** Validation entrepôt source : sortie du stock + statut en transit */
	const sendTransfer = useMutation({
		mutationFn: async (t) => {
			const { data: userRes } = await supabase.auth.getUser();
			const uid = userRes.user?.id;
			const items = t.stock_transfer_items ?? [];
			const { error: movErr } = await supabase.from("stock_movements").insert(items.map((i) => ({
				product_id: i.product_id,
				lot_id: i.lot_id,
				type: "sortie",
				quantity: i.quantity,
				reason: `Transfert ${t.transfer_number} vers ${t.dest?.name ?? "autre entrepôt"}`,
				warehouse_id: t.source_warehouse_id,
				created_by: uid
			})));
			if (movErr) throw movErr;
			const { error } = await supabase.from("stock_transfers").update({
				status: "en_transit",
				sent_by: uid,
				sent_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", t.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Transfert validé et expédié");
			qc.invalidateQueries({ queryKey: ["stock-transfers"] });
			qc.invalidateQueries({ queryKey: ["lot_stock"] });
			qc.invalidateQueries({ queryKey: ["movements"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	/** Validation entrepôt destination : entrée en stock + statut reçu */
	const receiveTransfer = useMutation({
		mutationFn: async (t) => {
			const { data: userRes } = await supabase.auth.getUser();
			const uid = userRes.user?.id;
			const items = t.stock_transfer_items ?? [];
			const { error: movErr } = await supabase.from("stock_movements").insert(items.map((i) => ({
				product_id: i.product_id,
				lot_id: i.lot_id,
				type: "entree",
				quantity: i.quantity,
				reason: `Transfert ${t.transfer_number} reçu de ${t.source?.name ?? "autre entrepôt"}`,
				warehouse_id: t.dest_warehouse_id,
				created_by: uid
			})));
			if (movErr) throw movErr;
			for (const i of items) {
				await supabase.from("stock_transfer_items").update({ quantity_received: i.quantity }).eq("id", i.id);
				if (i.lot_id) await supabase.from("lots").update({
					warehouse_id: t.dest_warehouse_id,
					location_id: null
				}).eq("id", i.lot_id);
			}
			const { error } = await supabase.from("stock_transfers").update({
				status: "recu",
				received_by: uid,
				received_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", t.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Réception confirmée");
			notify.success("Transfert reçu", "Le stock a été rattaché à l'entrepôt destination");
			qc.invalidateQueries({ queryKey: ["stock-transfers"] });
			qc.invalidateQueries({ queryKey: ["lot_stock"] });
			qc.invalidateQueries({ queryKey: ["lots"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const cancelTransfer = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("stock_transfers").update({ status: "annule" }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Transfert annulé");
			qc.invalidateQueries({ queryKey: ["stock-transfers"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Transferts entre entrepôts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Bon de transfert, scan QR des lots et double validation source / destination."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: handleExportCsv,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: handleExportPdf,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-1 size-4" }), " PDF"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => setOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouveau transfert"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4" }), " Filtres (appliqués à la liste et aux exports)"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Du"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: fFrom,
							onChange: (e) => setFFrom(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Au"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: fTo,
							onChange: (e) => setFTo(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Magasinier"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: fUser,
							onValueChange: setFUser,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "Tous"
							}), profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p.id,
								children: p.full_name ?? p.id.slice(0, 8)
							}, p.id))] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Entrepôt (source ou destination)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: fWarehouse,
							onValueChange: setFWarehouse,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "Tous"
							}), warehouses.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: w.id,
								children: w.name
							}, w.id))] })]
						})]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Chargement…"
					}),
					!isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "mb-2 size-8 text-muted-foreground/40" }), "Aucun transfert ne correspond aux filtres."]
					}),
					filtered.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransferCard, {
						transfer: t,
						canSend: sendTransfer.isPending,
						canReceive: receiveTransfer.isPending,
						onSend: sendTransfer.mutate,
						onReceive: receiveTransfer.mutate,
						onCancel: cancelTransfer.mutate
					}, t.id)),
					!isLoading && filtered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
						page,
						pageSize,
						total: transfersCount,
						onPageChange: setPage,
						onPageSizeChange: setPageSize
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouveau bon de transfert" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Source *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: sourceWh,
											onValueChange: setSourceWh,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Entrepôt source" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: warehouses.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: w.id,
												children: w.name
											}, w.id)) })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Destination *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: destWh,
											onValueChange: setDestWh,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Entrepôt destination" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: warehouses.filter((w) => w.id !== sourceWh).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: w.id,
												children: w.name
											}, w.id)) })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ajouter un lot ou un numéro de série (scan ou saisie)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: manualLot,
												onChange: (e) => setManualLot(e.target.value),
												placeholder: "N° de lot ou n° de série",
												onKeyDown: (e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														resolveLot(manualLot);
													}
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: "1",
												className: "w-20",
												value: qty,
												onChange: (e) => setQty(e.target.value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												variant: "outline",
												onClick: () => resolveLot(manualLot),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												variant: "outline",
												onClick: () => setScanOpen(true),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" })
											})
										]
									})]
								}),
								lines.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-1",
									children: lines.map((l, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "truncate",
											children: [l.label, l.available != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-1 text-xs text-muted-foreground",
												children: [
													"(dispo : ",
													l.available,
													")"
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: l.quantity
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setLines((prev) => prev.filter((_, i) => i !== idx)),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-destructive" })
											})]
										})]
									}, `${l.lot_id}-${idx}`))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										value: notes,
										onChange: (e) => setNotes(e.target.value),
										rows: 2
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Annuler"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => createTransfer.mutate(),
							disabled: createTransfer.isPending,
							children: createTransfer.isPending ? "..." : "Créer le bon"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrScanDialog, {
				open: scanOpen,
				onClose: () => setScanOpen(false),
				onScan: (code) => {
					setScanOpen(false);
					resolveLot(code);
				}
			})
		]
	});
}
/**
* Carte de transfert mémoïsée : évite de re-rendre toutes les cartes
* quand une seule action (envoi, réception, annulation) est en cours.
*/
var TransferCard = (0, import_react.memo)(function TransferCard({ transfer, canSend, canReceive, onSend, onReceive, onCancel }) {
	const t = transfer;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-row flex-wrap items-center justify-between gap-2 space-y-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-sm font-semibold",
				children: [t.transfer_number, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: statusVariant[t.status] ?? "secondary",
					children: statusLabels[t.status] ?? t.status
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3" }),
					t.source?.name ?? "—",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" }),
					t.dest?.name ?? "—",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2",
						children: formatDateTime(t.created_at)
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [
				t.status === "brouillon" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => onSend(t),
					disabled: canSend,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-1 size-3.5" }), " Valider départ"]
				}),
				t.status === "en_transit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => onReceive(t),
					disabled: canReceive,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "mr-1 size-3.5" }), " Valider réception"]
				}),
				(t.status === "brouillon" || t.status === "en_transit") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => onCancel(t.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "mr-1 size-3.5" }), " Annuler"]
				})
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1 text-sm",
		children: (t.stock_transfer_items ?? []).map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "truncate",
				children: [i.products?.name, i.lots?.lot_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: [" — Lot ", i.lots.lot_number]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: Number(i.quantity)
			})]
		}, i.id))
	}), t.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-xs text-muted-foreground",
		children: t.notes
	})] })] });
});
function QrScanDialog({ open, onClose, onScan }) {
	const ref = (0, import_react.useRef)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		let stopped = false;
		const scanner = new Html5Qrcode("transfer-qr-reader");
		ref.current = scanner;
		scanner.start({ facingMode: "environment" }, {
			fps: 10,
			qrbox: {
				width: 240,
				height: 240
			}
		}, (decoded) => {
			if (stopped) return;
			stopped = true;
			onScan(decoded);
		}, () => {}).catch(() => setError("Impossible d'accéder à la caméra"));
		return () => {
			stopped = true;
			scanner.stop().catch(() => {});
			ref.current = null;
		};
	}, [open, onScan]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col bg-background/95 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "Scanner un lot"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onClose,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "transfer-qr-reader",
				className: "mx-auto mt-4 w-full max-w-sm"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-sm text-destructive",
				children: error
			})
		]
	});
}
//#endregion
export { TransfertsPage as component };
