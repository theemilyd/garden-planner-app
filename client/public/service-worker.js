/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.

// Cache names
const CACHE_NAME = 'plantperfectly-cache-v1';
const DATA_CACHE_NAME = 'plantperfectly-data-cache-v1';

// Assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/static/css/main.chunk.css',
  '/offline.html'
];

// API routes to cache
const API_ROUTES = [
  '/api/plants',
  '/api/zones'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for API calls, cache-first for static assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API requests - network first, fallback to cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // If the response was good, clone it and store it in the cache
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Network request failed, try to get it from the cache
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // If the response was good, clone it and store it in the cache
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If both cache and network fail, serve offline page for HTML requests
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
          // Return a default response for other file types
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Function to sync stored form data when back online
async function syncForms() {
  try {
    const db = await openDB();
    const offlineFormData = await db.getAll('offlineForms');
    
    for (const formData of offlineFormData) {
      try {
        const response = await fetch(formData.url, {
          method: formData.method,
          headers: formData.headers,
          body: formData.body
        });
        
        if (response.ok) {
          await db.delete('offlineForms', formData.id);
        }
      } catch (error) {
        console.error('Sync failed for form data:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing forms:', error);
  }
}

// IndexedDB helper for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PlantPerfectlyOfflineDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('offlineForms', { keyPath: 'id', autoIncrement: true });
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
  });
} 