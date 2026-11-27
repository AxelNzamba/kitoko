import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { N as RefreshCcw, St as CircleCheck, f as TriangleAlert, h as Trash2, i as WifiOff, r as Wifi, st as GitMerge } from "../_libs/lucide-react.mjs";
import { n as formatDateTime } from "./format-DUkOQpcu.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
import { a as syncNow, i as resolvePendingConflict, o as useModuleSyncStatus, r as getSyncDB, s as useOnlineStatus, t as MODULE_TABLES } from "./hooks-RLyvvVA0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/synchronisation-CfUrxvB-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TRANSFER_TABLES = ["stock_transfers", "stock_transfer_items"];
function isTransferTable(table) {
	return TRANSFER_TABLES.includes(table);
}
var FIELD_LABELS = {
	status: "Statut du bon",
	source_warehouse_id: "Entrepôt source",
	dest_warehouse_id: "Entrepôt destination",
	notes: "Notes",
	sent_by: "Validé au départ par",
	sent_at: "Date de départ",
	received_by: "Réceptionné par",
	received_at: "Date de réception",
	quantity: "Quantité expédiée",
	quantity_received: "Quantité reçue",
	lot_id: "Lot",
	product_id: "Produit"
};
function transferFieldLabel(field) {
	return FIELD_LABELS[field] ?? field;
}
/** Ordre d'avancement du workflow : le statut le plus avancé gagne par défaut. */
var STATUS_RANK = {
	brouillon: 0,
	en_transit: 1,
	recu: 2,
	annule: 3
};
var STATUS_LABELS = {
	brouillon: "Brouillon",
	en_transit: "En transit",
	recu: "Reçu",
	annule: "Annulé"
};
function transferValueLabel(field, value) {
	if (field === "status" && typeof value === "string") return STATUS_LABELS[value] ?? value;
	return null;
}
/**
* Recommandation par défaut pour un champ de transfert :
*  - statut : on garde l'état le plus avancé du workflow (une annulation ou une
*    réception ne doit jamais être écrasée par un retour en brouillon) ;
*  - quantités : on garde la valeur la plus faible côté réception (prudence
*    comptable), la plus récente sinon ;
*  - autres champs : la modification la plus récente.
*/
function recommendTransferDecision(field, f) {
	if (field === "status") {
		const l = STATUS_RANK[String(f.local_value)] ?? -1;
		const s = STATUS_RANK[String(f.server_value)] ?? -1;
		if (l !== s) return l > s ? "local" : "server";
	}
	if (field === "quantity_received") {
		const l = Number(f.local_value ?? 0);
		const s = Number(f.server_value ?? 0);
		if (l !== s) return l < s ? "local" : "server";
	}
	return f.local_version >= f.server_version ? "local" : "server";
}
/** Explication guidée, champ par champ, pour l'écran de résolution. */
function transferFieldHint(field, f) {
	switch (field) {
		case "status": {
			const l = String(f.local_value);
			const s = String(f.server_value);
			if (l === "annule" || s === "annule") return "Un appareil a annulé ce bon pendant qu'un autre le faisait avancer. Conservez l'annulation si la marchandise n'est jamais partie, sinon gardez l'avancement et créez un nouveau bon.";
			return "Statut divergent entre deux appareils : conservez l'étape réellement effectuée sur le terrain (le workflow ne doit pas reculer).";
		}
		case "quantity": return "La quantité expédiée diffère. Vérifiez le bon papier / le scan de l'entrepôt source avant de trancher.";
		case "quantity_received": return "La quantité reçue diffère. Retenez la quantité physiquement comptée à destination ; l'écart devra être traité en inventaire.";
		case "source_warehouse_id":
		case "dest_warehouse_id": return "Les entrepôts d'un bon déjà expédié ne devraient pas changer : privilégiez la valeur du serveur.";
		case "lot_id": return "Le lot rattaché diffère. Un mauvais lot fausse la traçabilité : confirmez avec le numéro de lot scanné.";
		default: return null;
	}
}
/** Résumé affiché dans la liste des conflits en attente. */
function transferConflictSummary(fields) {
	return fields.map((f) => transferFieldLabel(f.field)).join(", ");
}
var STATE_LABEL = {
	ok: "Synchronisé",
	pending: "En attente",
	error: "Erreur",
	offline: "Hors ligne",
	idle: "Jamais synchronisé"
};
function SyncCenterPage() {
	const online = useOnlineStatus();
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(null);
	const outbox = useLiveQuery(async () => getSyncDB().outbox.orderBy("created_at").reverse().toArray(), [], []);
	const conflicts = useLiveQuery(async () => getSyncDB().conflicts.orderBy("resolved_at").reverse().limit(100).toArray(), [], []);
	const pendingConflicts = useLiveQuery(async () => getSyncDB().pending_conflicts.where("status").equals("pending").reverse().sortBy("detected_at"), [], []);
	const pending = outbox.filter((e) => (e.attempts ?? 0) === 0).length;
	const failed = outbox.filter((e) => (e.attempts ?? 0) > 0).length;
	const handleSync = async () => {
		setSyncing(true);
		try {
			const r = await syncNow();
			if (r.errors.length > 0) toast.error(`Synchronisation partielle : ${r.errors.length} erreur(s)`);
			else toast.success(`Synchronisation OK — ${r.pushed} envoyé(s), ${r.pulled} reçu(s)`);
		} catch (e) {
			toast.error(e.message ?? "Erreur de synchronisation");
		} finally {
			setSyncing(false);
		}
	};
	const clearFailed = async () => {
		const db = getSyncDB();
		const ids = (await db.outbox.toArray()).filter((e) => (e.attempts ?? 0) > 2).map((e) => e.id);
		await db.outbox.bulkDelete(ids);
		toast.success(`${ids.length} mutation(s) abandonnée(s) supprimée(s)`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Centre de synchronisation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "État par module, conflits détectés et resynchronisation manuelle."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: online ? "secondary" : "destructive",
						className: "gap-1",
						children: [online ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-3.5" }), online ? "En ligne" : "Hors ligne"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleSync,
						disabled: syncing || !online,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: `mr-1 size-4 ${syncing ? "animate-spin" : ""}` }), "Resynchroniser"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Mutations en attente",
						value: pending,
						tone: "pending"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Mutations en erreur",
						value: failed,
						tone: "error"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Conflits à arbitrer",
						value: pendingConflicts.length,
						tone: "pending"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Conflits fusionnés",
						value: conflicts.length,
						tone: "info"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "border-b px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-semibold",
						children: [
							"Conflits à arbitrer (",
							pendingConflicts.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Un même champ a été modifié sur deux appareils. Choisissez champ par champ la valeur à conserver ; la décision est appliquée localement et renvoyée au serveur."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Détecté le" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Table" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Enregistrement" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Champs en conflit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [pendingConflicts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun conflit à arbitrer."
				}) }), pendingConflicts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: formatDateTime(new Date(c.detected_at))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: c.table
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: c.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs",
						children: [isTransferTable(c.table) ? transferConflictSummary(c.fields) : c.fields.map((f) => f.field).join(", "), isTransferTable(c.table) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "ml-2 text-[10px]",
							children: "Transfert"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setActive(c),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitMerge, { className: "mr-1 size-3.5" }), " Résoudre"]
						})
					})
				] }, c.id))] })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!active,
				onOpenChange: (o) => !o && setActive(null),
				children: active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConflictResolver, {
					conflict: active,
					onDone: () => setActive(null)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "border-b px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "État par module"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Module" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tables" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "État" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "En attente"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Erreurs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Dernière synchro"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: MODULE_TABLES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleStatusRow, {
					moduleKey: m.key,
					tables: m.tables
				}, m.key)) })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between border-b px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-semibold",
						children: [
							"File d'attente (",
							outbox.length,
							")"
						]
					}), failed > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: clearFailed,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1 size-3.5" }), " Purger les échecs répétés"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Table" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Opération" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Enregistrement" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Tentatives"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Dernière erreur" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [outbox.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucune mutation en attente — tout est synchronisé."
				}) }), outbox.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: formatDateTime(new Date(e.created_at))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: e.table
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: e.op === "delete" ? "Suppression" : "Création / MAJ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "font-mono text-[11px] text-muted-foreground",
						children: [e.row_id.slice(0, 8), "…"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right text-xs",
						children: e.attempts ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "max-w-[280px] truncate text-xs text-destructive",
						children: e.last_error ?? "—"
					})
				] }, e.id))] })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "border-b px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-semibold",
						children: [
							"Conflits détectés et résolus (",
							conflicts.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Fusion automatique champ par champ : la modification la plus récente de chaque champ est conservée."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Résolu le" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Table" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Enregistrement" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Champs conservés localement" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [conflicts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 4,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun conflit détecté."
				}) }), conflicts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: formatDateTime(new Date(c.resolved_at))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs",
						children: c.table
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "font-mono text-[11px] text-muted-foreground",
						children: [c.row_id.slice(0, 8), "…"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: c.winning_fields.join(", ") || "—"
					})
				] }, c.id))] })] })]
			})
		]
	});
}
function StatCard({ label, value, tone }) {
	const color = tone === "error" ? "text-destructive" : tone === "pending" ? "text-orange-600" : "text-emerald-600";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tone === "error" ? TriangleAlert : tone === "pending" ? RefreshCcw : CircleCheck, { className: `size-4 ${color}` }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-2 text-2xl font-semibold ${value > 0 ? color : ""}`,
			children: value
		})]
	});
}
function ModuleStatusRow({ moduleKey, tables }) {
	const s = useModuleSyncStatus(moduleKey);
	const label = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
	const dot = s.state === "ok" ? "bg-emerald-500" : s.state === "pending" ? "bg-orange-500" : s.state === "error" ? "bg-red-500" : "bg-muted-foreground/40";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-medium",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "font-mono text-[11px] text-muted-foreground",
			children: tables.join(", ")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-2 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-2 rounded-full ${dot}` }), STATE_LABEL[s.state]]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right text-xs",
			children: s.pending
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right text-xs",
			children: s.errors
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "text-right text-xs text-muted-foreground",
			children: s.lastPullAt ? formatDateTime(new Date(s.lastPullAt)) : "—"
		})
	] });
}
/**
* Résolution guidée : l'utilisateur choisit, champ par champ, la valeur
* locale ou la valeur serveur. La décision est appliquée au cache local
* et les champs "locaux" sont renvoyés au serveur via l'outbox.
*/
function ConflictResolver({ conflict, onDone }) {
	const isTransfer = isTransferTable(conflict.table);
	const [decisions, setDecisions] = (0, import_react.useState)(() => Object.fromEntries(conflict.fields.map((f) => [f.field, isTransfer ? recommendTransferDecision(f.field, f) : f.local_version >= f.server_version ? "local" : "server"])));
	const [saving, setSaving] = (0, import_react.useState)(false);
	const setAll = (choice) => setDecisions(Object.fromEntries(conflict.fields.map((f) => [f.field, choice])));
	const apply = async () => {
		setSaving(true);
		try {
			await resolvePendingConflict(conflict.id, decisions);
			toast.success("Conflit résolu et décision appliquée");
			onDone();
		} catch (e) {
			toast.error(e.message ?? "Erreur");
		} finally {
			setSaving(false);
		}
	};
	const show = (v) => v === null || v === void 0 || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Résoudre le conflit — ", conflict.label] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono",
					children: [
						conflict.table,
						" · ",
						conflict.row_id.slice(0, 8),
						"…"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => setAll("local"),
						children: "Tout garder local"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => setAll("server"),
						children: "Tout garder serveur"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[60vh] space-y-3 overflow-auto",
				children: conflict.fields.map((f) => {
					const choice = decisions[f.field] ?? "server";
					const hint = isTransfer ? transferFieldHint(f.field, f) : null;
					const recommended = isTransfer ? recommendTransferDecision(f.field, f) : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-1 text-xs font-semibold",
								children: [isTransfer ? transferFieldLabel(f.field) : f.field, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 font-mono text-[10px] font-normal text-muted-foreground",
									children: f.field
								})]
							}),
							hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-[11px] text-muted-foreground",
								children: hint
							}),
							recommended && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-2 text-[11px] font-medium text-primary",
								children: ["Recommandé : garder la valeur ", recommended === "local" ? "de cet appareil" : "du serveur"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setDecisions((d) => ({
										...d,
										[f.field]: "local"
									})),
									className: `rounded-md border p-2 text-left text-xs transition ${choice === "local" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-[10px]",
											children: "Cet appareil"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground",
											children: formatDateTime(new Date(f.local_version))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block break-words font-medium",
										children: isTransfer && transferValueLabel(f.field, f.local_value) || show(f.local_value)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setDecisions((d) => ({
										...d,
										[f.field]: "server"
									})),
									className: `rounded-md border p-2 text-left text-xs transition ${choice === "server" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-[10px]",
											children: "Serveur"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground",
											children: formatDateTime(new Date(f.server_version))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block break-words font-medium",
										children: isTransfer && transferValueLabel(f.field, f.server_value) || show(f.server_value)
									})]
								})]
							})
						]
					}, f.field);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onDone,
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				onClick: apply,
				disabled: saving,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitMerge, { className: "mr-1 size-4" }), " Appliquer la décision"]
			})] })
		]
	});
}
//#endregion
export { SyncCenterPage as component };
