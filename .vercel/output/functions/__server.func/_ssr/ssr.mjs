//#region node_modules/.nitro/vite/services/ssr/index.js
var lastCapturedError;
var TTL_MS = 5e3;
function record(error) {
	lastCapturedError = {
		error,
		at: Date.now()
	};
}
if (typeof globalThis.addEventListener === "function") {
	globalThis.addEventListener("error", (event) => record(event.error ?? event));
	globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
function consumeLastCapturedError() {
	if (!lastCapturedError) return void 0;
	if (Date.now() - lastCapturedError.at > TTL_MS) {
		lastCapturedError = void 0;
		return;
	}
	const { error } = lastCapturedError;
	lastCapturedError = void 0;
	return error;
}
function renderErrorPage() {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
var _sentry = null;
function isBrowser() {
	return typeof window !== "undefined";
}
function getDsn() {
	if (isBrowser()) try {
		return;
	} catch {
		return;
	}
	return process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN;
}
function getEnvironment() {
	return "production";
}
function getRelease() {
	return process.env.SENTRY_RELEASE || `indus-erp@${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`;
}
/**
* Initialise Sentry si le DSN est configuré.
* Retourne une Promise — l'appelant peut ignorer le résultat.
*/
async function initSentry() {
	const dsn = getDsn();
	if (!dsn) {
		if (getEnvironment() !== "production") console.info("[Sentry] DSN non configuré. Monitoring désactivé.");
		return;
	}
	try {
		const sentry = isBrowser() ? await import("../_libs/@sentry/react+[...].mjs").then((n) => n.t) : await import("../_libs/@sentry/node+[...].mjs").then((n) => n.t);
		sentry.init({
			dsn,
			environment: getEnvironment(),
			release: getRelease(),
			tracesSampleRate: getEnvironment() === "production" ? .2 : 0,
			replaysSessionSampleRate: isBrowser() && getEnvironment() === "production" ? .1 : 0,
			replaysOnErrorSampleRate: isBrowser() && getEnvironment() === "production" ? 1 : 0,
			enabled: getEnvironment() === "production",
			beforeSend(event) {
				if (getEnvironment() !== "production") {
					console.info("[Sentry] Event capturé (non envoyé en dev):", event.exception?.values?.[0]?.value);
					return null;
				}
				return event;
			}
		});
		_sentry = sentry;
		console.info(`[Sentry] Initialisé (${isBrowser() ? "client" : "serveur"})`);
	} catch (error) {
		console.warn("[Sentry] Erreur d'initialisation:", error);
	}
}
/**
* Capture une exception et l'envoie à Sentry.
*/
function captureException(error, context) {
	if (!_sentry) return "";
	return _sentry.captureException(error, context);
}
var LOG_LEVELS = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
	fatal: 4
};
function getMinLevel() {
	return typeof process !== "undefined" && process.env.LOG_LEVEL || "info";
}
function formatTimestamp() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function formatLog(entry) {
	const parts = [`[${entry.timestamp}]`, entry.level.toUpperCase().padEnd(5)];
	if (entry.context) parts.push(`[${entry.context}]`);
	parts.push(entry.message);
	if (entry.metadata && Object.keys(entry.metadata).length > 0) try {
		parts.push(JSON.stringify(entry.metadata, null, 0));
	} catch {
		parts.push("[unserializable metadata]");
	}
	return parts.join(" ");
}
function log(level, message, context, metadata) {
	if (LOG_LEVELS[level] < LOG_LEVELS[getMinLevel()]) return;
	const formatted = formatLog({
		timestamp: formatTimestamp(),
		level,
		context,
		message,
		metadata
	});
	switch (level) {
		case "debug":
		case "info":
			console.log(formatted);
			break;
		case "warn":
			console.warn(formatted);
			break;
		case "error":
		case "fatal":
			console.error(formatted);
			break;
	}
}
var logger = {
	debug: (message, metadata) => log("debug", message, void 0, metadata),
	info: (message, metadata) => log("info", message, void 0, metadata),
	warn: (message, metadata) => log("warn", message, void 0, metadata),
	error: (message, metadata) => log("error", message, void 0, metadata),
	fatal: (message, metadata) => log("fatal", message, void 0, metadata),
	/**
	* Logger avec contexte.
	* Exemple: logger.withContext("stock-movement").info("Entrée enregistrée", { productId, quantity });
	*/
	withContext: (context) => ({
		debug: (message, metadata) => log("debug", message, context, metadata),
		info: (message, metadata) => log("info", message, context, metadata),
		warn: (message, metadata) => log("warn", message, context, metadata),
		error: (message, metadata) => log("error", message, context, metadata),
		fatal: (message, metadata) => log("fatal", message, context, metadata)
	})
};
initSentry().catch((e) => logger.warn("Sentry init failed", { error: String(e) }));
var serverEntryPromise;
async function getServerEntry() {
	if (!serverEntryPromise) serverEntryPromise = import("./server-DDLtrRt6.mjs").then((m) => m.default ?? m);
	return serverEntryPromise;
}
async function normalizeCatastrophicSsrResponse(response) {
	if (response.status < 500) return response;
	if (!(response.headers.get("content-type") ?? "").includes("application/json")) return response;
	const body = await response.clone().text();
	if (!isH3SwallowedErrorBody(body)) return response;
	logger.error("h3 swallowed SSR error", { error: String(consumeLastCapturedError() ?? new Error(body)) });
	return new Response(renderErrorPage(), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
function isH3SwallowedErrorBody(body) {
	try {
		const payload = JSON.parse(body);
		return payload.unhandled === true && payload.message === "HTTPError";
	} catch {
		return false;
	}
}
var server_default = { async fetch(request, env, ctx) {
	try {
		return await normalizeCatastrophicSsrResponse(await (await getServerEntry()).fetch(request, env, ctx));
	} catch (error) {
		console.error(error);
		captureException(error, { route: "server_entry" });
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
} };
//#endregion
export { server_default as default, initSentry as n, renderErrorPage as r, captureException as t };
