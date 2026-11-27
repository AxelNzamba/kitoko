//#region node_modules/.nitro/vite/services/ssr/assets/format-DUkOQpcu.js
function formatXOF(n) {
	return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " F";
}
function formatDate(d) {
	return (typeof d === "string" ? new Date(d) : d).toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	});
}
function formatDateTime(d) {
	return (typeof d === "string" ? new Date(d) : d).toLocaleString("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function generateSKU() {
	return "PRD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
function generateBarcode() {
	return (Date.now().toString() + Math.floor(Math.random() * 1e3).toString().padStart(3, "0")).slice(-13).padStart(13, "0");
}
function generateSaleNumber() {
	const d = /* @__PURE__ */ new Date();
	const pad = (n) => n.toString().padStart(2, "0");
	return `V${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
//#endregion
export { generateSKU as a, generateBarcode as i, formatDateTime as n, generateSaleNumber as o, formatXOF as r, formatDate as t };
