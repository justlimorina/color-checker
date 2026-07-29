const CACHE_NAME = 'color-checker-v9';
const ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'assets/styles.css',
    'assets/images/amelia_logo.svg',
    'assets/images/logo-black.svg',
    'assets/images/logo-white.svg',
    'assets/script/config.js',
    'assets/script/utils.js',
    'assets/script/colornames.bestof.js',
    'assets/script/shared/layout.js',
    'generator/',
    'generator/index.html',
    'generator/script.js',
    'image-extractor/',
    'image-extractor/index.html',
    'image-extractor/script.js',
    'md3-theme-creator/',
    'md3-theme-creator/index.html',
    'md3-theme-creator/script.js',
    'contrast-checker/',
    'contrast-checker/index.html',
    'contrast-checker/script.js',
    'matrix/',
    'matrix/index.html',
    'matrix/script.js',
    'css-gradient-generator/',
    'css-gradient-generator/index.html',
    'css-gradient-generator/script.js',
    'https://esm.sh/@material/web/all.js',
    'https://esm.sh/@material/material-color-utilities',
    'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Roboto+Slab:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
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
