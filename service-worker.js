const CACHE_NAME = 'ai-chat-cache-v2';
const STATIC_CACHE = 'ai-chat-static-v2';
const DYNAMIC_CACHE = 'ai-chat-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/keyboard-shortcuts.js',
  '/code-execution.js',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-16x16.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js'
];

// Maximum number of entries to keep in the dynamic cache
const MAX_DYNAMIC_CACHE_ITEMS = 50;

// Install event - cache critical assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Limit the size of dynamic cache
async function trimCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();
    
    if (keys.length > MAX_DYNAMIC_CACHE_ITEMS) {
      console.log('[Service Worker] Trimming dynamic cache');
      await cache.delete(keys[0]);
      await trimCache(); // Recursively trim until we're under the limit
    }
  } catch (error) {
    console.error('[Service Worker] Error trimming cache:', error);
  }
}

// Helper function to determine if a request is for an API or external resource
function isApiOrExternalRequest(url) {
  return (
    url.includes('puter.com') || 
    url.includes('openai.com') || 
    url.includes('anthropic.com') || 
    url.includes('googleapis.com') ||
    url.includes('deepseek.ai')
  );
}

// Helper function to determine if a request is for a static asset
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => {
    // Convert both to URL objects to compare only the pathname
    if (asset.startsWith('http')) {
      return url.includes(asset);
    } else {
      const assetPath = new URL(asset, self.location.origin).pathname;
      const urlPath = new URL(url).pathname;
      return urlPath === assetPath;
    }
  });
}

// Helper function for network response handling
async function stashInCache(request, cacheName, response) {
  const cache = await caches.open(cacheName);
  cache.put(request, response.clone());
}

// Fetch event - implement advanced caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Handle same-origin requests
  if (url.origin === self.location.origin || 
      url.hostname === 'cdn.tailwindcss.com' || 
      url.hostname === 'cdnjs.cloudflare.com' ||
      url.hostname === 'cdn.jsdelivr.net') {
      
    // Static assets - Cache First strategy
    if (isStaticAsset(request.url)) {
      event.respondWith(
        caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              // Return the cached response but update cache in background
              const fetchPromise = fetch(request)
                .then(networkResponse => {
                  if (networkResponse && networkResponse.ok) {
                    stashInCache(request, STATIC_CACHE, networkResponse);
                  }
                  return networkResponse;
                })
                .catch(error => {
                  console.log('[Service Worker] Network error updating static asset:', error);
                });
                
              return cachedResponse;
            }
            
            // If not in cache, fetch from network and cache
            return fetch(request)
              .then(networkResponse => {
                if (!networkResponse || !networkResponse.ok) {
                  throw new Error('Network fetch failed');
                }
                
                stashInCache(request, STATIC_CACHE, networkResponse);
                return networkResponse.clone();
              })
              .catch(error => {
                console.error('[Service Worker] Fetch failed for static asset:', error);
                
                // Return offline page for HTML requests
                if (request.headers.get('Accept').includes('text/html')) {
                  return caches.match('/offline.html');
                }
                
                // Could provide fallback images, etc here
                return new Response('Not available offline', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/plain'
                  })
                });
              });
          })
      );
      return;
    }
    
    // Dynamic content - Stale While Revalidate strategy
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // Return cached response immediately (if we have it)
          // while fetching an updated version in the background
          const fetchPromise = fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.ok) {
                stashInCache(request, DYNAMIC_CACHE, networkResponse)
                  .then(() => trimCache());
              }
              return networkResponse;
            })
            .catch(error => {
              console.log('[Service Worker] Network error fetching dynamic content:', error);
            });
          
          return cachedResponse || fetchPromise;
        })
        .catch(() => {
          // If both cache and network fail, provide fallback
          if (request.headers.get('Accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
          return new Response('Not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        })
    );
    return;
  }
  
  // For API requests, use Network First strategy
  if (isApiOrExternalRequest(request.url)) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // Don't cache API responses to avoid stale data issues
          return networkResponse;
        })
        .catch(error => {
          console.log('[Service Worker] Network error fetching API:', error);
          return caches.match(request);
        })
    );
    return;
  }
  
  // Default strategy for everything else
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline operation
self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Placeholder for syncing messages when back online
async function syncMessages() {
  // This would be implemented to sync any pending messages from IndexedDB
  console.log('[Service Worker] Syncing messages...');
  // Implementation would go here
}
