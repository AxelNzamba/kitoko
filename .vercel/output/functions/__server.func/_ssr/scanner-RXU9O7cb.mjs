import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { Ft as Boxes, H as Package, M as RotateCcw, Mt as Camera, lt as FileText } from "../_libs/lucide-react.mjs";
import { r as formatXOF, t as formatDate } from "./format-DUkOQpcu.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scanner-RXU9O7cb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScannerPage() {
	const [scanning, setScanning] = (0, import_react.useState)(true);
	const [result, setResult] = (0, import_react.useState)(null);
	const [manual, setManual] = (0, import_react.useState)("");
	async function lookup(code) {
		setScanning(false);
		const clean = code.trim();
		if (!clean) return;
		const asProd = await supabase.from("products").select("*, categories(name)").or(`sku.eq.${clean},barcode.eq.${clean}`).maybeSingle();
		if (asProd.data) {
			const lots = await supabase.from("lots").select("id, lot_number, reception_date, quantity, certificate_url, suppliers(name)").eq("product_id", asProd.data.id).order("reception_date", { ascending: false });
			setResult({
				kind: "product",
				product: asProd.data,
				lots: lots.data ?? []
			});
			return;
		}
		const asLot = await supabase.from("lots").select("*, products(name, sku), suppliers(name)").eq("lot_number", clean).maybeSingle();
		if (asLot.data) {
			setResult({
				kind: "lot",
				lot: asLot.data
			});
			return;
		}
		setResult({
			kind: "none",
			code: clean
		});
	}
	function reset() {
		setResult(null);
		setManual("");
		setScanning(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Scanner QR"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Terminal de reconnaissance produit ou lot."
				})] }), result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: reset,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mr-1 size-4" }), " Nouveau scan"]
				})]
			}),
			scanning && !result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4 text-accent" }), " Caméra"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrScanner, { onResult: lookup })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 text-sm font-medium",
						children: "Saisie manuelle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							if (manual) lookup(manual);
						},
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "SKU / N° lot / code-barres" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: manual,
								onChange: (e) => setManual(e.target.value),
								placeholder: "Ex : PRD-XXXXXX",
								autoFocus: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Rechercher"
							})
						]
					})]
				})]
			}),
			result?.kind === "product" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-start gap-4",
						children: [result.product.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: result.product.photo_url,
							alt: "",
							className: "size-24 rounded object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-24 items-center justify-center rounded bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-8 text-muted-foreground" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs uppercase text-muted-foreground",
								children: "Produit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: result.product.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									"SKU ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: result.product.sku
									}),
									result.product.categories?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", result.product.categories.name] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Achat : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatXOF(Number(result.product.purchase_price ?? 0)) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Vente : ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatXOF(Number(result.product.sale_price ?? 0)) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"TVA : ",
										Number(result.product.vat ?? 0),
										"%"
									] })
								]
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center gap-2 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, { className: "size-4" }), " Lots"]
					}),
					result.lots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded border border-dashed p-4 text-sm text-muted-foreground",
						children: "Aucun lot enregistré."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y rounded border",
						children: result.lots.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-xs",
								children: l.lot_number
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									l.suppliers?.name ?? "—",
									" · ",
									formatDate(l.reception_date),
									" · Qté init. ",
									Number(l.quantity)
								]
							})] }), l.certificate_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: l.certificate_url,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex items-center gap-1 text-accent hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), " Certificat"]
							})]
						}, l.id))
					})
				]
			}),
			result?.kind === "lot" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase text-muted-foreground",
						children: "Lot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold font-mono",
						children: result.lot.lot_number
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 space-y-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								"Produit : ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: result.lot.products?.name }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										"(",
										result.lot.products?.sku,
										")"
									]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Fournisseur : ", result.lot.suppliers?.name ?? "—"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Réception : ", formatDate(result.lot.reception_date)] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Quantité initiale : ", Number(result.lot.quantity)] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Prix unitaire achat : ", formatXOF(Number(result.lot.unit_purchase_price))] })
						]
					}),
					result.lot.certificate_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: result.lot.certificate_url,
						target: "_blank",
						rel: "noreferrer",
						className: "mt-3 inline-flex items-center gap-1 text-sm text-accent hover:underline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), " Consulter le certificat"]
					})
				]
			}),
			result?.kind === "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground",
				children: [
					"Aucun produit ou lot trouvé pour le code ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: result.code
					}),
					"."
				]
			})
		]
	});
}
function QrScanner({ onResult }) {
	const ref = (0, import_react.useRef)(null);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "qr-scanner-standalone",
		ref,
		className: "mx-auto w-full max-w-sm overflow-hidden rounded border"
	});
}
//#endregion
export { ScannerPage as component };
