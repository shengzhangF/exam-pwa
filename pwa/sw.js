const CACHE = 'exammaster-v10';
const ASSETS = ['./', './index.html', './manifest.json', './questions.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(err => {
      console.warn('SW install: some assets failed to cache', err);
    }))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  try {
    const url = new URL(e.request.url);
    if (url.origin !== self.location.origin) return;

    // Network-first for questions.json — bypass HTTP cache
    if (url.pathname.endsWith('questions.json')) {
      e.respondWith(
        fetch(e.request, { cache: 'no-cache' }).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() =>
          caches.match(e.request).then(c => c || new Response('[]', {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }))
        )
      );
      return;
    }

    // Network-first for exam paper JSON (today-exam.json)
    if (url.pathname.includes('/exam/paper/') && url.pathname.endsWith('.json')) {
      e.respondWith(
        fetch(e.request, { cache: 'no-cache' }).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() =>
          caches.match(e.request)
        )
      );
      return;
    }

    // Network-first for HTML pages — bypass HTTP cache
    if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
      e.respondWith(
        fetch(e.request, { cache: 'no-cache' }).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() =>
          caches.match(e.request).then(c => c || fetch(e.request, { cache: 'no-cache' }).catch(() =>
            new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
          ))
        )
      );
      return;
    }

    // Cache-first for static assets
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request, { cache: 'no-cache' }).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached || new Response('Offline', { status: 503 }))
      )
    );
  } catch(err) {
    // If the SW handler itself throws, let the request go to network
  }
});
