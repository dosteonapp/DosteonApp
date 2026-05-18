// Dosteon PWA Service Worker
const CACHE_NAME = "dosteon-pwa-cache-v1";
const OFFLINE_URL = "/offline.html";

// Assets to pre-cache immediately on install
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/favicon-96x96.png",
  "/favicon.ico",
  "/placeholder-logo.svg",
  "/placeholder.svg"
];

// Install event - caches precache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Pre-caching offline fallback and main icons");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Force activation immediately
  );
});

// Activate event - cleans up older caches and claims active clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[Service Worker] Removing old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Immediately take control of all clients
  );
});

// Fetch event - intercepts network requests
self.addEventListener("fetch", (event) => {
  // Only handle GET requests (exclude POST, PUT, DELETE, etc.)
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. Bypass Service Worker entirely for backend API calls and telemetry
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("posthog.com")
  ) {
    return;
  }

  // 2. Page Navigation Requests: STRICT Network-First with Offline Fallback
  // This guarantees that the UI documents are NEVER loaded from a stale cache when online.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // If the page was fetched successfully, we do NOT cache it to avoid stale UI.
          // We simply return the fresh response.
          return networkResponse;
        })
        .catch((error) => {
          console.log("[Service Worker] Network request failed; serving offline fallback page.", error);
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 3. Static JS/CSS Build Chunks & Google Fonts: Stale-While-Revalidate
  // Since Next.js uses content-hashing for production files (_next/static/*), these are safe to cache.
  // When a new build is deployed, the fresh HTML (from Network-First) will reference new chunk hashes,
  // prompting the browser to fetch the new files and cache them.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("fonts.googleapis.com")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse); // Silence network failures if we have a cache

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 4. Static Images and Local Icons: Cache-First
  // Cache standard UI images/icons. If they change, we update their names or caching version.
  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) &&
    !url.pathname.includes("supabase") // Avoid caching Supabase media uploads aggressively
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch(() => {
            // If offline and request is an image, we can return a placeholder SVG if cached
            return caches.match("/placeholder.svg");
          });
      })
    );
  }
});
