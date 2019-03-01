const cacheName = 'static-v1';
const dataCacheName = 'static-v1-api';
const filesToCache = [
  '/',
  '/index.html',
  '/src/css/index.css',
	'/src/js/index.js',
	'/api/list'
];

// install
self.addEventListener('install', event => {
  console.log('installing…');
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching app ok');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('now ready to handle fetches!');
      event.waitUntil(
      caches.keys().then(function(cacheNames) {
        var promiseArr = cacheNames.map(function(item) {
          if (item !== cacheName) {
            console.log('[ServiceWorker] Removing Cached Files from Cache - ', item);
            return caches.delete(item);
          }
        })
        return Promise.all(promiseArr);
      })
  ); // end event.waitUntil
});

// fetch
self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetch', event.request.url);
  const dataUrl = location.origin;
  console.log('now fetch!');

  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request).then(res => 
        caches.open(dataCacheName)
        .then(function(cache) {
          cache.put(event.request, res.clone());
          return res;
        })
      );
    })
  );
});