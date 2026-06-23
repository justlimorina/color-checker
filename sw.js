const CACHE_NAME = 'color-checker-v4';
const ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'assets/styles.css',
    'assets/logo.svg',
    'assets/script/app.js',
    'assets/script/config.js',
    'assets/script/events.js',
    'assets/script/features.js',
    'assets/script/navigation.js',
    'assets/script/sidebar.js',
    'assets/script/state.js',
    'assets/script/ui.js',
    'assets/script/utils.js',
    'assets/script/colornames.bestof.js'
];

// Install Event - cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - stale-while-revalidate / dynamic caching
self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Stale-While-Revalidate strategy
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const isLocal = networkResponse.type === 'basic';
                    const isCDN = event.request.url.startsWith('https://esm.sh/') || event.request.url.includes('google');
                    
                    if (isLocal || isCDN) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                }
                return networkResponse;
            }).catch(() => {
                // If network fails and there is no cache, handle fallback
                if (!cachedResponse && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('index.html');
                }
            });

            return cachedResponse || fetchPromise;
        })
    );
});
