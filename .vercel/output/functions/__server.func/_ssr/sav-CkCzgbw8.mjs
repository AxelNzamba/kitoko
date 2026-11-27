import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { L as Plus, h as Trash2, n as Wrench, ut as FileDown, w as ShieldCheck } from "../_libs/lucide-react.mjs";
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
import { i as serialStatusTone, n as SERIAL_STATUS_LABEL, r as SerialHistoryDialog, t as OUTCOME_LABEL } from "./serial-history-dialog-BGc3qMeO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sav-CkCzgbw8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SAV_PAGE_SIZE = 20;
var TYPES = [
	{
		value: "garantie",
		label: "Garantie"
	},
	{
		value: "retour",
		label: "Retour"
	},
	{
		value: "intervention",
		label: "Intervention"
	}
];
var STATUSES = [
	{
		value: "ouvert",
		label: "Ouvert"
	},
	{
		value: "en_cours",
		label: "En cours"
	},
	{
		value: "resolu",
		label: "Résolu"
	},
	{
		value: "refuse",
		label: "Refusé"
	}
];
var label = (arr, v) => arr.find((a) => a.value === v)?.label ?? v;
function SavPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [clientFilter, setClientFilter] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(SAV_PAGE_SIZE);
	const { data: ticketData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"sav_tickets",
			page,
			pageSize,
			statusFilter,
			clientFilter
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			let query = supabase.from("sav_tickets").select("*, clients:client_id(name), products:product_id(name, sku), serial_numbers:serial_id(serial)", {
				count: "exact",
				head: false
			});
			if (statusFilter !== "all") query = query.eq("status", statusFilter);
			if (clientFilter !== "all") query = query.eq("client_id", clientFilter);
			const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const tickets = ticketData.data;
	const totalTickets = ticketData.count;
	const openCountQuery = useQuery({
		queryKey: ["sav_tickets", "open-count"],
		queryFn: async () => {
			const { count, error } = await supabase.from("sav_tickets").select("*", {
				count: "exact",
				head: true
			}).in("status", ["ouvert", "en_cours"]);
			if (error) throw error;
			return count ?? 0;
		},
		staleTime: 6e4
	});
	const { data: clients = [] } = useQuery({
		queryKey: ["clients", "min"],
		queryFn: async () => (await supabase.from("clients").select("id, name").order("name")).data ?? []
	});
	const { data: products = [] } = useQuery({
		queryKey: ["products", "min"],
		queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? []
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("sav_tickets").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Ticket supprimé");
			qc.invalidateQueries({ queryKey: ["sav_tickets"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const setStatus = useMutation({
		mutationFn: async ({ id, status }) => {
			const { error } = await supabase.from("sav_tickets").update({ status }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Statut mis à jour");
			qc.invalidateQueries({ queryKey: ["sav_tickets"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const filtered = tickets;
	const rows = filtered.map((t) => ({
		number: t.ticket_number,
		date: formatDate(t.created_at),
		type: label(TYPES, t.type),
		status: label(STATUSES, t.status),
		client: t.clients?.name ?? "",
		product: t.products?.name ?? "",
		serial: t.serial_numbers?.serial ?? "",
		warranty: t.warranty_end ? formatDate(t.warranty_end) : "",
		description: t.description ?? ""
	}));
	const headers = [
		{
			key: "number",
			label: "N° ticket"
		},
		{
			key: "date",
			label: "Date"
		},
		{
			key: "type",
			label: "Type"
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
			key: "product",
			label: "Produit"
		},
		{
			key: "serial",
			label: "N° série"
		},
		{
			key: "warranty",
			label: "Fin garantie"
		},
		{
			key: "description",
			label: "Description"
		}
	];
	const openCount = openCountQuery.data ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "SAV"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						"Garanties, retours et interventions — ",
						openCount,
						" dossier(s) en cours."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: statusFilter,
							onValueChange: setStatusFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 w-36",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Statut" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "Tous les statuts"
							}), STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s.value,
								children: s.label
							}, s.value))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: clientFilter,
							onValueChange: setClientFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9 w-40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Client" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "Tous les clients"
							}), clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c.id,
								children: c.name
							}, c.id))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => exportToCsv(headers, rows, `sav-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => exportTablePdf({
								title: "Dossiers SAV",
								headers: headers.map((h) => h.label),
								rows: rows.map((r) => headers.map((h) => r[h.key] ?? "")),
								filename: `sav-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`,
								landscape: true
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " PDF"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
							open,
							onOpenChange: setOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouveau ticket"] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketForm, {
								clients,
								products,
								onClose: () => setOpen(false),
								onSaved: () => {
									qc.invalidateQueries({ queryKey: ["sav_tickets"] });
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° ticket" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Client" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° série" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Garantie" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 9,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun dossier SAV."
				}) }), filtered.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketRow, {
					ticket: t,
					onOpen: () => setDetail(t),
					onDelete: (id) => del.mutate(id),
					onStatus: (id, status) => setStatus.mutate({
						id,
						status
					})
				}, t.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalTickets,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!detail,
				onOpenChange: (o) => !o && setDetail(null),
				children: detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterventionsDialog, { ticket: detail })
			})
		]
	});
}
/**
* Ligne de ticket mémoïsée : évite de re-rendre toutes les lignes
* quand une seule ligne change (statut, interventions…).
*/
var TicketRow = (0, import_react.memo)(function TicketRow({ ticket, onOpen, onDelete, onStatus }) {
	const underWarranty = ticket.warranty_end && new Date(ticket.warranty_end) >= /* @__PURE__ */ new Date();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-mono text-xs",
			children: ticket.ticket_number
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-xs",
			children: formatDate(ticket.created_at)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-xs",
			children: label(TYPES, ticket.type)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: ticket.clients?.name ?? "—" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: ticket.products?.name ?? "—" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-mono text-xs",
			children: ticket.serial_numbers?.serial ?? "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-xs",
			children: ticket.warranty_end ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: underWarranty ? "text-emerald-600" : "text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mr-1 inline size-3.5" }), formatDate(ticket.warranty_end)]
			}) : "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: ticket.status,
			onValueChange: (v) => onStatus(ticket.id, v),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				className: "h-8 w-28 text-xs",
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
					onClick: onOpen,
					title: "Interventions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => onDelete(ticket.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
				})]
			})
		})
	] });
});
function TicketForm({ clients, products, onClose, onSaved }) {
	const [clientId, setClientId] = (0, import_react.useState)("");
	const [productId, setProductId] = (0, import_react.useState)("");
	const [serialId, setSerialId] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("garantie");
	const [warrantyEnd, setWarrantyEnd] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const { data: serials = [] } = useQuery({
		queryKey: [
			"serials",
			"product",
			productId
		],
		enabled: !!productId,
		queryFn: async () => {
			const { data } = await supabase.from("serial_numbers").select("id, serial").eq("product_id", productId).order("serial").limit(500);
			return data ?? [];
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			if (!description.trim()) throw new Error("La description est requise");
			const { data: num, error: numErr } = await supabase.rpc("generate_sav_number");
			if (numErr) throw numErr;
			const { data: u } = await supabase.auth.getUser();
			const { error } = await supabase.from("sav_tickets").insert({
				ticket_number: num,
				client_id: clientId || null,
				product_id: productId || null,
				serial_id: serialId || null,
				type,
				warranty_end: warrantyEnd || null,
				description: description.trim(),
				created_by: u.user?.id
			});
			if (error) throw error;
			if (serialId) await supabase.from("serial_numbers").update({ status: "sav" }).eq("id", serialId);
		},
		onSuccess: () => {
			toast.success("Ticket SAV créé");
			onSaved();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouveau dossier SAV" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-4",
		onSubmit: (e) => {
			e.preventDefault();
			save.mutate();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: type,
					onValueChange: setType,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: t.value,
						children: t.label
					}, t.value)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Client" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: clientId,
					onValueChange: setClientId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sélectionner un client" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: clients.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: c.id,
						children: c.name
					}, c.id)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Produit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: productId,
					onValueChange: (v) => {
						setProductId(v);
						setSerialId("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sélectionner un produit" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
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
			serials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Numéro de série" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: serialId,
					onValueChange: setSerialId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Optionnel" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: serials.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: s.id,
						children: s.serial
					}, s.id)) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fin de garantie" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: warrantyEnd,
					onChange: (e) => setWarrantyEnd(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description du problème" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 3,
					value: description,
					onChange: (e) => setDescription(e.target.value),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onClose,
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: save.isPending,
				children: "Créer"
			})] })
		]
	})] });
}
var OUTCOMES = [
	{
		value: "traite",
		label: "Traité"
	},
	{
		value: "repare",
		label: "Réparé"
	},
	{
		value: "remplace",
		label: "Remplacé"
	},
	{
		value: "retourne_client",
		label: "Retourné au client"
	},
	{
		value: "rebut",
		label: "Mis au rebut"
	}
];
/** Statut à appliquer au numéro de série selon l'issue de l'intervention. */
var OUTCOME_SERIAL_STATUS = {
	traite: "sav",
	repare: "en_stock",
	remplace: "rebut",
	retourne_client: "vendu",
	rebut: "rebut"
};
function InterventionsDialog({ ticket }) {
	const qc = useQueryClient();
	const [date, setDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [technician, setTechnician] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [cost, setCost] = (0, import_react.useState)("0");
	const [outcome, setOutcome] = (0, import_react.useState)("traite");
	const [selected, setSelected] = (0, import_react.useState)(ticket.serial_id ? [ticket.serial_id] : []);
	const [historySerial, setHistorySerial] = (0, import_react.useState)(null);
	const { data: items = [] } = useQuery({
		queryKey: ["sav_interventions", ticket.id],
		queryFn: async () => {
			const { data } = await supabase.from("sav_interventions").select("*").eq("ticket_id", ticket.id).order("intervention_date", { ascending: false });
			return data ?? [];
		}
	});
	const { data: serials = [] } = useQuery({
		queryKey: [
			"serials",
			"sav",
			ticket.product_id
		],
		enabled: !!ticket.product_id,
		queryFn: async () => {
			const { data } = await supabase.from("serial_numbers").select("id, serial, status").eq("product_id", ticket.product_id).order("serial").limit(500);
			return data ?? [];
		}
	});
	const { data: links = [] } = useQuery({
		queryKey: [
			"sav_intervention_serials",
			ticket.id,
			items.map((i) => i.id).join(",")
		],
		enabled: items.length > 0,
		queryFn: async () => {
			const { data } = await supabase.from("sav_intervention_serials").select("id, intervention_id, outcome, serial_id, serial_numbers:serial_id(serial, status)").in("intervention_id", items.map((i) => i.id));
			return data ?? [];
		}
	});
	const add = useMutation({
		mutationFn: async () => {
			if (!description.trim()) throw new Error("La description est requise");
			const { data: u } = await supabase.auth.getUser();
			const { data: created, error } = await supabase.from("sav_interventions").insert({
				ticket_id: ticket.id,
				intervention_date: date,
				technician: technician || null,
				description: description.trim(),
				cost: Number(cost) || 0,
				created_by: u.user?.id
			}).select("id").single();
			if (error) throw error;
			if (selected.length > 0) {
				const { error: linkErr } = await supabase.from("sav_intervention_serials").insert(selected.map((sid) => ({
					intervention_id: created.id,
					serial_id: sid,
					outcome
				})));
				if (linkErr) throw linkErr;
				const newStatus = OUTCOME_SERIAL_STATUS[outcome];
				if (newStatus) await supabase.from("serial_numbers").update({ status: newStatus }).in("id", selected);
			}
		},
		onSuccess: () => {
			toast.success("Intervention ajoutée");
			setDescription("");
			setCost("0");
			setSelected([]);
			qc.invalidateQueries({ queryKey: ["sav_interventions", ticket.id] });
			qc.invalidateQueries({ queryKey: ["sav_intervention_serials"] });
			qc.invalidateQueries({ queryKey: ["serials"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const total = items.reduce((s, i) => s + Number(i.cost ?? 0), 0);
	const toggle = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Interventions — ", ticket.ticket_number] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: ticket.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-lg border p-3 sm:grid-cols-2",
				onSubmit: (e) => {
					e.preventDefault();
					add.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: date,
							onChange: (e) => setDate(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Technicien"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: technician,
							onChange: (e) => setTechnician(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							value: description,
							onChange: (e) => setDescription(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Coût"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.01",
							value: cost,
							onChange: (e) => setCost(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Issue pour les séries"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: outcome,
							onValueChange: setOutcome,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: OUTCOMES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: o.value,
								children: o.label
							}, o.value)) })]
						})]
					}),
					serials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							className: "text-xs",
							children: [
								"Numéros de série concernés (",
								selected.length,
								" sélectionné(s))"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex max-h-32 flex-wrap gap-1.5 overflow-auto rounded-md border p-2",
							children: serials.map((s) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => toggle(s.id),
									className: `rounded-md border px-2 py-1 font-mono text-[11px] transition ${selected.includes(s.id) ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/60"}`,
									children: [s.serial, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `ml-1 rounded px-1 text-[10px] ${serialStatusTone(s.status)}`,
										children: SERIAL_STATUS_LABEL[s.status] ?? s.status
									})]
								}, s.id);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-end sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: add.isPending,
							className: "w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Ajouter l'intervention"]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-72 overflow-auto rounded-lg border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Technicien" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° série" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Coût"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "Aucune intervention."
				}) }), items.map((i) => {
					const mine = links.filter((l) => l.intervention_id === i.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs",
							children: formatDate(i.intervention_date)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs",
							children: i.technician ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs",
							children: i.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: mine.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "—"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: mine.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setHistorySerial(l.serial_id),
								className: "rounded-md border px-1.5 py-0.5 font-mono text-[10px] hover:bg-muted/60",
								title: `${OUTCOME_LABEL[l.outcome] ?? l.outcome} — voir l'historique`,
								children: [l.serial_numbers?.serial ?? l.serial_id.slice(0, 6), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `ml-1 rounded px-1 ${serialStatusTone(l.serial_numbers?.status ?? "")}`,
									children: SERIAL_STATUS_LABEL[l.serial_numbers?.status ?? ""] ?? "—"
								})]
							}, l.id))
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right text-xs",
							children: formatXOF(Number(i.cost ?? 0))
						})
					] }, i.id);
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-right text-sm font-semibold",
				children: ["Total interventions : ", formatXOF(total)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SerialHistoryDialog, {
				serialId: historySerial,
				open: !!historySerial,
				onOpenChange: (o) => !o && setHistorySerial(null)
			})
		]
	});
}
//#endregion
export { SavPage as component };
