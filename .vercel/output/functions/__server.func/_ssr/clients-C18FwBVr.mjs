import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { B as Pencil, L as Plus, R as Phone, Y as Mail, h as Trash2, ut as FileDown } from "../_libs/lucide-react.mjs";
import { t as Pagination } from "./pagination-CM0hvVxo.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as objectType, n as literalType, o as stringType } from "../_libs/zod.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, l as AlertDialogTrigger, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CmIv1W53.mjs";
import { t as exportToCsv } from "./csv-bEMY3y7g.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/clients-C18FwBVr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var clientSchema = objectType({
	name: stringType().trim().min(1, "Le nom est requis").max(255),
	company: stringType().trim().max(255).optional().or(literalType("")),
	phone: stringType().trim().max(50).optional().or(literalType("")),
	email: stringType().trim().email("Email invalide").max(255).optional().or(literalType("")),
	address: stringType().trim().max(500).optional().or(literalType("")),
	notes: stringType().trim().max(2e3).optional().or(literalType(""))
});
var CLIENTS_PAGE_SIZE = 20;
function ClientsPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editClient, setEditClient] = (0, import_react.useState)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(CLIENTS_PAGE_SIZE);
	const { data: clientsData = {
		data: [],
		count: 0
	} } = useQuery({
		queryKey: [
			"clients",
			page,
			pageSize
		],
		queryFn: async () => {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;
			const { data, error, count } = await supabase.from("clients").select("*", {
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
	const clients = clientsData.data;
	const totalClients = clientsData.count;
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("clients").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Client supprimé");
			qc.invalidateQueries({ queryKey: ["clients"] });
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	const debouncedQ = useDebounce(q, 200);
	const filtered = (0, import_react.useMemo)(() => clients.filter((c) => {
		if (!debouncedQ.trim()) return true;
		const s = debouncedQ.toLowerCase();
		return c.name?.toLowerCase().includes(s) || c.company?.toLowerCase().includes(s) || c.phone?.toLowerCase().includes(s);
	}), [clients, debouncedQ]);
	const handleExportCsv = async () => {
		const { data: allClients, error } = await supabase.from("clients").select("*").order("name");
		if (error) {
			toast.error("Erreur lors de l'export");
			return;
		}
		exportToCsv([
			{
				key: "name",
				label: "Nom"
			},
			{
				key: "company",
				label: "Société"
			},
			{
				key: "phone",
				label: "Téléphone"
			},
			{
				key: "email",
				label: "Email"
			},
			{
				key: "address",
				label: "Adresse"
			},
			{
				key: "notes",
				label: "Notes"
			}
		], (allClients ?? []).map((c) => ({
			name: c.name,
			company: c.company ?? "",
			phone: c.phone ?? "",
			email: c.email ?? "",
			address: c.address ?? "",
			notes: c.notes ?? ""
		})), `clients-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	};
	const openEdit = (client) => {
		setEditClient(client);
		setOpen(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Clients"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Fichier clients particuliers et entreprises."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: handleExportCsv,
						title: "Exporter en CSV",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), "CSV"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
						open,
						onOpenChange: (o) => {
							setOpen(o);
							if (!o) setEditClient(null);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => setEditClient(null),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouveau client"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientForm, {
							client: editClient,
							onClose: () => {
								setOpen(false);
								setEditClient(null);
							},
							onSaved: () => {
								qc.invalidateQueries({ queryKey: ["clients"] });
								setOpen(false);
								setEditClient(null);
							}
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Rechercher un client…",
				className: "max-w-md"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Nom" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Société" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contact" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Adresse" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun client."
				}) }), filtered.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientRow, {
					client: c,
					onEdit: () => openEdit(c),
					onDelete: (id) => del.mutate(id)
				}, c.id))] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize,
					total: totalClients,
					onPageChange: setPage,
					onPageSizeChange: setPageSize
				})]
			})
		]
	});
}
var ClientRow = (0, import_react.memo)(function ClientRow({ client, onEdit, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-medium",
			children: client.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm text-muted-foreground",
			children: client.company ?? "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-0.5",
				children: [
					client.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3" }),
							" ",
							client.phone
						]
					}),
					client.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3" }),
							" ",
							client.email
						]
					}),
					!client.phone && !client.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "—"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "max-w-xs truncate text-sm text-muted-foreground",
			children: client.address ?? "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-end gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onEdit,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Supprimer le client ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"Êtes-vous sûr de vouloir supprimer ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: client.name }),
					" ? Cette action est irréversible."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Annuler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => onDelete(client.id),
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					children: "Supprimer"
				})] })] })] })]
			})
		})
	] }, client.id);
});
function ClientForm({ client, onClose, onSaved }) {
	const isEdit = !!client;
	const form = useForm({
		resolver: u(clientSchema),
		defaultValues: {
			name: client?.name ?? "",
			company: client?.company ?? "",
			phone: client?.phone ?? "",
			email: client?.email ?? "",
			address: client?.address ?? "",
			notes: client?.notes ?? ""
		}
	});
	const save = useMutation({
		mutationFn: async (values) => {
			const payload = {
				name: values.name.trim(),
				company: values.company?.trim() || null,
				phone: values.phone?.trim() || null,
				email: values.email?.trim() || null,
				address: values.address?.trim() || null,
				notes: values.notes?.trim() || null
			};
			if (isEdit) {
				const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("clients").insert(payload);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(isEdit ? "Client modifié" : "Client créé");
			onSaved();
		},
		onError: (e) => toast.error(e.message ?? "Erreur")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Modifier le client" : "Nouveau client" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: form.handleSubmit((values) => save.mutate(values)),
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "name",
						children: "Nom *"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "name",
						...form.register("name"),
						autoFocus: true
					}),
					form.formState.errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-destructive",
						children: form.formState.errors.name.message
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "company",
					children: "Société"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "company",
					...form.register("company")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "phone",
						children: "Téléphone"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "phone",
						...form.register("phone")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							type: "email",
							...form.register("email")
						}),
						form.formState.errors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive",
							children: form.formState.errors.email.message
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "address",
					children: "Adresse"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "address",
					rows: 2,
					...form.register("address")
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
				children: isEdit ? "Modifier" : "Créer"
			})] })
		]
	})] });
}
//#endregion
export { ClientsPage as component };
