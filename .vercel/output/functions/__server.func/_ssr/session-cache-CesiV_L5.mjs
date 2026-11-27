//#region node_modules/.nitro/vite/services/ssr/assets/session-cache-CesiV_L5.js
/**
* Cache local des rôles de l'utilisateur.
*
* Les rôles sont normalement lus depuis la table `user_roles`. Sans réseau,
* cette requête échoue : on retombe alors sur la dernière valeur connue pour
* garder les menus et les permissions d'affichage cohérents.
*
* Sécurité : ce cache ne sert qu'à l'affichage. Les autorisations réelles
* restent appliquées côté serveur (RLS + server functions).
*/
var KEY = "indus-erp:roles-cache";
function saveCachedRoles(userId, roles) {
	if (typeof window === "undefined") return;
	try {
		const entry = {
			userId,
			roles,
			savedAt: Date.now()
		};
		window.localStorage.setItem(KEY, JSON.stringify(entry));
	} catch {}
}
function readCachedRoles(userId) {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return null;
		const entry = JSON.parse(raw);
		return entry.userId === userId ? entry.roles : null;
	} catch {
		return null;
	}
}
function clearCachedRoles() {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(KEY);
}
/** Vrai si le navigateur se déclare hors-ligne. */
function isOffline() {
	return typeof navigator !== "undefined" && navigator.onLine === false;
}
//#endregion
export { saveCachedRoles as i, isOffline as n, readCachedRoles as r, clearCachedRoles as t };
