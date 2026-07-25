var CACHE = 'ofc-crm-v5';
var ASSETS = ['./crm.html', './facturation.html', './dashboard.html', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.all(ASSETS.map(function(url) {
        return fetch(url, {cache: 'reload'}).then(function(resp) { return cache.put(url, resp); });
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Network first, en forçant à ignorer le cache HTTP du navigateur : toujours la dernière version si connecté, cache seulement si offline
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request, {cache: 'no-store'}).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
