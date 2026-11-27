import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { J as MapPin, L as Plus, R as Phone, Y as Mail, d as Truck, h as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fournisseurs-DvTa8mgx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SUPPLIERS_PAGE_SIZE = 20;
function FournisseursPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(SUPPLIERS_PAGE_SIZE);
	const { data: suppliersData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"suppliers",
			page,
			pageSize
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			const { data, error, count } = await supabase.from("suppliers").select("*", {
				count: "exact",
				head: false
			}).order("name").range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const { data: lots = [] } = useQuery({
		queryKey: ["lots-by-supplier"],
		queryFn: async () => {
			const { data, error } = await supabase.from("lots").select("supplier_id");
			if (error) throw error;
			return data;
		}
	});
	const suppliers = suppliersData.data;
	const totalSuppliers = suppliersData.count;
	const lotsCount = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		lots.forEach((l) => {
			if (l.supplier_id) map.set(l.supplier_id, (map.get(l.supplier_id) ?? 0) + 1);
		});
		return (id) => map.get(id) ?? 0;
	}, [lots]);
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("suppliers").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			notify.success("Fournisseur supprimé");
			qc.invalidateQueries({ queryKey: ["suppliers"] });
		},
		onError: (e) => notify.error("Erreur", e.message)
	});
	const debouncedQ = useDebounce(q, 200);
	const filtered = (0, import_react.useMemo)(() => suppliers.filter((s) => {
		if (!debouncedQ.trim()) return true;
		const t = debouncedQ.toLowerCase();
		return s.name?.toLowerCase().includes(t) || s.phone?.toLowerCase().includes(t) || s.email?.toLowerCase().includes(t);
	}), [suppliers, debouncedQ]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Fournisseurs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [totalSuppliers, " fournisseur(s) enregistré(s)."]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouveau fournisseur"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierForm, {
						onClose: () => setOpen(false),
						onCreated: () => {
							qc.invalidateQueries({ queryKey: ["suppliers"] });
							setOpen(false);
						}
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Rechercher…",
				className: "max-w-md"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fournisseur" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contact" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Adresse" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-center",
						children: "Lots"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun fournisseur."
				}) }), filtered.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierRow, {
					supplier: s,
					lotsCount: lotsCount(s.id),
					onDelete: (id) => del.mutate(id)
				}, s.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalSuppliers,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			})
		]
	});
}
var SupplierRow = (0, import_react.memo)(function SupplierRow({ supplier, lotsCount, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 font-medium",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-4 text-muted-foreground" }), supplier.name]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-0.5",
				children: [
					supplier.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3" }),
							" ",
							supplier.phone
						]
					}),
					supplier.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3" }),
							" ",
							supplier.email
						]
					}),
					!supplier.phone && !supplier.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "—"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "max-w-xs text-sm text-muted-foreground",
			children: supplier.address ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-3 shrink-0" }),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: supplier.address
					})
				]
			}) : "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold",
				children: lotsCount
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => {
					if (confirm(`Supprimer "${supplier.name}" ?`)) onDelete(supplier.id);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
			})
		})
	] }, supplier.id);
});
function SupplierForm({ onClose, onCreated }) {
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		phone: "",
		email: "",
		address: ""
	});
	const create = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("suppliers").insert({
				name: form.name.trim(),
				phone: form.phone.trim() || null,
				email: form.email.trim() || null,
				address: form.address.trim() || null
			});
			if (error) throw error;
		},
		onSuccess: () => {
			notify.success("Fournisseur créé", form.name);
			onCreated();
		},
		onError: (e) => notify.error("Erreur", e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouveau fournisseur" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			if (form.name.trim()) create.mutate();
		},
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom / Société *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.name,
					onChange: (e) => setForm({
						...form,
						name: e.target.value
					}),
					required: true,
					autoFocus: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Téléphone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: form.phone,
						onChange: (e) => setForm({
							...form,
							phone: e.target.value
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						value: form.email,
						onChange: (e) => setForm({
							...form,
							email: e.target.value
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Adresse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 2,
					value: form.address,
					onChange: (e) => setForm({
						...form,
						address: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onClose,
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				children: "Créer"
			})] })
		]
	})] });
}
//#endregion
export { FournisseursPage as component };
