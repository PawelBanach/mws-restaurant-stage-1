const staticCacheName = 'mws-static-cache-0';

self.addEventListener('install', event => {
  const urlsToCache = [
    '/',
    '/images/1-270_thumbnail.jpg',
    '/images/2-270_thumbnail.jpg',
    '/images/3-270_thumbnail.jpg',
    '/images/4-270_thumbnail.jpg',
    '/images/5-270_thumbnail.jpg',
    '/images/6-270_thumbnail.jpg',
    '/images/7-270_thumbnail.jpg',
    '/images/8-270_thumbnail.jpg',
    '/images/9-270_thumbnail.jpg',
    '/images/10-270_thumbnail.jpg',
    '/images/default.png',
    '/css/styles.css',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
    'https://maps.gstatic.com/mapfiles/api-3/images/sv9.png',
    'https://maps.gstatic.com/mapfiles/api-3/images/mapcnt6.png',
    'https://maps.gstatic.com/mapfiles/api-3/images/google4.png',
    'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png',
    'https://maps.gstatic.com/mapfiles/api-3/images/cb_scout5.png',
    'https://maps.gstatic.com/mapfiles/openhand_8_8.cur',
    '/index.html',
    '/restaurant.html',
    '/js/dbhelper.js',
    'js/idb.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    'js/service_worker.js',
  ];

  event.waitUntil(
    caches.open(staticCacheName).then( cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then( cacheNames => {
      return Promise.all(
        cacheNames.filter( cacheName => {
          return cacheName.startsWith('restaurant-') && cacheName !== staticCacheName;
        }).map( cacheName => {
          console.log(cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith('/restaurants/')) return;

  event.respondWith(
    caches.open(staticCacheName).then( cache  => {
      return cache.match(event.request).then( response => {
        return response || fetch(event.request).then( response => {
          cache.put(event.request, response.clone());
          return response;
        })
      })
    })
  )
});