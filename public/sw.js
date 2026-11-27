// INDUS-ERP — Service Worker v2.0.0
// Stratégies :
//  - Assets statiques (JS/CSS/images/polices) : cache-first (stale-while-revalidate)
//  - Navigation (pages) : network-first, repli sur la page en cache, puis sur
//    le "shell" applicatif ("/") qui laisse le routeur client afficher l'écran
//  - Données (API / backend) : network-only ; le cache de données est géré
//    côté application (IndexedDB : TanStack Query + Dexie)
//  - Photos produits / certificats (stockage backend) : cache-first

const VERSION = "v2";
const SHELL_CACHE = `indus-erp-shell-${VERSION}`;
const ASSET_CACHE = `indus-erp-assets-${VERSION}`;
const MEDIA_CACHE = `indus-erp-media-${VERSION}`;
const ALL_CACHES = [SHELL_CACHE, ASSET_CACHE, MEDIA_CACHE];

const SHELL_URLS = ["/", "/manifest.json", "/favicon.svg", "/icon.svg"];
const MEDIA_MAX_ENTRIES = 300;

// ---------------------------------------------------------------------------
// Cycle de vie
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(SHELL_URLS.map((u) => cache.add(u))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// ---------------------------------------------------------------------------
// Routage des requêtes
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Serveur de développement (HMR, modules non figés) : ne jamais mettre en cache
  if (isDevRequest(url)) return;

  // Données backend (REST / auth / realtime) : réseau uniquement.
  // Le cache applicatif (IndexedDB) prend le relais hors-ligne.
  if (isBackendData(url)) return;

  // Médias du stockage backend (photos produits, certificats)
  if (isBackendStorage(url)) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE, MEDIA_MAX_ENTRIES));
    return;
  }

  // Navigation → network-first avec repli sur le shell
  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Assets statiques → cache-first + rafraîchissement en arrière-plan
  if (isStaticAsset(request, url)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  // Autres GET same-origin → network-first
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
  }
});

// ---------------------------------------------------------------------------
// Prédicats
// ---------------------------------------------------------------------------
function isDevRequest(url) {
  if (url.origin !== self.location.origin) return false;
  return (
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/node_modules/") ||
    url.pathname.startsWith("/src/") ||
    url.searchParams.has("t") ||
    url.searchParams.has("import")
  );
}

function isBackendData(url) {
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn/")) return true;
  if (!url.hostname.includes("supabase")) return false;
  return !url.pathname.startsWith("/storage/v1/object/public/");
}

function isBackendStorage(url) {
  return url.hostname.includes("supabase") && url.pathname.startsWith("/storage/v1/object/public/");
}

function isStaticAsset(request, url) {
  return (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font" ||
    /\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|webp|json)$/.test(url.pathname)
  );
}

// ---------------------------------------------------------------------------
// Stratégies
// ---------------------------------------------------------------------------
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  if (cached) return cached;
  const res = await network;
  return res || offlineResponse();
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && (res.ok || res.type === "opaque")) {
      await cache.put(request, res.clone());
      if (maxEntries) trimCache(cache, maxEntries);
    }
    return res;
  } catch {
    return offlineResponse();
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    return cached || offlineResponse();
  }
}

async function navigationHandler(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    // 1) La page exacte visitée précédemment
    const exact = await cache.match(request, { ignoreSearch: true });
    if (exact) return exact;
    // 2) Le shell applicatif : le routeur client affichera la bonne page
    const shell = await cache.match("/");
    if (shell) return shell;
    // 3) Dernier recours : page hors-ligne minimale
    return offlinePage();
  }
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const excess = keys.length - maxEntries;
  for (let i = 0; i < excess; i++) await cache.delete(keys[i]);
}

function offlineResponse() {
  return new Response("", { status: 503, statusText: "Offline" });
}

function offlinePage() {
  return new Response(
    `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hors ligne — INDUS-ERP</title>
<style>
  body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f1923;color:#f0f4f8}
  .c{text-align:center;max-width:420px;padding:2rem}
  h1{font-size:1.5rem;color:#e8751a}
  p{color:#8899aa;margin-top:.5rem;font-size:.9rem;line-height:1.5}
  button{margin-top:1.5rem;min-height:48px;padding:0 1.5rem;border:0;border-radius:8px;background:#e8751a;color:#fff;font-size:1rem;font-weight:600}
</style></head>
<body><div class="c">
  <div style="font-size:3rem;margin-bottom:1rem">📡</div>
  <h1>Vous êtes hors ligne</h1>
  <p>L'application n'a pas encore été chargée sur cet appareil. Connectez-vous une première fois au réseau, ensuite INDUS-ERP fonctionnera sans connexion.</p>
  <button onclick="location.reload()">Réessayer</button>
</div></body></html>`,
    { headers: { "Content-Type": "text/html;charset=UTF-8" } },
  );
}
