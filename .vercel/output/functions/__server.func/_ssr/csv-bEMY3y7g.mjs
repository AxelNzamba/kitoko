//#region node_modules/.nitro/vite/services/ssr/assets/csv-bEMY3y7g.js
/**
* CSV Export Utility
* Génère et télécharge un fichier CSV à partir de données tabulaires.
*/
/**
* Convertit un tableau d'objets en chaîne CSV.
* @param headers - Définition des colonnes (key correspond à la propriété, label est l'en-tête)
* @param rows    - Tableau d'objets à sérialiser
*/
function toCsv(headers, rows) {
	const esc = (v) => {
		const s = v == null ? "" : String(v);
		if (s.includes(",") || s.includes("\"") || s.includes("\n") || s.includes("\r")) return `"${s.replace(/"/g, "\"\"")}"`;
		return s;
	};
	return "﻿" + [headers.map((h) => esc(h.label)).join(","), ...rows.map((row) => headers.map((h) => esc(row[h.key])).join(","))].join("\r\n");
}
/**
* Déclenche le téléchargement d'un fichier CSV dans le navigateur.
*/
function downloadCsv(csv, filename) {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
/**
* Raccourci tout-en-un : génère le CSV et le télécharge.
*/
function exportToCsv(headers, rows, filename) {
	downloadCsv(toCsv(headers, rows), filename);
}
//#endregion
export { exportToCsv as t };
