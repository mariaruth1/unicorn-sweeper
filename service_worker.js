const CACHE_NAME = "unicorn-sweeper";
const ASSETS = [
  "index.html",
  "style.css",
  "game.js",
  "background.jpg",
  "unicorn_large.png",
  "unicorn.png",
  "wand.png",
];

// Install the service worker and cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Serve files from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
