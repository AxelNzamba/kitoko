import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { L as Plus, W as PackageCheck, h as Trash2, t as X, ut as FileDown } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { r as formatXOF, t as formatDate } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { t as exportToCsv } from "./csv-bEMY3y7g.mjs";
import { t as exportTablePdf } from "./pdf-table-D7ZtlDDS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/commandes-fournisseurs-BSy6bSCZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PO_PAGE_SIZE = 20;
var STATUSES = [
	{
		value: "brouillon",
		label: "Brouillon"
	},
	{
		value: "envoyee",
		label: "Envoyée"
	},
	{
		value: "partielle",
		label: "Réception partielle"
	},
	{
		value: "receptionnee",
		label: "Réceptionnée"
	},
	{
		value: "annulee",
		label: "Annulée"
	}
];
var statusLabel = (v) => STATUSES.find((s) => s.value === v)?.label ?? v;
var totalOf = (o) => (o.purchase_order_items ?? []).reduce((s, i) => s + Number(i.quantity_ordered) * Number(i.unit_price), 0);
var progressOf = (o) => {
	const items = o.purchase_order_items ?? [];
	const ord = items.reduce((s, i) => s + Number(i.quantity_ordered), 0);
	const rec = items.reduce((s, i) => s + Number(i.quantity_received), 0);
	return ord > 0 ? Math.round(rec / ord * 100) : 0;
};
function PurchaseOrdersPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [receiving, setReceiving] = (0, import_react.useState)(null);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(PO_PAGE_SIZE);
	const { data: poData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"purchase_orders",
			page,
			pageSize,
			statusFilter
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			let query = supabase.from("purchase_orders").select("*, suppliers:supplier_id(name), purchase_order_items(id, product_id, quantity_ordered, quantity_received, unit_price, products:product_id(name, sku))", {
				count: "exact",
				head: false
			});
			if (statusFilter !== "all") query = query.eq("status", statusFilter);
			const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const orders = poData.data;
	const totalOrders = poData.count;
	const { data: suppliers = [] } = useQuery({
		queryKey: ["suppliers", "min"],
		queryFn: async () => (await supabase.from("suppliers").select("id, name").order("name")).data ?? [],
		staleTime: 5 * 6e4
	});
	const { data: products = [] } = useQuery({
		queryKey: ["products", "min"],
		queryFn: async () => (await supabase.from("products").select("id, name, sku, purchase_price").order("name")).data ?? [],
		staleTime: 5 * 6e4
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Commande supprimée");
			qc.invalidateQueries({ queryKey: ["purchase_orders"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const setStatus = useMutation({
		mutationFn: async ({ id, status }) => {
			const { error } = await supabase.from("purchase_orders").update({ status }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Statut mis à jour");
			qc.invalidateQueries({ queryKey: ["purchase_orders"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const filtered = (0, import_react.useMemo)(() => orders.filter((o) => statusFilter === "all" || o.status === statusFilter), [orders, statusFilter]);
	const csvHeaders = [
		{
			key: "number",
			label: "N° commande"
		},
		{
			key: "supplier",
			label: "Fournisseur"
		},
		{
			key: "order_date",
			label: "Date commande"
		},
		{
			key: "expected",
			label: "Livraison prévue"
		},
		{
			key: "status",
			label: "Statut"
		},
		{
			key: "progress",
			label: "Réception %"
		},
		{
			key: "total",
			label: "Montant"
		}
	];
	const csvRows = filtered.map((o) => ({
		number: o.po_number,
		supplier: o.suppliers?.name ?? "",
		order_date: formatDate(o.order_date),
		expected: o.expected_date ? formatDate(o.expected_date) : "",
		status: statusLabel(o.status),
		progress: `${progressOf(o)}%`,
		total: formatXOF(totalOf(o))
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Commandes fournisseurs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Création, réception partielle, statut et historique."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: statusFilter,
							onValueChange: setStatusFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 w-44",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Statut" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "Tous les statuts"
							}), STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.value,
								children: s.label
							}, s.value))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => exportToCsv(csvHeaders, csvRows, `commandes-fournisseurs-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => exportTablePdf({
								title: "Commandes fournisseurs",
								headers: csvHeaders.map((h) => h.label),
								rows: csvRows.map((r) => csvHeaders.map((h) => r[h.key] ?? "")),
								filename: `commandes-fournisseurs-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`,
								landscape: true
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " PDF"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
							open,
							onOpenChange: setOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouvelle commande"] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderForm, {
								suppliers,
								products,
								onClose: () => setOpen(false),
								onSaved: () => {
									qc.invalidateQueries({ queryKey: ["purchase_orders"] });
									setOpen(false);
								}
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° commande" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fournisseur" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Commandée le" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Livraison prévue" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Lignes" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Montant"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Réception" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 9,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucune commande fournisseur."
				}) }), filtered.map((o) => {
					progressOf(o);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderRow, {
						order: o,
						onReceive: () => setReceiving(o),
						onDelete: (id) => del.mutate(id),
						onStatus: (id, status) => setStatus.mutate({
							id,
							status
						})
					}, o.id);
				})] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalOrders,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!receiving,
				onOpenChange: (o) => !o && setReceiving(null),
				children: receiving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceptionDialog, {
					order: receiving,
					onDone: () => {
						qc.invalidateQueries({ queryKey: ["purchase_orders"] });
						qc.invalidateQueries({ queryKey: ["movements"] });
						setReceiving(null);
					}
				})
			})
		]
	});
}
function OrderForm({ suppliers, products, onClose, onSaved }) {
	const [supplierId, setSupplierId] = (0, import_react.useState)("");
	const [orderDate, setOrderDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [expected, setExpected] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([{
		product_id: "",
		quantity_ordered: "1",
		unit_price: "0"
	}]);
	const setLine = (i, patch) => setLines((ls) => ls.map((l, idx) => idx === i ? {
		...l,
		...patch
	} : l));
	const total = lines.reduce((s, l) => s + Number(l.quantity_ordered || 0) * Number(l.unit_price || 0), 0);
	const save = useMutation({
		mutationFn: async () => {
			const valid = lines.filter((l) => l.product_id && Number(l.quantity_ordered) > 0);
			if (valid.length === 0) throw new Error("Ajoutez au moins une ligne valide");
			const { data: num, error: numErr } = await supabase.rpc("generate_po_number");
			if (numErr) throw numErr;
			const { data: u } = await supabase.auth.getUser();
			const { data: order, error } = await supabase.from("purchase_orders").insert({
				po_number: num,
				supplier_id: supplierId || null,
				order_date: orderDate,
				expected_date: expected || null,
				notes: notes || null,
				status: "envoyee",
				created_by: u.user?.id
			}).select().single();
			if (error) throw error;
			const { error: itemsErr } = await supabase.from("purchase_order_items").insert(valid.map((l) => ({
				purchase_order_id: order.id,
				product_id: l.product_id,
				quantity_ordered: Number(l.quantity_ordered),
				unit_price: Number(l.unit_price || 0)
			})));
			if (itemsErr) throw itemsErr;
		},
		onSuccess: () => {
			toast.success("Commande créée");
			onSaved();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-3xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouvelle commande fournisseur" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-4",
			onSubmit: (e) => {
				e.preventDefault();
				save.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fournisseur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: supplierId,
								onValueChange: setSupplierId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sélectionner" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s.id,
									children: s.name
								}, s.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date commande" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: orderDate,
								onChange: (e) => setOrderDate(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Livraison prévue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: expected,
								onChange: (e) => setExpected(e.target.value)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Lignes de commande" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2",
							children: lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: l.product_id,
										onValueChange: (v) => {
											const p = products.find((x) => x.id === v);
											setLine(i, {
												product_id: v,
												unit_price: p?.purchase_price ? String(p.purchase_price) : l.unit_price
											});
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "min-w-52 flex-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Produit" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: p.id,
											children: [
												p.name,
												" (",
												p.sku,
												")"
											]
										}, p.id)) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "w-24",
										type: "number",
										step: "0.001",
										value: l.quantity_ordered,
										onChange: (e) => setLine(i, { quantity_ordered: e.target.value }),
										placeholder: "Qté"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "w-28",
										type: "number",
										step: "0.01",
										value: l.unit_price,
										onChange: (e) => setLine(i, { unit_price: e.target.value }),
										placeholder: "PU"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										onClick: () => setLines((ls) => ls.filter((_, idx) => idx !== i)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
									})
								]
							}, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: () => setLines((ls) => [...ls, {
								product_id: "",
								quantity_ordered: "1",
								unit_price: "0"
							}]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Ajouter une ligne"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 2,
						value: notes,
						onChange: (e) => setNotes(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-right text-sm font-semibold",
					children: ["Total : ", formatXOF(total)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: onClose,
					children: "Annuler"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: save.isPending,
					children: "Créer la commande"
				})] })
			]
		})]
	});
}
/**
* Réception partielle : saisie des quantités reçues par ligne.
* Chaque quantité reçue génère un mouvement de stock d'entrée et met à jour
* le statut de la commande (partielle / réceptionnée).
*/
function ReceptionDialog({ order, onDone }) {
	const items = order.purchase_order_items ?? [];
	const [qty, setQty] = (0, import_react.useState)(Object.fromEntries(items.map((i) => [i.id, "0"])));
	const receive = useMutation({
		mutationFn: async () => {
			const { data: u } = await supabase.auth.getUser();
			const toReceive = items.map((i) => ({
				item: i,
				n: Number(qty[i.id] || 0)
			})).filter((x) => x.n > 0);
			if (toReceive.length === 0) throw new Error("Saisissez au moins une quantité reçue");
			for (const { item, n } of toReceive) {
				const newReceived = Number(item.quantity_received) + n;
				const { error } = await supabase.from("purchase_order_items").update({ quantity_received: newReceived }).eq("id", item.id);
				if (error) throw error;
				const { error: mvErr } = await supabase.from("stock_movements").insert({
					product_id: item.product_id,
					type: "entree",
					quantity: n,
					unit_price: Number(item.unit_price) || null,
					reason: `Réception commande ${order.po_number}`,
					created_by: u.user?.id
				});
				if (mvErr) throw mvErr;
			}
			const totalOrdered = items.reduce((s, i) => s + Number(i.quantity_ordered), 0);
			const status = items.reduce((s, i) => s + Number(i.quantity_received) + Number(qty[i.id] || 0), 0) >= totalOrdered ? "receptionnee" : "partielle";
			const { error: stErr } = await supabase.from("purchase_orders").update({ status }).eq("id", order.id);
			if (stErr) throw stErr;
		},
		onSuccess: () => {
			toast.success("Réception enregistrée");
			onDone();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Réception — ", order.po_number] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Commandé"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Déjà reçu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Reste"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "À réceptionner"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: items.map((i) => {
					const rest = Number(i.quantity_ordered) - Number(i.quantity_received);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm",
							children: i.products?.name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right text-xs",
							children: Number(i.quantity_ordered)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right text-xs",
							children: Number(i.quantity_received)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right text-xs",
							children: rest
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "ml-auto h-8 w-24 text-right",
								type: "number",
								min: "0",
								max: rest,
								step: "0.001",
								value: qty[i.id] ?? "0",
								onChange: (e) => setQty((q) => ({
									...q,
									[i.id]: e.target.value
								}))
							})
						})
					] }, i.id);
				}) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => receive.mutate(),
				disabled: receive.isPending,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "mr-1 size-4" }), " Valider la réception"]
			}) })
		]
	});
}
/**
* Ligne de commande mémoïsée : évite de re-rendre toutes les lignes
* quand une seule ligne change (statut, réception…).
*/
var OrderRow = (0, import_react.memo)(function OrderRow({ order, onReceive, onDelete, onStatus }) {
	const pct = progressOf(order);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-mono text-xs",
			children: order.po_number
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: order.suppliers?.name ?? "—" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-xs",
			children: formatDate(order.order_date)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-xs",
			children: order.expected_date ? formatDate(order.expected_date) : "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-xs",
			children: (order.purchase_order_items ?? []).length
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: formatXOF(totalOf(order))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1.5 w-16 overflow-hidden rounded bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-emerald-500",
					style: { width: `${pct}%` }
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted-foreground",
				children: [pct, "%"]
			})]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: order.status,
			onValueChange: (v) => onStatus(order.id, v),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				className: "h-8 w-36 text-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: s.value,
				children: s.label
			}, s.value)) })]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onReceive,
					title: "Réceptionner",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => onDelete(order.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
				})]
			})
		})
	] });
});
//#endregion
export { PurchaseOrdersPage as component };
