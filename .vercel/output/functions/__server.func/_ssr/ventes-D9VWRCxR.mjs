import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { O as Search, P as Receipt, h as Trash2, tt as Keyboard, z as Percent } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { o as generateSaleNumber, r as formatXOF } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as checkAndNotifyAlerts } from "./use-stock-alerts-mO5rUefU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ventes-D9VWRCxR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VentesPage() {
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const debouncedSearch = useDebounce(search, 200);
	const [cart, setCart] = (0, import_react.useState)([]);
	const [paymentMode, setPaymentMode] = (0, import_react.useState)("especes");
	const [clientName, setClientName] = (0, import_react.useState)("");
	const [globalDiscount, setGlobalDiscount] = (0, import_react.useState)(0);
	const [showShortcuts, setShowShortcuts] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const handler = (e) => {
			if (e.key === "Escape") setSearch("");
			if (e.key === "F8") {
				e.preventDefault();
				document.querySelector("input[placeholder*='Rechercher']")?.focus();
			}
			if (e.key === "F9") {
				e.preventDefault();
				if (cart.length > 0) submit.mutate();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [cart]);
	const { data: products = [] } = useQuery({
		queryKey: ["products", "pos"],
		queryFn: async () => (await supabase.from("products").select("id, name, sku, barcode, sale_price, tva").order("name")).data ?? []
	});
	const filtered = (0, import_react.useMemo)(() => {
		if (!debouncedSearch.trim()) return products.slice(0, 12);
		const s = debouncedSearch.toLowerCase();
		const results = products.filter((p) => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || (p.barcode ?? "").includes(s));
		results.sort((a, b) => {
			const aName = a.name.toLowerCase().indexOf(s);
			const bName = b.name.toLowerCase().indexOf(s);
			if (aName === -1 && bName === -1) return 0;
			if (aName === -1) return 1;
			if (bName === -1) return -1;
			return aName - bName;
		});
		return results.slice(0, 12);
	}, [products, debouncedSearch]);
	const addToCart = (0, import_react.useCallback)((p) => {
		setCart((c) => {
			if (c.find((l) => l.product_id === p.id)) return c.map((l) => l.product_id === p.id ? {
				...l,
				quantity: l.quantity + 1
			} : l);
			return [{
				product_id: p.id,
				name: p.name,
				sku: p.sku,
				quantity: 1,
				unit_price: Number(p.sale_price),
				tva: Number(p.tva),
				discount_pct: 0
			}, ...c];
		});
		setSearch("");
	}, []);
	const updateLine = (0, import_react.useCallback)((index, updates) => {
		setCart((c) => c.map((l, i) => i === index ? {
			...l,
			...updates
		} : l));
	}, []);
	const removeLine = (0, import_react.useCallback)((index) => {
		setCart((c) => c.filter((_, i) => i !== index));
	}, []);
	const totals = (0, import_react.useMemo)(() => {
		let ht = 0, tva = 0, discountTotal = 0;
		for (const l of cart) {
			const sub = l.unit_price * l.quantity;
			const discount = sub * (l.discount_pct / 100);
			const afterDiscount = sub - discount;
			ht += afterDiscount;
			tva += afterDiscount * l.tva / 100;
			discountTotal += discount;
		}
		const htAfterGlobal = ht * (1 - globalDiscount / 100);
		const tvaAfterGlobal = htAfterGlobal / ht * tva || 0;
		return {
			ht: htAfterGlobal,
			tva: tvaAfterGlobal,
			ttc: htAfterGlobal + tvaAfterGlobal,
			discountTotal,
			globalDiscountAmount: ht - htAfterGlobal
		};
	}, [cart, globalDiscount]);
	const submit = useMutation({
		mutationFn: async () => {
			if (cart.length === 0) throw new Error("Panier vide");
			const number = generateSaleNumber();
			const { data: u } = await supabase.auth.getUser();
			const sale = await supabase.from("sales").insert({
				number,
				total_ht: totals.ht,
				total_tva: totals.tva,
				total_ttc: totals.ttc,
				payment_mode: paymentMode,
				client_name: clientName || null,
				created_by: u.user?.id
			}).select().single();
			if (sale.error) throw sale.error;
			for (const l of cart) {
				const { data: lots } = await supabase.from("lots").select("id, quantity").eq("product_id", l.product_id).order("reception_date", { ascending: true });
				const firstLot = lots?.[0];
				const item = await supabase.from("sale_items").insert({
					sale_id: sale.data.id,
					product_id: l.product_id,
					lot_id: firstLot?.id ?? null,
					quantity: l.quantity,
					unit_price: l.unit_price * (1 - l.discount_pct / 100),
					tva: l.tva
				});
				if (item.error) throw item.error;
				const mov = await supabase.from("stock_movements").insert({
					product_id: l.product_id,
					lot_id: firstLot?.id ?? null,
					type: "sortie",
					quantity: l.quantity,
					unit_price: l.unit_price * (1 - l.discount_pct / 100),
					reason: `Vente ${number}${l.discount_pct > 0 ? ` (remise ${l.discount_pct}%)` : ""}`,
					created_by: u.user?.id
				});
				if (mov.error) throw mov.error;
			}
			return {
				number,
				sale: sale.data
			};
		},
		onSuccess: async ({ number }) => {
			toast.success(`Vente ${number} enregistrée`);
			await generateInvoicePDF(number, cart, totals, paymentMode, clientName);
			const saleClientName = clientName.trim();
			if (saleClientName) setTimeout(() => {
				if (window.confirm(`Envoyer la facture ${number} par email à ${saleClientName} ?`)) handleSendInvoiceEmail(number, cart, totals, paymentMode, saleClientName);
			}, 1e3);
			setCart([]);
			setClientName("");
			setGlobalDiscount(0);
			qc.invalidateQueries({ queryKey: ["movements"] });
			qc.invalidateQueries({ queryKey: ["lot_stock"] });
			qc.invalidateQueries({ queryKey: ["stock-alerts"] });
			checkAndNotifyAlerts();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Ventes / POS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						"Caisse rapide · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded bg-muted px-1 font-mono text-xs",
							children: "F8"
						}),
						" recherche · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded bg-muted px-1 font-mono text-xs",
							children: "F9"
						}),
						" valider"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => setShowShortcuts(!showShortcuts),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "mr-1 size-4" }), " Raccourcis"]
				})]
			}),
			showShortcuts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-3 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 font-semibold",
					children: "Raccourcis clavier"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-1 text-muted-foreground sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded bg-muted px-1 font-mono",
							children: "F8"
						}), " Focus recherche"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded bg-muted px-1 font-mono",
							children: "F9"
						}), " Valider la vente"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded bg-muted px-1 font-mono",
							children: "Échap"
						}), " Vider recherche"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded bg-muted px-1 font-mono",
							children: "↑↓"
						}), " Naviguer résultats"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded bg-muted px-1 font-mono",
							children: "Entrée"
						}), " Ajouter au panier"] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[1fr_400px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "pl-9",
							placeholder: "Rechercher un produit (nom, SKU, code-barres)...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							autoFocus: true
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
						children: [filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => addToCart(p),
							className: "flex flex-col rounded-lg border border-border bg-card p-3 text-left transition hover:border-accent hover:shadow-sm active:scale-[0.97]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "line-clamp-2 text-sm font-medium",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 font-mono text-[10px] text-muted-foreground",
									children: p.sku
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-2 text-sm font-semibold text-accent",
									children: formatXOF(Number(p.sale_price))
								})
							]
						}, p.id)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "col-span-full py-8 text-center text-sm text-muted-foreground",
							children: "Aucun produit trouvé."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col rounded-lg border border-border bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-semibold",
								children: [
									"Panier (",
									cart.length,
									")"
								]
							}), cart.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setCart([]),
								className: "text-[11px] text-muted-foreground hover:text-destructive",
								children: "Vider"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-h-[400px] flex-1 overflow-y-auto p-3",
							children: [cart.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "py-8 text-center text-sm text-muted-foreground",
								children: "Panier vide."
							}), cart.map((l, i) => {
								const lineTotal = l.unit_price * l.quantity;
								const lineDiscounted = lineTotal * (1 - l.discount_pct / 100);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 rounded border p-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "line-clamp-1 font-medium",
											children: l.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => removeLine(i),
											className: "text-muted-foreground hover:text-destructive",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												className: "h-7 w-16",
												value: l.quantity,
												onChange: (e) => updateLine(i, { quantity: Number(e.target.value) || 0 })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "×"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												className: "h-7 w-24",
												value: l.unit_price,
												onChange: (e) => updateLine(i, { unit_price: Number(e.target.value) })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative flex items-center",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Percent, { className: "pointer-events-none absolute left-1.5 size-3 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													className: "h-7 w-16 pl-6",
													value: l.discount_pct,
													min: 0,
													max: 100,
													onChange: (e) => updateLine(i, { discount_pct: Number(e.target.value) || 0 }),
													title: "Remise %"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-auto text-right",
												children: l.discount_pct > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground line-through",
														children: formatXOF(lineTotal)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-accent",
														children: formatXOF(lineDiscounted)
													})
												] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold",
													children: formatXOF(lineTotal)
												})
											})
										]
									})]
								}, `${l.product_id}-${i}`);
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t p-3 text-sm",
							children: [
								totals.discountTotal > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Remises lignes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["-", formatXOF(totals.discountTotal)] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Remise globale"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "h-6 w-16 text-right text-xs",
											value: globalDiscount,
											min: 0,
											max: 100,
											onChange: (e) => setGlobalDiscount(Number(e.target.value) || 0)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "%"
										})]
									})]
								}),
								totals.globalDiscountAmount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Remise globale" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["-", formatXOF(totals.globalDiscountAmount)] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Total HT"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatXOF(totals.ht) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "TVA"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatXOF(totals.tva) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex justify-between text-lg font-bold text-accent",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TTC" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatXOF(totals.ttc) })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 border-t p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Client (optionnel)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: clientName,
										onChange: (e) => setClientName(e.target.value),
										placeholder: "Nom client"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Paiement"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: paymentMode,
										onValueChange: setPaymentMode,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "especes",
												children: "Espèces"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "mobile_money",
												children: "Mobile Money"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "carte",
												children: "Carte bancaire"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "virement",
												children: "Virement"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "cheque",
												children: "Chèque"
											})
										] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "mt-1",
									disabled: cart.length === 0 || submit.isPending,
									onClick: () => submit.mutate(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "mr-1 size-4" }), submit.isPending ? "Enregistrement..." : "Valider & imprimer"]
								})
							]
						})
					]
				})]
			})
		]
	});
}
function handleSendInvoiceEmail(number, items, totals, paymentMode, clientName) {
	const email = prompt(`Adresse email pour envoyer la facture ${number} :`, "");
	if (!email) return;
	const itemsHtml = items.map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${formatXOF(i.unit_price)}</td><td>${i.discount_pct > 0 ? i.discount_pct + "%" : "—"}</td><td style="text-align:right">${formatXOF(i.unit_price * i.quantity * (1 - i.discount_pct / 100))}</td></tr>`).join("");
	`${number}`, clientName && `${clientName}`, `${itemsHtml}${formatXOF(totals.ttc)}${paymentMode}`;
	toast.info(`Email simulé — configurer une clé Resend (VITE_RESEND_API_KEY) pour l'envoi réel à ${email}`);
}
async function generateInvoicePDF(number, items, totals, paymentMode, clientName) {
	const { default: jsPDF } = await import("../_libs/jspdf.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const autoTable = (await import("../_libs/jspdf-autotable.mjs").then((n) => n.t)).default;
	const doc = new jsPDF();
	doc.setFontSize(18);
	doc.text("FACTURE", 14, 20);
	doc.setFontSize(10);
	doc.text(`N° ${number}`, 14, 28);
	doc.text(`Date : ${(/* @__PURE__ */ new Date()).toLocaleString("fr-FR")}`, 14, 34);
	if (clientName) doc.text(`Client : ${clientName}`, 14, 40);
	doc.text(`Paiement : ${paymentMode}`, 14, clientName ? 46 : 40);
	autoTable(doc, {
		startY: 56,
		head: [[
			"Produit",
			"SKU",
			"Qté",
			"PU",
			"Rem.%",
			"Total HT"
		]],
		body: items.map((i) => [
			i.name,
			i.sku,
			i.quantity.toString(),
			formatXOF(i.unit_price),
			i.discount_pct > 0 ? `${i.discount_pct}%` : "—",
			formatXOF(i.unit_price * i.quantity * (1 - i.discount_pct / 100))
		]),
		styles: { fontSize: 9 },
		headStyles: { fillColor: [
			23,
			42,
			69
		] }
	});
	const y = doc.lastAutoTable.finalY + 10;
	doc.setFontSize(10);
	if (totals.discountTotal > 0) {
		doc.text(`Remises : -${formatXOF(totals.discountTotal)}`, 140, y);
		doc.text(`Total HT : ${formatXOF(totals.ht)}`, 140, y + 6);
		doc.text(`TVA : ${formatXOF(totals.tva)}`, 140, y + 12);
		doc.setFontSize(12);
		doc.setFont(void 0, "bold");
		doc.text(`TOTAL TTC : ${formatXOF(totals.ttc)}`, 140, y + 20);
	} else {
		doc.text(`Total HT : ${formatXOF(totals.ht)}`, 140, y);
		doc.text(`TVA : ${formatXOF(totals.tva)}`, 140, y + 6);
		doc.setFontSize(12);
		doc.setFont(void 0, "bold");
		doc.text(`TOTAL TTC : ${formatXOF(totals.ttc)}`, 140, y + 14);
	}
	doc.save(`facture-${number}.pdf`);
}
//#endregion
export { VentesPage as component };
