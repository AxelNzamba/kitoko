import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { L as Plus, O as Search } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { t as formatDate } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/retours-fournisseurs-DfzSiPIa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 20;
function RetoursPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(PAGE_SIZE);
	const [q, setQ] = (0, import_react.useState)("");
	const [formProduct, setFormProduct] = (0, import_react.useState)("");
	const [formSupplier, setFormSupplier] = (0, import_react.useState)("");
	const [formQty, setFormQty] = (0, import_react.useState)("1");
	const [formReason, setFormReason] = (0, import_react.useState)("");
	const [formDate, setFormDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [availableLots, setAvailableLots] = (0, import_react.useState)([]);
	const [lotId, setLotId] = (0, import_react.useState)("");
	const { data: returnsData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"supplier-returns",
			page,
			pageSize
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			const { data, error, count } = await supabase.from("supplier_returns").select("*, products!left(name, sku), suppliers!left(name), lots!left(lot_number)").order("created_at", { ascending: false }).range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const { data: products = [] } = useQuery({
		queryKey: ["products", "min"],
		queryFn: async () => (await supabase.from("products").select("id, name, sku").order("name")).data ?? []
	});
	const { data: suppliers = [] } = useQuery({
		queryKey: ["suppliers", "min"],
		queryFn: async () => (await supabase.from("suppliers").select("id, name").order("name")).data ?? []
	});
	const loadLots = async (productId) => {
		const { data } = await supabase.from("lots").select("id, lot_number, quantity").eq("product_id", productId).gt("quantity", 0).order("reception_date", { ascending: false });
		setAvailableLots(data ?? []);
		setLotId("");
	};
	const createReturn = useMutation({
		mutationFn: async () => {
			setBusy(true);
			if (!formProduct || !formSupplier || !formQty) throw new Error("Veuillez remplir les champs requis");
			const { data: u } = await supabase.auth.getUser();
			const { data: numData } = await supabase.rpc("generate_return_number");
			const returnNumber = numData ?? `RET-${Date.now()}`;
			const { error } = await supabase.from("supplier_returns").insert({
				return_number: returnNumber,
				product_id: formProduct,
				supplier_id: formSupplier,
				lot_id: lotId || null,
				quantity: Number(formQty),
				reason: formReason,
				return_date: formDate,
				status: "completed",
				created_by: u.user?.id
			});
			if (error) throw error;
			const { error: movErr } = await supabase.from("stock_movements").insert({
				product_id: formProduct,
				type: "sortie",
				quantity: Number(formQty),
				unit_price: null,
				reason: `Retour fournisseur ${returnNumber}: ${formReason}`,
				created_by: u.user?.id
			});
			if (movErr) throw movErr;
		},
		onSuccess: () => {
			toast.success("Retour enregistré");
			qc.invalidateQueries({ queryKey: ["supplier-returns"] });
			qc.invalidateQueries({ queryKey: ["movements"] });
			setOpen(false);
			resetForm();
		},
		onError: (e) => toast.error(e.message),
		onSettled: () => setBusy(false)
	});
	const resetForm = () => {
		setFormProduct("");
		setFormSupplier("");
		setFormQty("1");
		setFormReason("");
		setFormDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
		setLotId("");
		setAvailableLots([]);
	};
	const returns = returnsData.data;
	const total = returnsData.count;
	const debouncedQ = useDebounce(q, 200);
	const filtered = (0, import_react.useMemo)(() => debouncedQ.trim() ? returns.filter((r) => {
		const s = debouncedQ.toLowerCase();
		return r.return_number?.toLowerCase().includes(s) || r.products?.name?.toLowerCase().includes(s) || r.suppliers?.name?.toLowerCase().includes(s);
	}) : returns, [returns, debouncedQ]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Retours fournisseurs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Gérez les retours de marchandises aux fournisseurs."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: (o) => {
						if (!o) resetForm();
						setOpen(o);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouveau retour"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouveau retour fournisseur" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							createReturn.mutate();
						},
						className: "grid gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Produit *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: formProduct,
									onValueChange: (v) => {
										setFormProduct(v);
										loadLots(v);
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fournisseur *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: formSupplier,
									onValueChange: setFormSupplier,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s.id,
										children: s.name
									}, s.id)) })]
								})]
							}),
							availableLots.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Lot (optionnel)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: lotId,
									onValueChange: setLotId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un lot" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableLots.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: l.id,
										children: [
											l.lot_number,
											" (stock: ",
											l.quantity,
											")"
										]
									}, l.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Quantité *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: "1",
										value: formQty,
										onChange: (e) => setFormQty(e.target.value),
										required: true
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date retour" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: formDate,
										onChange: (e) => setFormDate(e.target.value)
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Motif du retour *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: formReason,
									onValueChange: setFormReason,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un motif" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Produit défectueux",
											children: "Produit défectueux"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Erreur de commande",
											children: "Erreur de commande"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Produit périmé",
											children: "Produit périmé"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Qualité insuffisante",
											children: "Qualité insuffisante"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Quantité excédentaire",
											children: "Quantité excédentaire"
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
								children: busy ? "..." : "Enregistrer le retour"
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
					placeholder: "Rechercher par n° retour, produit, fournisseur…",
					className: "pl-9"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "N° retour" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fournisseur" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Qté"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Motif" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun retour enregistré."
				}) }), filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: r.return_number
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm",
						children: formatDate(r.return_date)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
						r.products?.name,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								"(",
								r.products?.sku,
								")"
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: r.suppliers?.name ?? "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: r.quantity
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted-foreground max-w-[200px] truncate",
						children: r.reason
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `inline-block rounded px-2 py-0.5 text-[10px] font-medium ${r.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : r.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`,
						children: r.status === "completed" ? "Effectué" : r.status === "pending" ? "En attente" : "Annulé"
					}) })
				] }, r.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
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
export { RetoursPage as component };
