import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { B as Pencil, L as Plus, h as Trash2, it as Hash, lt as FileText, ut as FileDown } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { n as formatDateTime, r as formatXOF, t as formatDate } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as objectType, n as literalType, o as stringType, t as coerce } from "../_libs/zod.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CmIv1W53.mjs";
import { t as exportToCsv } from "./csv-bEMY3y7g.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { t as useWarehouseFilter } from "./warehouse-filter-DuSqDZ_e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lots-CktEeBsq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SERIAL_STATUSES = [
	{
		value: "en_stock",
		label: "En stock"
	},
	{
		value: "vendu",
		label: "Vendu"
	},
	{
		value: "retourne",
		label: "Retourné"
	},
	{
		value: "sav",
		label: "SAV"
	},
	{
		value: "rebut",
		label: "Rebut"
	}
];
function serialStatusLabel(v) {
	return SERIAL_STATUSES.find((s) => s.value === v)?.label ?? v;
}
/**
* Gestion des numéros de série d'un lot : liste, ajout unitaire ou en masse,
* changement de statut (vendu / retourné / SAV / rebut) et export CSV.
*/
function SerialNumbersDialog({ lot }) {
	const qc = useQueryClient();
	const [bulk, setBulk] = (0, import_react.useState)("");
	const [prefix, setPrefix] = (0, import_react.useState)(`${lot.lot_number}-`);
	const [count, setCount] = (0, import_react.useState)("10");
	const { data: serials = [] } = useQuery({
		queryKey: ["serials", lot.id],
		queryFn: async () => {
			const { data, error } = await supabase.from("serial_numbers").select("*, clients:client_id(name), sales:sale_id(number)").eq("lot_id", lot.id).order("serial");
			if (error) throw error;
			return data ?? [];
		}
	});
	const refresh = () => qc.invalidateQueries({ queryKey: ["serials", lot.id] });
	const add = useMutation({
		mutationFn: async (list) => {
			if (list.length === 0) throw new Error("Aucun numéro de série valide");
			const { data: u } = await supabase.auth.getUser();
			const rows = list.map((serial) => ({
				lot_id: lot.id,
				product_id: lot.product_id,
				serial,
				status: "en_stock",
				created_by: u.user?.id
			}));
			const { error } = await supabase.from("serial_numbers").insert(rows);
			if (error) throw error;
			return list.length;
		},
		onSuccess: (n) => {
			toast.success(`${n} numéro(s) de série ajouté(s)`);
			setBulk("");
			refresh();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const setStatus = useMutation({
		mutationFn: async ({ id, status }) => {
			const { error } = await supabase.from("serial_numbers").update({ status }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Statut mis à jour");
			refresh();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("serial_numbers").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Numéro supprimé");
			refresh();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const generate = () => {
		const n = Math.max(1, Math.min(500, Number(count) || 0));
		const existing = new Set(serials.map((s) => s.serial));
		const list = [];
		let i = 1;
		while (list.length < n) {
			const candidate = `${prefix}${String(i).padStart(4, "0")}`;
			if (!existing.has(candidate)) list.push(candidate);
			i++;
			if (i > n + 1e3) break;
		}
		add.mutate(list);
	};
	const handleExport = () => {
		exportToCsv([
			{
				key: "serial",
				label: "N° série"
			},
			{
				key: "status",
				label: "Statut"
			},
			{
				key: "client",
				label: "Client"
			},
			{
				key: "sale",
				label: "Vente"
			},
			{
				key: "created_at",
				label: "Créé le"
			}
		], serials.map((s) => ({
			serial: s.serial,
			status: serialStatusLabel(s.status),
			client: s.clients?.name ?? "",
			sale: s.sales?.number ?? "",
			created_at: formatDateTime(s.created_at)
		})), `series-${lot.lot_number}.csv`);
	};
	const counts = SERIAL_STATUSES.map((s) => ({
		...s,
		n: serials.filter((x) => x.status === s.value).length
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Numéros de série — lot ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono",
				children: lot.lot_number
			})] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 text-xs",
				children: counts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded bg-muted px-2 py-1",
					children: [
						c.label,
						" : ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: c.n })
					]
				}, c.value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 rounded-lg border p-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Génération automatique"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: prefix,
								onChange: (e) => setPrefix(e.target.value),
								placeholder: "Préfixe"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "w-20",
								type: "number",
								value: count,
								onChange: (e) => setCount(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								onClick: generate,
								disabled: add.isPending,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Saisie / collage (un par ligne)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							value: bulk,
							onChange: (e) => setBulk(e.target.value),
							placeholder: "SN-0001\nSN-0002"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "outline",
							onClick: () => add.mutate(bulk.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)),
							disabled: add.isPending,
							children: "Ajouter la liste"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[320px] overflow-auto rounded-lg border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° série" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Client" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Vente" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "text-right" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [serials.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "Aucun numéro de série pour ce lot."
				}) }), serials.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: s.serial
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: s.status,
						onValueChange: (v) => setStatus.mutate({
							id: s.id,
							status: v
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 w-32 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SERIAL_STATUSES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: o.value,
							children: o.label
						}, o.value)) })]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: s.clients?.name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: s.sales?.number ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => del.mutate(s.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
						})
					})
				] }, s.id))] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: handleExport,
				disabled: serials.length === 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " Export CSV"]
			}) })
		]
	});
}
var lotSchema = objectType({
	product_id: stringType().min(1, "Le produit est requis"),
	supplier_id: stringType().optional().or(literalType("")),
	warehouse_id: stringType().optional().or(literalType("")),
	location_id: stringType().optional().or(literalType("")),
	lot_number: stringType().trim().min(1, "Le numéro de lot est requis").max(100),
	reception_date: stringType().min(1, "La date est requise"),
	quantity: coerce.number().min(.001, "La quantité doit être positive"),
	unit_purchase_price: coerce.number().min(0, "Le prix doit être positif"),
	notes: stringType().trim().max(2e3).optional().or(literalType(""))
});
var LOTS_PAGE_SIZE = 20;
function LotsPage() {
	const qc = useQueryClient();
	const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editLot, setEditLot] = (0, import_react.useState)(null);
	const [serialLot, setSerialLot] = (0, import_react.useState)(null);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(LOTS_PAGE_SIZE);
	const { data: lotsData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"lots",
			page,
			pageSize,
			selectedWarehouseId
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			let q = supabase.from("lots").select("*, products(name, sku), suppliers(name)", {
				count: "exact",
				head: false
			}).order("reception_date", { ascending: false });
			q = applyFilter(q, "warehouse_id");
			const { data, error, count } = await q.range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const { data: stockView = [] } = useQuery({
		queryKey: ["lot_stock", selectedWarehouseId],
		queryFn: async () => {
			let q;
			if (selectedWarehouseId && selectedWarehouseId !== "all") q = supabase.from("lot_stock_by_warehouse").select("*").eq("warehouse_id", selectedWarehouseId);
			else q = supabase.from("lot_stock").select("*");
			const { data, error } = await q;
			if (error) throw error;
			return data;
		}
	});
	const stockMap = new Map(stockView.map((s) => [s.lot_id, Number(s.current_quantity)]));
	const { data: products = [] } = useQuery({
		queryKey: ["products", "min"],
		queryFn: async () => {
			const { data, error } = await supabase.from("products").select("id, name, sku").order("name");
			if (error) throw error;
			return data;
		}
	});
	const { data: suppliers = [] } = useQuery({
		queryKey: ["suppliers"],
		queryFn: async () => {
			const { data, error } = await supabase.from("suppliers").select("*").order("name");
			if (error) throw error;
			return data;
		}
	});
	const lots = lotsData.data;
	const totalLots = lotsData.count;
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("lots").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Lot supprimé");
			qc.invalidateQueries({ queryKey: ["lots"] });
			qc.invalidateQueries({ queryKey: ["lot_stock"] });
			qc.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const openEdit = (lot) => {
		setEditLot(lot);
		setOpen(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Lots"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Traçabilité par lot avec certificat."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: (o) => {
						setOpen(o);
						if (!o) setEditLot(null);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => setEditLot(null),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouveau lot"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LotForm, {
						products,
						suppliers,
						lot: editLot,
						onClose: () => {
							setOpen(false);
							setEditLot(null);
						},
						onSaved: () => {
							qc.invalidateQueries({ queryKey: ["lots"] });
							qc.invalidateQueries({ queryKey: ["lot_stock"] });
							qc.invalidateQueries({ queryKey: ["suppliers"] });
							setOpen(false);
							setEditLot(null);
						}
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° lot" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fournisseur" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Réception" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Qté init."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Qté restante"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "PU achat"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Certificat" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [lots.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 9,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun lot enregistré."
				}) }), lots.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: l.lot_number
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
						l.products?.name,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								"(",
								l.products?.sku,
								")"
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm",
						children: l.suppliers?.name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm",
						children: formatDate(l.reception_date)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: Number(l.quantity)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right font-semibold",
						children: stockMap.get(l.id) ?? Number(l.quantity)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: formatXOF(Number(l.unit_purchase_price))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: l.certificate_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: l.certificate_url,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex items-center gap-1 text-sm text-accent hover:underline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), " Voir"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "—"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setSerialLot(l),
									title: "Numéros de série",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => openEdit(l),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Supprimer le lot ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
									"Êtes-vous sûr de vouloir supprimer le lot ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: l.lot_number }),
									" ? Cette action est irréversible."
								] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Annuler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
									onClick: () => del.mutate(l.id),
									className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
									children: "Supprimer"
								})] })] })] })
							]
						})
					})
				] }, l.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalLots,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!serialLot,
				onOpenChange: (o) => {
					if (!o) setSerialLot(null);
				},
				children: serialLot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SerialNumbersDialog, { lot: serialLot })
			})
		]
	});
}
function LotForm({ products, suppliers, lot, onClose, onSaved }) {
	const isEdit = !!lot;
	const { selectedWarehouseId } = useWarehouseFilter();
	const [newSupplier, setNewSupplier] = (0, import_react.useState)("");
	const [certFile, setCertFile] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const form = useForm({
		resolver: u(lotSchema),
		defaultValues: {
			product_id: lot?.product_id ?? "",
			supplier_id: lot?.supplier_id ?? "",
			warehouse_id: lot?.warehouse_id ?? (selectedWarehouseId === "all" ? "" : selectedWarehouseId ?? ""),
			location_id: lot?.location_id ?? "",
			lot_number: lot?.lot_number ?? "",
			reception_date: lot?.reception_date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			quantity: lot?.quantity ?? 0,
			unit_purchase_price: lot?.unit_purchase_price ?? 0,
			notes: lot?.notes ?? ""
		}
	});
	const selectedWarehouse = form.watch("warehouse_id");
	const { data: warehouses = [] } = useQuery({
		queryKey: ["warehouses"],
		queryFn: async () => (await supabase.from("warehouses").select("*").order("name")).data ?? []
	});
	const { data: locations = [] } = useQuery({
		queryKey: ["stock-locations", selectedWarehouse],
		enabled: !!selectedWarehouse,
		queryFn: async () => {
			const { data } = await supabase.from("stock_locations").select("*").eq("warehouse_id", selectedWarehouse).eq("is_active", true).order("name");
			return data ?? [];
		}
	});
	const save = useMutation({
		mutationFn: async (values) => {
			setBusy(true);
			let supplier_id = values.supplier_id || null;
			if (!supplier_id && newSupplier.trim()) {
				const { data, error } = await supabase.from("suppliers").insert({ name: newSupplier.trim() }).select("id").single();
				if (error) throw error;
				supplier_id = data.id;
			}
			let certificate_url = lot?.certificate_url ?? null;
			if (certFile) {
				const path = `${Date.now()}-${certFile.name}`;
				const up = await supabase.storage.from("certificats").upload(path, certFile);
				if (up.error) throw up.error;
				certificate_url = (await supabase.storage.from("certificats").createSignedUrl(path, 3600 * 24 * 365 * 5)).data?.signedUrl ?? null;
			}
			const payload = {
				product_id: values.product_id,
				supplier_id,
				warehouse_id: values.warehouse_id || null,
				location_id: values.location_id || null,
				lot_number: values.lot_number.trim(),
				reception_date: values.reception_date,
				quantity: Number(values.quantity),
				unit_purchase_price: Number(values.unit_purchase_price),
				certificate_url,
				notes: values.notes || null
			};
			if (isEdit) {
				const { error } = await supabase.from("lots").update(payload).eq("id", lot.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("lots").insert(payload);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(isEdit ? "Lot modifié" : "Lot créé");
			onSaved();
		},
		onError: (e) => toast.error(e.message ?? "Erreur"),
		onSettled: () => setBusy(false)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Modifier le lot" : "Nouveau lot" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: form.handleSubmit((values) => save.mutate(values)),
			className: "grid gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "product_id",
							children: "Produit *"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.watch("product_id"),
							onValueChange: (v) => form.setValue("product_id", v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un produit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: p.id,
								children: [
									p.name,
									" (",
									p.sku,
									")"
								]
							}, p.id)) })]
						}),
						form.formState.errors.product_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive",
							children: form.formState.errors.product_id.message
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fournisseur" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.watch("supplier_id"),
							onValueChange: (v) => form.setValue("supplier_id", v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir ou créer" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.id,
								children: s.name
							}, s.id)) })]
						}),
						!form.watch("supplier_id") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "ou nouveau fournisseur...",
							value: newSupplier,
							onChange: (e) => setNewSupplier(e.target.value)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Entrepôt" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.watch("warehouse_id"),
							onValueChange: (v) => {
								form.setValue("warehouse_id", v);
								form.setValue("location_id", "");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un entrepôt" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: warehouses.filter((w) => w.is_active).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: w.id,
								children: w.name
							}, w.id)) })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Emplacement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.watch("location_id"),
							onValueChange: (v) => form.setValue("location_id", v),
							disabled: !selectedWarehouse,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: selectedWarehouse ? "Choisir" : "Choisir un entrepôt d'abord" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: locations.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: l.id,
								children: l.name
							}, l.id)) })]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "lot_number",
								children: "N° lot *"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "lot_number",
								...form.register("lot_number")
							}),
							form.formState.errors.lot_number && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-destructive",
								children: form.formState.errors.lot_number.message
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "reception_date",
							children: "Date réception"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "reception_date",
							type: "date",
							...form.register("reception_date")
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "quantity",
								children: "Quantité"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "quantity",
								type: "number",
								step: "0.001",
								...form.register("quantity")
							}),
							form.formState.errors.quantity && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-destructive",
								children: form.formState.errors.quantity.message
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "unit_purchase_price",
							children: "Prix unitaire achat"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "unit_purchase_price",
							type: "number",
							step: "0.01",
							...form.register("unit_purchase_price")
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Certificat (PDF)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "file",
						accept: "application/pdf",
						onChange: (e) => setCertFile(e.target.files?.[0] ?? null)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "notes",
						children: "Notes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "notes",
						rows: 2,
						...form.register("notes")
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
//#endregion
export { LotsPage as component };
