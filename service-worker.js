const urlsToCache = [
  "./",
  "./index.html",
  "./restaurant.html",
  "./css/styles.css",
  "./js/main.js",
  "./js/restaurant_info.js",
  "./js/dbhelper.js",
  "./data/restaurants.json",
  "./img/1.jpg",
  "./img/2.jpg",
  "./img/3.jpg",
  "./img/4.jpg",
  "./img/5.jpg",
  "./img/6.jpg",
  "./img/7.jpg",
  "./img/8.jpg",
  "./img/9.jpg",
  "./img/10.jpg"
];

const CACHE_NAME = "restaurant-reviews";

/**
 * Install Event: Install a Service Worker
 */

self.addEventListener("install", event => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    // Create (or Open) a Cache
    caches
      .open(CACHE_NAME)
      .then(cache => {
        // Add all Requests-Response Pairs (Files needed Offline)
        // in the Created Cache
        console.log("Service Worker: Caching Files");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate Event: Update the Service Worker
 */
self.addEventListener("activate", event => {
  console.log("Service Worker: Activated");

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache(s)", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * Fetch Event: Fetch Content when Offline
 */

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // IMPORTANT: Clone the Response. A Response is a Stream and
        // can only be consumed once. So, the Clone is added to the
        // Cache and the Original is returned to the Browser.
        console.log(
          `Service Worker: Fetching response from network ${event.request.url}`
        );
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache =>
          // Add a Response to the Cache
          cache.put(event.request, responseToCache)
        );
        return response;
      })
      .catch(() =>
        // Check all the Cache(s) in the Browser to Find
        // the Matched Request in Any of Them
        caches.match(event.request).then(response => {
          // Return Matched Response from Cached Request-Response Pairs
          // Stored in the Browser
          console.log(
            `Service worker: Fetching response stored in cache ${event.request.url.clone()}`
          );
          return response;
        })
      )
  );
});
