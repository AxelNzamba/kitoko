import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { At as Check, L as Plus, Mt as Camera, bt as CircleStop, ut as FileDown } from "../_libs/lucide-react.mjs";
import { n as formatDateTime } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { t as exportToCsv } from "./csv-bEMY3y7g.mjs";
import { t as exportTablePdf } from "./pdf-table-D7ZtlDDS.mjs";
import { t as useWarehouseFilter } from "./warehouse-filter-DuSqDZ_e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventaire-xIUAuC7S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InventairePage() {
	const qc = useQueryClient();
	const { selectedWarehouseId, applyFilter } = useWarehouseFilter();
	const [activeSession, setActiveSession] = (0, import_react.useState)(null);
	const [openNew, setOpenNew] = (0, import_react.useState)(false);
	const { data: sessions = [] } = useQuery({
		queryKey: ["inv_sessions", selectedWarehouseId],
		queryFn: async () => {
			let q = supabase.from("inventory_sessions").select("*").order("created_at", { ascending: false });
			q = applyFilter(q, "warehouse_id");
			const { data } = await q;
			return data ?? [];
		}
	});
	const createSession = useMutation({
		mutationFn: async (name) => {
			const { data: u } = await supabase.auth.getUser();
			const payload = {
				name,
				created_by: u.user?.id
			};
			if (selectedWarehouseId && selectedWarehouseId !== "all") payload.warehouse_id = selectedWarehouseId;
			const { data, error } = await supabase.from("inventory_sessions").insert(payload).select().single();
			if (error) throw error;
			return data;
		},
		onSuccess: (s) => {
			toast.success("Session créée");
			qc.invalidateQueries({ queryKey: ["inv_sessions"] });
			setActiveSession(s);
			setOpenNew(false);
		},
		onError: (e) => toast.error(e.message)
	});
	if (activeSession) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventorySessionView, {
		session: activeSession,
		onExit: () => setActiveSession(null)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Inventaire"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Comptage par scanner QR et calcul d'écarts."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open: openNew,
				onOpenChange: setOpenNew,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Nouvelle session"] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewSessionDialog, {
					onSubmit: (n) => createSession.mutate(n),
					onClose: () => setOpenNew(false)
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-lg border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Nom" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Créée le" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [sessions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 4,
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Aucune session."
			}) }), sessions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-medium",
					children: s.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `rounded px-2 py-0.5 text-xs ${s.status === "ouverte" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`,
					children: s.status
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-sm text-muted-foreground",
					children: new Date(s.created_at).toLocaleString("fr-FR")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setActiveSession(s),
						children: "Ouvrir"
					})
				})
			] }, s.id))] })] })
		})]
	});
}
function NewSessionDialog({ onSubmit, onClose }) {
	const [name, setName] = (0, import_react.useState)(`Inventaire ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR")}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouvelle session" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			if (name.trim()) onSubmit(name.trim());
		},
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: name,
				onChange: (e) => setName(e.target.value)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			onClick: onClose,
			children: "Annuler"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			children: "Créer"
		})] })]
	})] });
}
function InventorySessionView({ session, onExit }) {
	const qc = useQueryClient();
	const { selectedWarehouseId } = useWarehouseFilter();
	const [scannerOpen, setScannerOpen] = (0, import_react.useState)(false);
	const [scannedLot, setScannedLot] = (0, import_react.useState)(null);
	const [countValue, setCountValue] = (0, import_react.useState)("");
	const { data: counts = [] } = useQuery({
		queryKey: ["counts", session.id],
		queryFn: async () => (await supabase.from("inventory_counts").select("*, lots(lot_number, quantity, products(name, sku))").eq("session_id", session.id).order("created_at")).data ?? []
	});
	const { data: stockView = [] } = useQuery({
		queryKey: ["lot_stock", selectedWarehouseId],
		queryFn: async () => {
			let q;
			if (selectedWarehouseId && selectedWarehouseId !== "all") q = supabase.from("lot_stock_by_warehouse").select("*").eq("warehouse_id", selectedWarehouseId);
			else q = supabase.from("lot_stock").select("*");
			const { data } = await q;
			return data ?? [];
		}
	});
	const stockMap = new Map(stockView.map((s) => [s.lot_id, Number(s.current_quantity)]));
	const addCount = useMutation({
		mutationFn: async ({ lotId, qty }) => {
			const { error } = await supabase.from("inventory_counts").upsert({
				session_id: session.id,
				lot_id: lotId,
				counted_quantity: qty
			}, { onConflict: "session_id,lot_id" });
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Comptage enregistré");
			qc.invalidateQueries({ queryKey: ["counts", session.id] });
			setScannedLot(null);
			setCountValue("");
		},
		onError: (e) => toast.error(e.message)
	});
	const closeSession = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("inventory_sessions").update({
				status: "cloturee",
				closed_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", session.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Session clôturée");
			onExit();
		}
	});
	const EXPORT_HEADERS = [
		{
			key: "product",
			label: "Produit"
		},
		{
			key: "sku",
			label: "SKU"
		},
		{
			key: "lot",
			label: "Lot"
		},
		{
			key: "theorique",
			label: "Stock théorique"
		},
		{
			key: "compte",
			label: "Compté"
		},
		{
			key: "ecart",
			label: "Écart"
		},
		{
			key: "date",
			label: "Comptage le"
		}
	];
	function buildRows() {
		return counts.map((c) => {
			const theo = stockMap.get(c.lot_id) ?? Number(c.lots?.quantity ?? 0);
			const gap = Number(c.counted_quantity) - theo;
			return {
				product: c.lots?.products?.name ?? "",
				sku: c.lots?.products?.sku ?? "",
				lot: c.lots?.lot_number ?? "",
				theorique: String(theo),
				compte: String(Number(c.counted_quantity)),
				ecart: gap > 0 ? `+${gap}` : String(gap),
				date: c.created_at ? formatDateTime(c.created_at) : ""
			};
		});
	}
	async function exportCounts(kind) {
		const rows = buildRows();
		const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		if (kind === "csv") {
			exportToCsv(EXPORT_HEADERS, rows, `inventaire-${session.name}-${stamp}.csv`);
			return;
		}
		await exportTablePdf({
			title: `Inventaire — ${session.name}`,
			subtitle: `Statut : ${session.status}`,
			headers: EXPORT_HEADERS.map((h) => h.label),
			rows: rows.map((r) => EXPORT_HEADERS.map((h) => r[h.key] ?? "")),
			filename: `inventaire-${stamp}.pdf`,
			landscape: true,
			footerNote: `${rows.length} ligne(s) comptée(s).`
		});
	}
	async function handleScan(code) {
		setScannerOpen(false);
		let asLotQ = supabase.from("lots").select("*, products(name, sku)").eq("lot_number", code);
		if (selectedWarehouseId && selectedWarehouseId !== "all") asLotQ = asLotQ.eq("warehouse_id", selectedWarehouseId);
		const asLot = await asLotQ.maybeSingle();
		if (asLot.data) {
			setScannedLot(asLot.data);
			return;
		}
		const asProd = await supabase.from("products").select("id, name, sku").or(`sku.eq.${code},barcode.eq.${code}`).maybeSingle();
		if (asProd.data) {
			let lQ = supabase.from("lots").select("*, products(name, sku)").eq("product_id", asProd.data.id).order("reception_date", { ascending: false }).limit(1);
			if (selectedWarehouseId && selectedWarehouseId !== "all") lQ = lQ.eq("warehouse_id", selectedWarehouseId);
			const l = await lQ.maybeSingle();
			if (l.data) {
				setScannedLot(l.data);
				return;
			}
			toast.error("Produit trouvé mais aucun lot associé");
			return;
		}
		toast.error(`Code inconnu : ${code}`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onExit,
							className: "text-xs text-muted-foreground hover:underline",
							children: "← Retour"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold",
							children: session.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: ["Statut : ", session.status]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => exportCounts("csv"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " CSV"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => exportCounts("pdf"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1 size-4" }), " PDF"]
						})]
					}),
					session.status === "ouverte" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => setScannerOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-1 size-4" }), " Scanner QR"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => closeSession.mutate(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleStop, { className: "mr-1 size-4" }), " Clôturer"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: scannerOpen,
				onOpenChange: setScannerOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Scanner un QR / code-barres" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrScanner, { onResult: handleScan })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!scannedLot,
				onOpenChange: (o) => !o && setScannedLot(null),
				children: scannedLot && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Compter le lot" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: scannedLot.products?.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-muted-foreground",
									children: ["Lot : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: scannedLot.lot_number
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-muted-foreground",
									children: ["Stock théorique : ", stockMap.get(scannedLot.id) ?? scannedLot.quantity]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Quantité comptée" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.001",
								value: countValue,
								onChange: (e) => setCountValue(e.target.value),
								autoFocus: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setScannedLot(null),
							children: "Annuler"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => addCount.mutate({
								lotId: scannedLot.id,
								qty: Number(countValue)
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-4" }), " Enregistrer"]
						})] })
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Lot" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Théorique"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Compté"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Écart"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [counts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-10 text-center text-sm text-muted-foreground",
					children: "Aucun comptage. Scannez un lot pour commencer."
				}) }), counts.map((c) => {
					const theo = stockMap.get(c.lot_id) ?? Number(c.lots?.quantity ?? 0);
					const gap = Number(c.counted_quantity) - theo;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c.lots?.products?.name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: c.lots?.lot_number
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: theo
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-semibold",
							children: Number(c.counted_quantity)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: `text-right font-semibold ${gap === 0 ? "text-muted-foreground" : gap < 0 ? "text-destructive" : "text-emerald-600"}`,
							children: gap > 0 ? `+${gap}` : gap
						})
					] }, c.id);
				})] })] })
			})
		]
	});
}
function QrScanner({ onResult }) {
	const ref = (0, import_react.useRef)(null);
	const [manual, setManual] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let scanner;
		let stopped = false;
		(async () => {
			const { Html5Qrcode } = await import("../_libs/html5-qrcode.mjs").then((n) => n.t);
			if (!ref.current || stopped) return;
			scanner = new Html5Qrcode(ref.current.id);
			try {
				await scanner.start({ facingMode: "environment" }, {
					fps: 10,
					qrbox: 240
				}, (decoded) => {
					if (!stopped) {
						stopped = true;
						scanner.stop().catch(() => {});
						onResult(decoded);
					}
				}, () => {});
			} catch (e) {
				console.warn("Caméra indisponible", e);
			}
		})();
		return () => {
			stopped = true;
			if (scanner) try {
				scanner.stop().catch(() => {});
			} catch {}
		};
	}, [onResult]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			id: "qr-reader",
			ref,
			className: "mx-auto w-full max-w-sm overflow-hidden rounded border"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ou saisir manuellement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: manual,
					onChange: (e) => setManual(e.target.value),
					placeholder: "SKU / N° lot / code-barres"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => manual && onResult(manual),
					children: "OK"
				})]
			})]
		})]
	});
}
//#endregion
export { InventairePage as component };
