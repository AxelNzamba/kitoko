/**
 * CSV Export Utility
 * Génère et télécharge un fichier CSV à partir de données tabulaires.
 */

/**
 * Convertit un tableau d'objets en chaîne CSV.
 * @param headers - Définition des colonnes (key correspond à la propriété, label est l'en-tête)
 * @param rows    - Tableau d'objets à sérialiser
 */
export function toCsv<T extends Record<string, unknown>>(
  headers: { key: keyof T; label: string }[],
  rows: T[],
): string {
  const esc = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    // Échapper les guillemets et entourer de quotes si nécessaire
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headerLine = headers.map((h) => esc(h.label)).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => esc(row[h.key])).join(","),
  );

  // BOM UTF-8 pour que Excel reconnaisse les accents
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

/**
 * Déclenche le téléchargement d'un fichier CSV dans le navigateur.
 */
export function downloadCsv(csv: string, filename: string) {
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
export function exportToCsv<T extends Record<string, unknown>>(
  headers: { key: keyof T; label: string }[],
  rows: T[],
  filename: string,
) {
  const csv = toCsv(headers, rows);
  downloadCsv(csv, filename);
}
