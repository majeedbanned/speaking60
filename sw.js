/* Offline support. Bump VERSION on every deploy that changes a cached file other than index.html. */
const VERSION = "sp60-v1";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-180.png",
  "./fonts/vazirmatn-var.woff2", "./fonts/source-sans-3-var.woff2", "./fonts/source-sans-3-var-italic.woff2", "./fonts/jetbrains-mono-400.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// The page itself: network first (so updates arrive), cached copy when offline or the network is slow.
async function pageFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000))]);
    if (res && res.ok) cache.put("./index.html", res.clone());
    return res;
  } catch (err) {
    return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
  }
}
// Fonts, icons, manifest: cache first.
async function assetFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/")) e.respondWith(pageFirst(req));
  else e.respondWith(assetFirst(req));
});
