import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { L as Plus, h as Trash2, o as Wallet } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { r as formatXOF, t as formatDate } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { r as notify } from "./notify-UKmo-VDh.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/depenses-C6oEjBnQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	"Loyer",
	"Eau",
	"Électricité",
	"Transport",
	"Salaires",
	"Maintenance",
	"Internet",
	"Fournitures",
	"Marketing",
	"Autre"
];
var EXPENSES_PAGE_SIZE = 20;
function DepensesPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(EXPENSES_PAGE_SIZE);
	const { data: expensesData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"expenses",
			page,
			pageSize
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			const { data, error, count } = await supabase.from("expenses").select("*", {
				count: "exact",
				head: false
			}).order("expense_date", { ascending: false }).range(from, to);
			if (error) throw error;
			return {
				data: data ?? [],
				count: count ?? 0
			};
		}
	});
	const expenses = expensesData.data;
	const totalExpenses = expensesData.count;
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("expenses").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			notify.success("Dépense supprimée");
			qc.invalidateQueries({ queryKey: ["expenses"] });
		},
		onError: (e) => notify.error("Erreur", e.message)
	});
	const filtered = (0, import_react.useMemo)(() => filter === "all" ? expenses : expenses.filter((e) => e.category === filter), [expenses, filter]);
	const total = (0, import_react.useMemo)(() => filtered.reduce((s, e) => s + Number(e.amount), 0), [filtered]);
	const monthTotal = (0, import_react.useMemo)(() => {
		const thisMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
		return expenses.filter((e) => e.expense_date?.slice(0, 7) === thisMonth).reduce((s, e) => s + Number(e.amount), 0);
	}, [expenses]);
	const byCategory = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount)));
		return [...map.entries()].sort((a, b) => b[1] - a[1]);
	}, [expenses]);
	const maxCat = Math.max(1, ...byCategory.map(([, v]) => v));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Dépenses"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Suivi des charges d'exploitation."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouvelle dépense"] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseForm, {
						onClose: () => setOpen(false),
						onCreated: () => {
							qc.invalidateQueries({ queryKey: ["expenses"] });
							setOpen(false);
						}
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-3.5" }), " Total affiché"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-2xl font-bold",
							children: formatXOF(total)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
							children: "Ce mois-ci"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-2xl font-bold",
							children: formatXOF(monthTotal)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
							children: "Nombre"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-2xl font-bold",
							children: expenses.length
						})]
					})
				]
			}),
			byCategory.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-semibold",
					children: "Répartition par catégorie"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: byCategory.map(([cat, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-28 shrink-0 text-xs font-medium",
								children: cat
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 rounded-full bg-muted overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-accent",
										style: { width: `${v / maxCat * 100}%` }
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-28 shrink-0 text-right text-xs font-semibold tabular-nums",
								children: formatXOF(v)
							})
						]
					}, cat))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Filtre catégorie :"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: filter,
					onValueChange: setFilter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "Toutes"
					}), CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: c,
						children: c
					}, c))] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Catégorie" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Libellé" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Montant"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucune dépense."
				}) }), filtered.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseRow, {
					expense: e,
					onDelete: (id) => del.mutate(id)
				}, e.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalExpenses,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			})
		]
	});
}
var ExpenseRow = (0, import_react.memo)(function ExpenseRow({ expense, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm",
			children: formatDate(expense.expense_date)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium",
			children: expense.category
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
			className: "text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-medium",
				children: expense.label
			}), expense.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: expense.notes
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right font-semibold tabular-nums",
			children: formatXOF(Number(expense.amount))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => {
					if (confirm("Supprimer cette dépense ?")) onDelete(expense.id);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
			})
		})
	] }, expense.id);
});
function ExpenseForm({ onClose, onCreated }) {
	const [form, setForm] = (0, import_react.useState)({
		category: "Loyer",
		label: "",
		amount: "",
		expense_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		notes: ""
	});
	const create = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("expenses").insert({
				category: form.category,
				label: form.label.trim(),
				amount: Number(form.amount),
				expense_date: form.expense_date,
				notes: form.notes.trim() || null
			});
			if (error) throw error;
		},
		onSuccess: () => {
			notify.success("Dépense enregistrée", `${form.label} — ${formatXOF(Number(form.amount))}`);
			onCreated();
		},
		onError: (e) => notify.error("Erreur", e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouvelle dépense" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			if (form.label.trim() && Number(form.amount) > 0) create.mutate();
		},
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Catégorie *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: form.category,
						onValueChange: (v) => setForm({
							...form,
							category: v
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c,
							children: c
						}, c)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: form.expense_date,
						onChange: (e) => setForm({
							...form,
							expense_date: e.target.value
						}),
						required: true
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Libellé *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.label,
					onChange: (e) => setForm({
						...form,
						label: e.target.value
					}),
					required: true,
					autoFocus: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Montant (F) *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					min: "0",
					step: "1",
					value: form.amount,
					onChange: (e) => setForm({
						...form,
						amount: e.target.value
					}),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 2,
					value: form.notes,
					onChange: (e) => setForm({
						...form,
						notes: e.target.value
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
				children: "Enregistrer"
			})] })
		]
	})] });
}
//#endregion
export { DepensesPage as component };
