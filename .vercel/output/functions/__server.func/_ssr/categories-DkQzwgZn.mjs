import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { L as Plus, h as Trash2 } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categories-DkQzwgZn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES_PAGE_SIZE = 20;
function CategoriesPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(CATEGORIES_PAGE_SIZE);
	const { data: categoriesData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"categories",
			page,
			pageSize
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			const { data, error, count } = await supabase.from("categories").select("*", {
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
	const categories = categoriesData.data;
	const totalCategories = categoriesData.count;
	const nameById = (0, import_react.useMemo)(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("categories").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Catégorie supprimée");
			qc.invalidateQueries({ queryKey: ["categories"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Catégories"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Organisation hiérarchique du catalogue."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouvelle catégorie"] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryForm, {
					categories,
					onClose: () => setOpen(false),
					onCreated: () => {
						qc.invalidateQueries({ queryKey: ["categories"] });
						setOpen(false);
					}
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Nom" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Parent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Action"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [categories.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 3,
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Aucune catégorie."
			}) }), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryRow, {
				category: c,
				parentName: nameById.get(c.parent_id) ?? null,
				onDelete: (id) => del.mutate(id)
			}, c.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				pageSize,
				total: totalCategories,
				onPageChange: setPage,
				onPageSizeChange: setPageSize
			})]
		})]
	});
}
var CategoryRow = (0, import_react.memo)(function CategoryRow({ category, parentName, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-medium",
			children: category.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm text-muted-foreground",
			children: parentName ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs",
				children: "racine"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => {
					if (confirm(`Supprimer la catégorie "${category.name}" ?`)) onDelete(category.id);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
			})
		})
	] }, category.id);
});
function CategoryForm({ categories, onClose, onCreated }) {
	const [name, setName] = (0, import_react.useState)("");
	const [parentId, setParentId] = (0, import_react.useState)("");
	const create = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("categories").insert({
				name: name.trim(),
				parent_id: parentId || null
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Catégorie créée");
			onCreated();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouvelle catégorie" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			if (name.trim()) create.mutate();
		},
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					required: true,
					autoFocus: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Catégorie parente" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: parentId,
					onValueChange: setParentId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "(racine)" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: c.id,
						children: c.name
					}, c.id)) })]
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
export { CategoriesPage as component };
