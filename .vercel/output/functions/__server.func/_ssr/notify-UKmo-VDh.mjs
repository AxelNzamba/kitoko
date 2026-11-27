import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notify-UKmo-VDh.js
var STORAGE_KEY = "indus-erp-notifications";
var MAX = 30;
var listeners = /* @__PURE__ */ new Set();
function load() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}
function save(list) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	listeners.forEach((l) => l(list));
}
function subscribeNotifications(l) {
	listeners.add(l);
	l(load());
	return () => {
		listeners.delete(l);
	};
}
function markAllRead() {
	save(load().map((n) => ({
		...n,
		read: true
	})));
}
function clearNotifications() {
	save([]);
}
/** Petit son généré via Web Audio API — pas de fichier requis. */
function playSound(level) {
	if (typeof window === "undefined") return;
	try {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (!Ctx) return;
		const ctx = new Ctx();
		const now = ctx.currentTime;
		({
			success: [660, 880],
			info: [520, 700],
			warning: [500, 400],
			error: [
				400,
				260,
				200
			]
		})[level].forEach((f, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(f, now + i * .09);
			gain.gain.setValueAtTime(1e-4, now + i * .09);
			gain.gain.exponentialRampToValueAtTime(.18, now + i * .09 + .01);
			gain.gain.exponentialRampToValueAtTime(1e-4, now + i * .09 + .16);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + i * .09);
			osc.stop(now + i * .09 + .18);
		});
		setTimeout(() => ctx.close().catch(() => {}), 800);
	} catch {}
}
function push(level, title, description) {
	const list = load();
	save([{
		id: crypto.randomUUID(),
		level,
		title,
		description,
		createdAt: Date.now(),
		read: false
	}, ...list].slice(0, MAX));
	playSound(level);
	const opts = description ? { description } : void 0;
	if (level === "success") toast.success(title, opts);
	else if (level === "error") toast.error(title, opts);
	else if (level === "warning") toast.warning(title, opts);
	else toast.info(title, opts);
}
var notify = {
	success: (title, description) => push("success", title, description),
	error: (title, description) => push("error", title, description),
	warning: (title, description) => push("warning", title, description),
	info: (title, description) => push("info", title, description)
};
//#endregion
export { subscribeNotifications as i, markAllRead as n, notify as r, clearNotifications as t };
