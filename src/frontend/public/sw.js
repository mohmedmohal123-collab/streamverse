const STATIC_CACHE = 'streamverse-static-v1';
const DYNAMIC_CACHE = 'streamverse-dynamic-v1';
const OFFLINE_CACHE = 'streamverse-offline-v1';

// App shell files to precache
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Cache static assets patterns
const STATIC_PATTERNS = [
  /\.(js|css|woff2?|ttf|otf|eot)$/,
  /\/icons\//,
  /\/assets\//,
];

// API/dynamic patterns — use network-first
const API_PATTERNS = [
  /\/api\//,
  /canister/,
  /icp-api/,
  /raw\.ic0\.app/,
  /boundary\.ic0\.app/,
  /rapidapi\.com/,
  /googleapis\.com/,
  /vimeo\.com\/me/,
  /ytstream-download/,
  /youtube-mp36/,
  /all-media-downloader/,
  /tiktok-downloader/,
  /kwai.*rapidapi/,
];

// Install: precache app shell and skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] Failed to precache some files:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  const KEEP = [STATIC_CACHE, DYNAMIC_CACHE, OFFLINE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !KEEP.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Message: handle CACHE_THUMBNAIL requests from the app and SKIP_WAITING
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data && event.data.type === 'CACHE_THUMBNAIL') {
    const url = event.data.url;
    if (url) {
      caches.open(OFFLINE_CACHE).then((cache) => {
        fetch(url, { mode: 'no-cors' })
          .then((response) => cache.put(url, response))
          .catch(() => {}); // silently ignore failures
      });
    }
  }
});

// Fetch: routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // Network-first for API calls and canister requests
  if (API_PATTERNS.some((p) => p.test(url.href))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts, icons)
  if (STATIC_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // For navigation requests (HTML pages), use network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Cache-first for offline thumbnail cache (images cached via CACHE_THUMBNAIL message)
  if (OFFLINE_CACHE && (url.pathname.match(/\.(jpg|jpeg|png|webp|gif)$/) || url.hostname.includes('ytimg.com') || url.hostname.includes('vumbnail.com') || url.hostname.includes('i.vimeocdn.com'))) {
    event.respondWith(offlineImageHandler(request));
    return;
  }

  // Default: stale-while-revalidate for everything else
  event.respondWith(staleWhileRevalidate(request));
});

// ─── Push Notifications ───────────────────────────────────────────────────────

// Push event: show notification when received
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'StreamVerse', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'StreamVerse';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'streamverse-notification',
    data: { url: data.url || '/' },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click: open the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Notification close event (user dismissed)
self.addEventListener('notificationclose', () => {
  // Analytics hook — no-op for now
});

// Cache-first strategy: serve from cache, fallback to network, store in cache
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy: try network, fallback to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Navigation handler: network-first, serve index.html offline
async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Serve cached index.html for SPA navigation when offline
    const cached =
      (await caches.match(request)) ||
      (await caches.match('/index.html')) ||
      (await caches.match('/'));
    if (cached) return cached;
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>StreamVerse — Offline</title>
      <style>body{background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}
      h1{color:#06b6d4}p{color:#aaa}</style></head>
      <body><div><h1>StreamVerse</h1><p>أنت غير متصل بالإنترنت | You're offline</p><p>تحقق من اتصالك وأعد المحاولة | Check your connection and try again</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Offline image handler: serve from offline cache first, then stale-while-revalidate
async function offlineImageHandler(request) {
  const offlineCached = await caches.match(request, { cacheName: OFFLINE_CACHE });
  if (offlineCached) return offlineCached;
  return staleWhileRevalidate(request);
}

// Stale-while-revalidate: serve from cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request).then((response) => {
    if (response.ok) {
      caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);

  return cached || (await networkPromise) || new Response('Offline', { status: 503 });
}
