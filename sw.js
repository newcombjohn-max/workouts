// Workout Tracker offline copy, published beside index.html on the web link.
// Opens the app from the copy on the phone at once (no signal needed), then fetches
// the published version in the background so the next open has any update.
// Only the app itself is cached; sets and the workbook never pass through here.
const CACHE = "workouts";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add("./")));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return; // fonts etc. go to the network as usual
  // The app is one page: every navigation inside the site is that page
  const key = req.mode === "navigate" ? "./" : req;
  const update = caches.open(CACHE).then(c => fetch(req).then(res => { if (res.ok) c.put(key, res.clone()); return res; }));
  e.respondWith(caches.match(key).then(hit => hit || update));
  e.waitUntil(update.catch(() => {}));
});
