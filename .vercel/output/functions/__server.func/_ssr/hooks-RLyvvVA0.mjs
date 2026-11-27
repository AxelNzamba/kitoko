import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Dexie } from "../_libs/dexie.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hooks-RLyvvVA0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var MODULE_TABLES = [
	{
		key: "produits",
		tables: ["products"]
	},
	{
		key: "categories",
		tables: ["categories"]
	},
	{
		key: "stock",
		tables: ["stock_movements"]
	},
	{
		key: "lots",
		tables: ["lots"]
	},
	{
		key: "certificats",
		tables: ["lots"]
	},
	{
		key: "inventaire",
		tables: ["inventory_sessions", "inventory_counts"]
	},
	{
		key: "ventes",
		tables: ["sales", "sale_items"]
	},
	{
		key: "clients",
		tables: ["clients"]
	},
	{
		key: "achats",
		tables: ["lots"]
	},
	{
		key: "fournisseurs",
		tables: ["suppliers"]
	},
	{
		key: "depenses",
		tables: ["expenses"]
	},
	{
		key: "transferts",
		tables: ["stock_transfers", "stock_transfer_items"]
	}
];
/**
* Toutes les tables métier synchronisées.
*/
var SYNC_TABLES = [
	"products",
	"categories",
	"suppliers",
	"clients",
	"lots",
	"stock_movements",
	"sales",
	"sale_items",
	"inventory_sessions",
	"inventory_counts",
	"expenses",
	"stock_transfers",
	"stock_transfer_items"
];
var SyncDB = class extends Dexie {
	outbox;
	sync_state;
	conflicts;
	pending_conflicts;
	constructor() {
		super("indus-erp-sync");
		const stores = {
			outbox: "++id, table, created_at",
			sync_state: "table",
			conflicts: "++id, table, resolved_at"
		};
		for (const t of SYNC_TABLES) stores[t] = "id, updated_at, _deleted";
		this.version(1).stores(stores);
		this.version(2).stores({
			...stores,
			pending_conflicts: "++id, table, status, detected_at"
		});
		this.version(3).stores({
			...stores,
			pending_conflicts: "++id, table, status, detected_at"
		});
	}
	cache(table) {
		return this.table(table);
	}
};
var _db = null;
/**
* Accès paresseux : Dexie ne s'ouvre que côté navigateur.
*/
function getSyncDB() {
	if (typeof window === "undefined") throw new Error("SyncDB accessed on server");
	if (!_db) _db = new SyncDB();
	return _db;
}
/**
* Identifiant unique de l'appareil, stable, stocké localement.
* Sert au serveur à identifier l'origine d'une modification.
*/
function getClientId() {
	if (typeof window === "undefined") return "server";
	const KEY = "indus-erp:client-id";
	let id = localStorage.getItem(KEY);
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem(KEY, id);
	}
	return id;
}
var IGNORED_FIELDS = /* @__PURE__ */ new Set([
	"id",
	"created_at",
	"updated_at",
	"_field_versions",
	"_client_id",
	"_deleted"
]);
function rowLabel(row) {
	for (const k of [
		"name",
		"number",
		"sku",
		"lot_number",
		"label",
		"ticket_number",
		"po_number",
		"transfer_number"
	]) {
		const v = row[k];
		if (typeof v === "string" && v.trim()) return v;
	}
	return String(row.id).slice(0, 8) + "…";
}
/**
* Détecte un conflit réel nécessitant un arbitrage : un champ a été modifié
* localement ET côté serveur (les deux versions sont non nulles) avec des
* valeurs différentes. Le CRDT tranche automatiquement, mais l'utilisateur
* peut ensuite revenir sur la décision champ par champ.
*/
function detectConflict(table, local, remote) {
	if (!local) return null;
	const localV = local._field_versions ?? {};
	const remoteV = remote._field_versions ?? {};
	const fields = [];
	for (const k of Object.keys(localV)) {
		if (IGNORED_FIELDS.has(k)) continue;
		const lv = localV[k] ?? 0;
		const rv = remoteV[k] ?? 0;
		if (lv === 0 || rv === 0) continue;
		if (lv === rv) continue;
		if (JSON.stringify(local[k] ?? null) === JSON.stringify(remote[k] ?? null)) continue;
		fields.push({
			field: k,
			local_value: local[k] ?? null,
			server_value: remote[k] ?? null,
			local_version: lv,
			server_version: rv
		});
	}
	if (fields.length === 0) return null;
	return {
		table,
		row_id: String(remote.id),
		label: rowLabel(remote),
		fields,
		detected_at: Date.now(),
		status: "pending"
	};
}
/**
* Applique une décision champ par champ prise par l'utilisateur.
* Les champs "local" sont renvoyés au serveur via l'outbox ; les champs
* "server" sont simplement conservés dans le cache local.
*/
async function resolvePendingConflict(conflictId, decisions) {
	const db = getSyncDB();
	const conflict = await db.pending_conflicts.get(conflictId);
	if (!conflict) return;
	const cache = db.cache(conflict.table);
	const current = await cache.get(conflict.row_id);
	const patch = {};
	for (const f of conflict.fields) {
		const choice = decisions[f.field] ?? "server";
		patch[f.field] = choice === "local" ? f.local_value : f.server_value;
	}
	if (current) await cache.put({
		...current,
		...patch
	});
	const toPush = conflict.fields.filter((f) => (decisions[f.field] ?? "server") === "local");
	if (toPush.length > 0) {
		const pushPatch = {};
		for (const f of toPush) pushPatch[f.field] = f.local_value;
		await enqueueMutation(conflict.table, "upsert", conflict.row_id, pushPatch);
	}
	await db.pending_conflicts.update(conflictId, {
		status: "resolved",
		resolved_at: Date.now(),
		decisions
	});
	await db.conflicts.add({
		table: conflict.table,
		row_id: conflict.row_id,
		local_versions: Object.fromEntries(conflict.fields.map((f) => [f.field, f.local_version])),
		server_versions: Object.fromEntries(conflict.fields.map((f) => [f.field, f.server_version])),
		winning_fields: toPush.map((f) => f.field),
		resolved_at: Date.now()
	});
}
/**
* Fusion CRDT par champ (LWW-Element-Map) : pour chaque champ, la valeur
* dont le timestamp est le plus récent gagne. Le résultat est un enregistrement
* "gagnant" côté client, uniquement pour le cache local.
*
* Le vrai merge autoritatif se fait côté serveur (trigger bump_field_versions
* + logique des server fns). Cette fonction sert uniquement à afficher un
* état cohérent en attendant la synchro.
*/
function mergeCRDT(local, remote) {
	if (!local) return remote;
	const localV = local._field_versions ?? {};
	const remoteV = remote._field_versions ?? {};
	const merged = { ...remote };
	const mergedVersions = { ...remoteV };
	for (const k of Object.keys(localV)) {
		const lv = localV[k] ?? 0;
		if (lv > (remoteV[k] ?? 0)) {
			merged[k] = local[k];
			mergedVersions[k] = lv;
		}
	}
	merged._field_versions = mergedVersions;
	return merged;
}
/**
* Récupère depuis Supabase toutes les lignes modifiées depuis last_pull_at
* pour chaque table, et met à jour le cache local.
*/
async function pullAll() {
	const db = getSyncDB();
	let pulled = 0;
	const errors = [];
	for (const table of SYNC_TABLES) try {
		const state = await db.sync_state.get(table);
		const since = state?.last_pull_at ?? "1970-01-01T00:00:00Z";
		const { data, error } = await supabase.from(table).select("*").gt("updated_at", since).order("updated_at", { ascending: true }).limit(500);
		if (error) {
			errors.push(`${table}: ${error.message}`);
			continue;
		}
		if (data && data.length > 0) {
			const cache = db.cache(table);
			const detected = [];
			await db.transaction("rw", cache, async () => {
				for (const row of data) {
					const local = await cache.get(row.id);
					const conflict = detectConflict(table, local, row);
					if (conflict) detected.push(conflict);
					const merged = mergeCRDT(local, row);
					await cache.put(merged);
				}
			});
			for (const c of detected) {
				const existing = await db.pending_conflicts.where("table").equals(c.table).filter((p) => p.row_id === c.row_id && p.status === "pending").first();
				if (existing) await db.pending_conflicts.update(existing.id, {
					fields: c.fields,
					detected_at: c.detected_at
				});
				else await db.pending_conflicts.add(c);
			}
		}
		if (data && data.length > 0) {
			const newest = data[data.length - 1].updated_at;
			await db.sync_state.put({
				table,
				last_pull_at: newest,
				last_pull_success: Date.now()
			});
			pulled += data.length;
		} else if (state) await db.sync_state.put({
			...state,
			last_pull_success: Date.now()
		});
		else await db.sync_state.put({
			table,
			last_pull_at: since,
			last_pull_success: Date.now()
		});
	} catch (e) {
		errors.push(`${table}: ${e.message}`);
	}
	return {
		pulled,
		errors
	};
}
/**
* Rejoue l'outbox en FIFO. Chaque entrée appelle directement la Data API
* Supabase (les vraies protections RBAC seront centralisées dans les server
* fns migrées lot par lot). Les échecs 403/409 marquent l'entrée en erreur
* mais ne bloquent pas la file.
*/
async function pushOutbox() {
	const db = getSyncDB();
	const entries = await db.outbox.orderBy("created_at").toArray();
	let pushed = 0;
	let failed = 0;
	for (const entry of entries) try {
		if (entry.op === "delete") {
			const { error } = await supabase.from(entry.table).delete().eq("id", entry.row_id);
			if (error) throw error;
		} else {
			const { error } = await supabase.from(entry.table).upsert({
				...entry.payload,
				id: entry.row_id,
				_client_id: entry.client_id
			});
			if (error) throw error;
		}
		await db.outbox.delete(entry.id);
		pushed++;
	} catch (e) {
		failed++;
		await db.outbox.update(entry.id, {
			attempts: (entry.attempts ?? 0) + 1,
			last_error: e.message
		});
	}
	return {
		pushed,
		failed
	};
}
/**
* Ajoute une mutation dans l'outbox et l'applique optimistement au cache local.
* Utilisé par useOfflineMutation.
*/
async function enqueueMutation(table, op, rowId, payload) {
	const db = getSyncDB();
	const now = Date.now();
	const fieldVersions = {};
	for (const k of Object.keys(payload)) if (!k.startsWith("_") && k !== "id" && k !== "created_at" && k !== "updated_at") fieldVersions[k] = now;
	const entry = {
		table,
		op,
		row_id: rowId,
		payload,
		field_versions: fieldVersions,
		client_id: getClientId(),
		created_at: now,
		attempts: 0
	};
	await db.transaction("rw", db.outbox, db.cache(table), async () => {
		await db.outbox.add(entry);
		if (op === "delete") {
			const existing = await db.cache(table).get(rowId);
			if (existing) await db.cache(table).put({
				...existing,
				_deleted: true
			});
		} else {
			const existing = await db.cache(table).get(rowId);
			const merged = {
				...existing ?? {
					id: rowId,
					updated_at: (/* @__PURE__ */ new Date()).toISOString(),
					_field_versions: {}
				},
				...payload,
				id: rowId,
				_field_versions: {
					...existing?._field_versions ?? {},
					...fieldVersions
				},
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			await db.cache(table).put(merged);
		}
	});
}
/**
* Lance une synchronisation complète : push d'abord (envoyer les modifs locales),
* puis pull (récupérer les modifs distantes).
*/
async function syncNow() {
	if (typeof window === "undefined" || !navigator.onLine) return {
		pushed: 0,
		failed: 0,
		pulled: 0,
		errors: ["offline"]
	};
	const push = await pushOutbox();
	const pull = await pullAll();
	return {
		...push,
		...pull
	};
}
/**
* Retourne l'état de synchro d'un module donné (agrégé sur ses tables).
* Réactif : re-render quand outbox ou sync_state change.
*/
function useModuleSyncStatus(moduleKey) {
	const spec = MODULE_TABLES.find((m) => m.key === moduleKey);
	const online = useOnlineStatus();
	const data = useLiveQuery(async () => {
		if (!spec) return {
			pending: 0,
			errors: 0,
			lastPullAt: null
		};
		const db = getSyncDB();
		let pending = 0;
		let errors = 0;
		let lastPullAt = null;
		for (const t of spec.tables) {
			const p = await db.outbox.where("table").equals(t).toArray();
			pending += p.filter((e) => (e.attempts ?? 0) === 0).length;
			errors += p.filter((e) => (e.attempts ?? 0) > 0).length;
			const s = await db.sync_state.get(t);
			if (s?.last_pull_success) lastPullAt = Math.max(lastPullAt ?? 0, s.last_pull_success);
		}
		return {
			pending,
			errors,
			lastPullAt
		};
	}, [moduleKey], {
		pending: 0,
		errors: 0,
		lastPullAt: null
	});
	let state = "ok";
	if (!spec) state = "idle";
	else if (!online) state = "offline";
	else if (data.errors > 0) state = "error";
	else if (data.pending > 0) state = "pending";
	else if (data.lastPullAt === null) state = "idle";
	return {
		key: moduleKey,
		pending: data.pending,
		errors: data.errors,
		lastPullAt: data.lastPullAt,
		online,
		state
	};
}
/**
* Écoute navigator.onLine / offline.
*/
function useOnlineStatus() {
	const [online, setOnline] = (0, import_react.useState)(typeof navigator === "undefined" ? true : navigator.onLine);
	(0, import_react.useEffect)(() => {
		const up = () => setOnline(true);
		const down = () => setOnline(false);
		window.addEventListener("online", up);
		window.addEventListener("offline", down);
		return () => {
			window.removeEventListener("online", up);
			window.removeEventListener("offline", down);
		};
	}, []);
	return online;
}
/**
* Lance la boucle de synchro en arrière-plan : au montage, à intervalle
* régulier, et à chaque reconnexion réseau. À monter une seule fois
* (dans le layout authentifié).
*/
function useSyncEngine(intervalMs = 3e4) {
	(0, import_react.useEffect)(() => {
		let alive = true;
		const tick = async () => {
			if (!alive) return;
			try {
				await syncNow();
			} catch {}
		};
		tick();
		const id = setInterval(tick, intervalMs);
		const onOnline = () => tick();
		window.addEventListener("online", onOnline);
		return () => {
			alive = false;
			clearInterval(id);
			window.removeEventListener("online", onOnline);
		};
	}, [intervalMs]);
}
//#endregion
export { syncNow as a, useSyncEngine as c, resolvePendingConflict as i, enqueueMutation as n, useModuleSyncStatus as o, getSyncDB as r, useOnlineStatus as s, MODULE_TABLES as t };
