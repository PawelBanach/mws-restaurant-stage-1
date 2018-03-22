var staticCacheName = 'restaurant-reviews-static-3';

self.addEventListener('install', function(event) {
  var urlsToCache = [
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
    '/data/restaurants.json',
    '/css/styles.css',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/index.html',
    '/restaurant.html',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
    'https://maps.gstatic.com/mapfiles/api-3/images/sv9.png',
    'https://maps.gstatic.com/mapfiles/api-3/images/mapcnt6.png',
    'https://maps.gstatic.com/mapfiles/api-3/images/google4.png',
    'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png',
    'https://maps.gstatic.com/mapfiles/api-3/images/cb_scout5.png',
    'https://maps.gstatic.com/mapfiles/openhand_8_8.cur'
  ];

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('active', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promis.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-') && cacheName != staticCacheName;
        }).map(function (cacheName) {
          return cache.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) return response;
      return fetch(event.request);
    })
  );
});