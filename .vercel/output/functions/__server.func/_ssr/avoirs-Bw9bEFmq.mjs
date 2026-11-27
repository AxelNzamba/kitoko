import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { L as Plus, O as Search, Y as Mail } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { n as formatDateTime, r as formatXOF } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/avoirs-Bw9bEFmq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 20;
function AvoirsPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(PAGE_SIZE);
	const [q, setQ] = (0, import_react.useState)("");
	const [formSaleId, setFormSaleId] = (0, import_react.useState)("");
	const [formClient, setFormClient] = (0, import_react.useState)("");
	const [formAmount, setFormAmount] = (0, import_react.useState)("");
	const [formReason, setFormReason] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { data: creditsData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"credits",
			page,
			pageSize
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			const { data, error, count } = await supabase.from("credits").select("*, sales!left(number, client_name, total_ttc)").order("created_at", { ascending: false }).range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const { data: sales = [] } = useQuery({
		queryKey: ["sales", "recent"],
		queryFn: async () => {
			const { data } = await supabase.from("sales").select("id, number, client_name, total_ttc, created_at").order("created_at", { ascending: false }).limit(50);
			return data ?? [];
		}
	});
	const handleSaleSelect = (saleId) => {
		setFormSaleId(saleId);
		const sale = sales.find((s) => s.id === saleId);
		if (sale) {
			setFormClient(sale.client_name ?? "");
			setFormAmount(String(sale.total_ttc ?? ""));
		}
	};
	const createCredit = useMutation({
		mutationFn: async () => {
			setBusy(true);
			const { data: u } = await supabase.auth.getUser();
			const { data: numData } = await supabase.rpc("generate_credit_number");
			const creditNumber = numData ?? `AV-${Date.now()}`;
			const amount = Number(formAmount);
			if (!amount || amount <= 0) throw new Error("Montant invalide");
			const { error } = await supabase.from("credits").insert({
				credit_number: creditNumber,
				sale_id: formSaleId || null,
				client_name: formClient,
				total_ht: amount,
				total_tva: 0,
				total_ttc: amount,
				reason: formReason,
				created_by: u.user?.id
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Avoir créé");
			notify.info("Avoir créé", "Un avoir a été enregistré.");
			qc.invalidateQueries({ queryKey: ["credits"] });
			setOpen(false);
			resetForm();
		},
		onError: (e) => toast.error(e.message),
		onSettled: () => setBusy(false)
	});
	const resetForm = () => {
		setFormSaleId("");
		setFormClient("");
		setFormAmount("");
		setFormReason("");
	};
	const handleSendEmail = async (credit) => {
		const clientEmail = prompt("Adresse email du client :", "");
		if (!clientEmail) return;
		notify.info("Email envoyé", `L'avoir ${credit.credit_number} a été envoyé à ${clientEmail}`);
	};
	const credits = creditsData.data;
	const total = creditsData.count;
	const debouncedQ = useDebounce(q, 200);
	const filtered = (0, import_react.useMemo)(() => debouncedQ.trim() ? credits.filter((c) => {
		const s = debouncedQ.toLowerCase();
		return c.credit_number?.toLowerCase().includes(s) || c.client_name?.toLowerCase().includes(s) || c.reason?.toLowerCase().includes(s);
	}) : credits, [credits, debouncedQ]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Avoirs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Gérez les avoirs et remboursements clients."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: (o) => {
						if (!o) resetForm();
						setOpen(o);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouvel avoir"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Créer un avoir" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							createCredit.mutate();
						},
						className: "grid gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Vente liée (optionnelle)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: formSaleId,
									onValueChange: handleSaleSelect,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sélectionner une vente" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: sales.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: s.id,
										children: [
											s.number,
											" — ",
											s.client_name || "Particulier",
											" — ",
											formatXOF(Number(s.total_ttc))
										]
									}, s.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Client" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: formClient,
									onChange: (e) => setFormClient(e.target.value),
									placeholder: "Nom du client"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Montant TTC *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									step: "0.01",
									min: "0",
									value: formAmount,
									onChange: (e) => setFormAmount(e.target.value),
									required: true,
									placeholder: "0.00"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Motif" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: formReason,
									onValueChange: setFormReason,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un motif" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Annulation de vente",
											children: "Annulation de vente"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Produit défectueux",
											children: "Produit défectueux"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Erreur de facturation",
											children: "Erreur de facturation"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Remise commerciale",
											children: "Remise commerciale"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Garantie",
											children: "Garantie"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Autre",
											children: "Autre"
										})
									] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setOpen(false),
								children: "Annuler"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								children: busy ? "..." : "Créer l'avoir"
							})] })
						]
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Rechercher par n° avoir, client…",
					className: "pl-9"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° avoir" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Client" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Vente liée" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Montant"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Motif" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun avoir enregistré."
				}) }), filtered.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: c.credit_number
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm",
						children: formatDateTime(c.created_at)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c.client_name || "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: c.sales?.number || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right font-mono font-semibold",
						children: formatXOF(Number(c.total_ttc))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted-foreground max-w-[200px] truncate",
						children: c.reason || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => handleSendEmail(c),
							title: "Envoyer par email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" })
						})
					})
				] }, c.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			})
		]
	});
}
//#endregion
export { AvoirsPage as component };
